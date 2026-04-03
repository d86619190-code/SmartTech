import * as React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LoginForm } from "@/widgets/LoginForm";
import { clearAuthSession, readAuthSession, saveAuthSession, type AuthSession } from "@/shared/lib/authSession";
import {
  getMe,
  loginWithGoogleCredential,
  sendEmailCode,
  sendPhoneCode,
  verifyEmailCode,
  verifyPhoneCode,
} from "@/shared/lib/authApi";
import { useStatusToast } from "@/shared/lib/useStatusToast";
import { buildHashAppUrl } from "@/shared/lib/appPublicOrigin";
import { StatusToast } from "@/shared/ui/StatusToast/StatusToast";
import cls from "./LoginPage.module.css";

function useAuthSearchParams(location: ReturnType<typeof useLocation>) {
  return React.useMemo(() => {
    if (typeof window === "undefined") return new URLSearchParams();
    const fromRouter = (location.search ?? "").replace(/^\?/, "");
    if (fromRouter.length > 0) return new URLSearchParams(fromRouter);
    const h = window.location.hash;
    const q = h.indexOf("?");
    if (q === -1) return new URLSearchParams();
    return new URLSearchParams(h.slice(q + 1));
  }, [location.search, location.pathname, location.hash]);
}

function decodeSessionParam(raw: string): AuthSession | null {
  try {
    const json = decodeURIComponent(window.atob(raw));
    const parsed = JSON.parse(json) as AuthSession;
    if (!parsed?.accessToken || !parsed?.refreshToken || !parsed?.user?.id || !parsed?.user?.role) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function encodeSessionParam(session: AuthSession): string {
  const json = JSON.stringify(session);
  return window.btoa(encodeURIComponent(json));
}

/** evrenyan://auth или URL с уже заданным query */
function appendSessionToCallbackUrl(callbackBase: string, encodedSession: string): string {
  const sep = callbackBase.includes("?") ? "&" : "?";
  return `${callbackBase}${sep}session=${encodeURIComponent(encodedSession)}`;
}

/** Локальный мост: сессия в теле POST — иначе GET превышает лимит URL («страница недоступна»). */
function isLocalAuthBridgeUrl(callbackUrl: string): boolean {
  try {
    const u = new URL(callbackUrl);
    return u.protocol === "http:" && (u.hostname === "127.0.0.1" || u.hostname === "localhost");
  } catch {
    return false;
  }
}

function redirectSessionToElectronBridge(callbackBase: string, encodedSession: string): void {
  if (isLocalAuthBridgeUrl(callbackBase)) {
    const form = document.createElement("form");
    form.method = "POST";
    form.action = callbackBase;
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = "session";
    input.value = encodedSession;
    form.appendChild(input);
    document.body.appendChild(form);
    form.submit();
    return;
  }
  window.location.href = appendSessionToCallbackUrl(callbackBase, encodedSession);
}

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isElectronBrowserRoute = location.pathname === "/login/electron";
  const search = useAuthSearchParams(location);
  const initialMode = React.useMemo((): "login" | "register" => {
    if (isElectronBrowserRoute) return "register";
    if (search?.get("mode") === "register") return "register";
    return "login";
  }, [isElectronBrowserRoute, search]);
  const [mode, setMode] = React.useState<"login" | "register">(initialMode);
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [authMethod, setAuthMethod] = React.useState<"phone" | "email">("email");
  const [code, setCode] = React.useState("");
  const [codeTone, setCodeTone] = React.useState<"idle" | "success" | "error">("idle");
  const [otpPhase, setOtpPhase] = React.useState<"contact" | "code">("contact");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast, showToast, closeToast } = useStatusToast();
  const isBrowser = typeof window !== "undefined";
  const isElectron = isBrowser ? /Electron/i.test(navigator.userAgent) : false;
  const electronCallbackRaw = search?.get("electronCallback")?.trim();
  const [authBridgeOrigin, setAuthBridgeOrigin] = React.useState<string | null>(null);
  const [authBridgeChecked, setAuthBridgeChecked] = React.useState(false);

  React.useEffect(() => {
    if (!isBrowser || !isElectron) {
      setAuthBridgeChecked(true);
      return;
    }
    void (async () => {
      try {
        const o = await window.evrenyanDesktop?.getAuthBridgeOrigin?.();
        setAuthBridgeOrigin(o ?? null);
      } finally {
        setAuthBridgeChecked(true);
      }
    })();
  }, [isBrowser, isElectron]);

  /** Системный браузер после входа: сначала localhost в приложении, иначе evrenyan:// */
  const resolvedElectronCallback = React.useMemo(() => {
    if (electronCallbackRaw) return electronCallbackRaw;
    if (authBridgeOrigin) return `${authBridgeOrigin.replace(/\/$/, "")}/auth-callback`;
    return "evrenyan://auth";
  }, [electronCallbackRaw, authBridgeOrigin]);
  /** Во вкладке браузера isElectron=false — редирект в приложение только по флагу из URL */
  const electronBridgeOn = search?.get("electronBridge") === "1";
  const nextPathRaw = search?.get("next") ?? "";
  const nextPath = nextPathRaw.startsWith("/") ? nextPathRaw : "/profile";

  React.useEffect(() => {
    if (isElectronBrowserRoute) setMode("register");
  }, [isElectronBrowserRoute]);

  React.useEffect(() => {
    if (!isBrowser) return;
    const incoming = search?.get("electronSession");
    if (isElectron && incoming === "__ipc__") {
      let cancelled = false;
      void (async () => {
        try {
          const raw = await window.evrenyanDesktop?.consumePendingSession?.();
          if (cancelled || !raw) return;
          const restored = decodeSessionParam(raw);
          if (restored) {
            saveAuthSession(restored);
            navigate(nextPath, { replace: true });
          }
        } catch {
          // noop
        }
      })();
      return () => {
        cancelled = true;
      };
    }
    if (isElectron && incoming && incoming !== "__ipc__") {
      const restored = decodeSessionParam(incoming);
      if (restored) {
        saveAuthSession(restored);
        navigate(nextPath, { replace: true });
        return;
      }
    }
    const session = readAuthSession();
    if (!session) return;
    let cancelled = false;
    void (async () => {
      try {
        await getMe();
        if (!cancelled) navigate(nextPath, { replace: true });
      } catch {
        // Сессия в localStorage могла быть протухшей: очищаем и остаёмся на логине.
        clearAuthSession();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isBrowser, isElectron, navigate, nextPath, search]);

  const handleSendCode = React.useCallback(async () => {
    try {
      setIsSubmitting(true);
      let devCode: string | undefined;
      if (authMethod === "phone") {
        ({ devCode } = await sendPhoneCode(phone));
      } else {
        ({ devCode } = await sendEmailCode(email.trim().toLowerCase()));
      }
      setCode("");
      setCodeTone("idle");
      setOtpPhase("code");
      const baseHint =
        authMethod === "phone" ? "Код отправлен. Проверьте SMS." : "Код отправлен. Проверьте email.";
      const showDev =
        Boolean(devCode) && import.meta.env.DEV;
      showToast("success", showDev ? `${baseHint} (локально) Код: ${devCode}` : baseHint);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Не удалось отправить код";
      showToast("error", msg);
    } finally {
      setIsSubmitting(false);
    }
  }, [authMethod, email, phone, showToast]);

  const handleBackToContact = React.useCallback(() => {
    setOtpPhase("contact");
    setCode("");
    setCodeTone("idle");
  }, []);

  const handleVerifyCode = React.useCallback(async () => {
    try {
      setIsSubmitting(true);
      const session =
        authMethod === "phone"
          ? await verifyPhoneCode(phone, code, mode === "register" ? name : undefined)
          : await verifyEmailCode(email.trim().toLowerCase(), code, mode === "register" ? name : undefined);
      setCodeTone("success");
      if (electronBridgeOn) {
        const encoded = encodeSessionParam(session);
        redirectSessionToElectronBridge(resolvedElectronCallback, encoded);
        return;
      }
      showToast("success", mode === "register" ? "Регистрация выполнена" : "Вход выполнен");
      navigate(nextPath, { replace: true });
    } catch (e) {
      setCodeTone("error");
      const msg = e instanceof Error ? e.message : "Не удалось войти по коду";
      showToast("error", msg);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    authMethod,
    code,
    electronBridgeOn,
    resolvedElectronCallback,
    email,
    mode,
    name,
    navigate,
    nextPath,
    phone,
    showToast,
  ]);

  const handleGoogleCredential = React.useCallback(async (credential: string) => {
    try {
      setIsSubmitting(true);
      const session = await loginWithGoogleCredential(credential);
      if (electronBridgeOn) {
        const encoded = encodeSessionParam(session);
        redirectSessionToElectronBridge(resolvedElectronCallback, encoded);
        return;
      }
      showToast("success", "Успешный вход через Google");
      navigate(nextPath, { replace: true });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Не удалось войти через Google";
      showToast("error", msg);
    } finally {
      setIsSubmitting(false);
    }
  }, [electronBridgeOn, resolvedElectronCallback, navigate, nextPath, showToast]);

  const buildElectronBrowserUrl = React.useCallback(() => {
    const params = new URLSearchParams({ electronBridge: "1" });
    params.set("electronCallback", resolvedElectronCallback);
    if (nextPath) params.set("next", nextPath);
    params.set("mode", "register");
    return buildHashAppUrl("/login/electron", params);
  }, [resolvedElectronCallback, nextPath]);

  const handleOpenAuthInBrowser = React.useCallback(() => {
    if (!isBrowser) return;
    const target = buildElectronBrowserUrl();
    if (!target) {
      showToast(
        "error",
        "Для входа через браузер задайте VITE_APP_ORIGIN при сборке фронта — URL сайта (например https://app.example.com).",
      );
      return;
    }
    window.open(target, "_blank", "noopener,noreferrer");
    showToast("success", "Открыл браузер. После входа по коду откроется приложение.");
  }, [buildElectronBrowserUrl, isBrowser, showToast]);

  const handleGoogleOpenInBrowser = React.useCallback(() => {
    if (!isBrowser) return;
    const params = new URLSearchParams({ electronBridge: "1" });
    params.set("electronCallback", resolvedElectronCallback);
    if (nextPath) params.set("next", nextPath);
    const target = buildHashAppUrl("/login/electron", params);
    if (!target) {
      showToast(
        "error",
        "Для входа через браузер задайте VITE_APP_ORIGIN при сборке фронта — URL сайта (например https://app.example.com).",
      );
      return;
    }
    window.open(target, "_blank", "noopener,noreferrer");
    showToast("success", "Открыл браузер для входа через Google");
  }, [resolvedElectronCallback, isBrowser, nextPath, showToast]);

  const pageTitle = isElectronBrowserRoute ? "Регистрация для приложения" : "Вход";
  const showBrowserBridgeHint = electronBridgeOn || isElectronBrowserRoute;

  return (
    <div className={cls.shell}>
      <div className={cls.center}>
        <div className={cls.authColumn}>
          {showBrowserBridgeHint ? (
            <p className={cls.electronHint} role="status">
              {electronBridgeOn
                ? "После входа сессия отправляется в приложение на 127.0.0.1 (без длинной ссылки в адресе). Запасной вариант — ссылка evrenyan://."
                : "Страница для регистрации и входа по коду из приложения на ПК."}
            </p>
          ) : null}
          <h1 className={cls.title}>{pageTitle}</h1>
          <LoginForm
            mode={mode}
            name={name}
            phone={phone}
            email={email}
            authMethod={authMethod}
            otpPhase={otpPhase}
            code={code}
            codeTone={codeTone}
            isSubmitting={isSubmitting}
            onPhoneChange={(v) => {
              setPhone(v);
              setOtpPhase("contact");
              setCode("");
              if (codeTone !== "idle") setCodeTone("idle");
            }}
            onEmailChange={(v) => {
              setEmail(v);
              setOtpPhase("contact");
              setCode("");
              if (codeTone !== "idle") setCodeTone("idle");
            }}
            onAuthMethodChange={(m) => {
              setAuthMethod(m);
              setOtpPhase("contact");
              setCode("");
              if (codeTone !== "idle") setCodeTone("idle");
            }}
            onCodeChange={(value) => {
              setCode(value);
              if (codeTone !== "idle") setCodeTone("idle");
            }}
            onNameChange={setName}
            onModeChange={(m) => {
              setMode(m);
              setOtpPhase("contact");
              setCode("");
              setCodeTone("idle");
            }}
            onBackToContact={handleBackToContact}
            onSendCode={handleSendCode}
            onVerifyCode={handleVerifyCode}
            onGoogleCredential={handleGoogleCredential}
            onGoogleOpenInBrowser={handleGoogleOpenInBrowser}
            onOpenAuthInBrowser={isElectron ? handleOpenAuthInBrowser : undefined}
            openInBrowserPending={isElectron && !authBridgeChecked}
          />
        </div>
      </div>
      {toast ? <StatusToast tone={toast.tone} message={toast.message} onClose={closeToast} /> : null}
    </div>
  );
};
