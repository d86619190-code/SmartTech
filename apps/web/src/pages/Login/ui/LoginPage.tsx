import * as React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LoginForm } from "@/widgets/LoginForm";
import { PageHeader } from "@/widgets/PageHeader";
import { clearAuthSession, readAuthSession, saveAuthSession, type AuthSession } from "@/shared/lib/authSession";
import { getMe, loginWithGoogleCredential, sendPhoneCode, verifyPhoneCode } from "@/shared/lib/authApi";
import { useStatusToast } from "@/shared/lib/useStatusToast";
import { StatusToast } from "@/shared/ui/StatusToast/StatusToast";
import cls from "./LoginPage.module.css";

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

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = React.useState<"login" | "register">("login");
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [code, setCode] = React.useState("");
  const [devCode, setDevCode] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast, showToast, closeToast } = useStatusToast();
  const isBrowser = typeof window !== "undefined";
  const isElectron = isBrowser ? /Electron/i.test(navigator.userAgent) : false;
  const search = React.useMemo(() => {
    if (!isBrowser) return null;
    return new URLSearchParams(location.search || window.location.search);
  }, [isBrowser, location.search]);
  const electronCallback = search?.get("electronCallback");
  const electronBridge = isElectron && search?.get("electronBridge") === "1";
  const nextPathRaw = search?.get("next") ?? "";
  const nextPath = nextPathRaw.startsWith("/") ? nextPathRaw : "/profile";

  React.useEffect(() => {
    if (!isBrowser) return;
    const incoming = search?.get("electronSession");
    if (isElectron && incoming) {
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
      const res = await sendPhoneCode(phone);
      setDevCode(res.devCode ?? null);
      showToast("success", "Код отправлен. Проверьте SMS.");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Не удалось отправить код";
      showToast("error", msg);
    } finally {
      setIsSubmitting(false);
    }
  }, [phone, showToast]);

  const handleVerifyCode = React.useCallback(async () => {
    try {
      setIsSubmitting(true);
      await verifyPhoneCode(phone, code, mode === "register" ? name : undefined);
      showToast("success", mode === "register" ? "Регистрация выполнена" : "Вход выполнен");
      navigate(nextPath, { replace: true });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Не удалось войти по коду";
      showToast("error", msg);
    } finally {
      setIsSubmitting(false);
    }
  }, [code, mode, name, navigate, nextPath, phone, showToast]);

  const handleGoogleCredential = React.useCallback(async (credential: string) => {
    try {
      setIsSubmitting(true);
      const session = await loginWithGoogleCredential(credential);
      if (isElectron && electronBridge && electronCallback) {
        const encoded = encodeSessionParam(session);
        window.location.href = `${electronCallback}?session=${encodeURIComponent(encoded)}`;
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
  }, [electronBridge, electronCallback, isElectron, navigate, nextPath, showToast]);

  const handleGoogleOpenInBrowser = React.useCallback(() => {
    if (!isBrowser) return;
    const callback = "evrenyan://google-auth";
    const target = `${window.location.origin}/login?electronBridge=1&electronCallback=${encodeURIComponent(callback)}`;
    window.open(target, "_blank", "noopener,noreferrer");
    showToast("success", "Открыл браузер для входа через Google");
  }, [isBrowser, showToast]);

  return (
    <div className={cls.shell}>
      <PageHeader title="Вход" />
      <div className={cls.center}>
        <LoginForm
          mode={mode}
          name={name}
          phone={phone}
          code={code}
          devCode={devCode}
          isSubmitting={isSubmitting}
          onPhoneChange={setPhone}
          onCodeChange={setCode}
          onNameChange={setName}
          onModeChange={setMode}
          onSendCode={handleSendCode}
          onVerifyCode={handleVerifyCode}
          onGoogleCredential={handleGoogleCredential}
          onGoogleOpenInBrowser={handleGoogleOpenInBrowser}
        />
      </div>
      {toast ? <StatusToast tone={toast.tone} message={toast.message} onClose={closeToast} /> : null}
    </div>
  );
};
