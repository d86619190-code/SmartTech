import * as React from "react";
import { googleClientId } from "@/shared/config/api";
import cls from "./LoginForm.module.css";

const GSI_SCRIPT = "https://accounts.google.com/gsi/client";

/** GSI допускает один вызов `initialize()` на client_id; иначе спам в консоли и гонки в Strict Mode. */
const gsiSingleton = {
  initialized: false,
  dispatchCredential: (_credential: string) => {},
};

type GoogleSignInButtonProps = {
  onCredential: (credential: string) => void | Promise<void>;
  onOpenInBrowser?: () => void;
  disabled?: boolean;
};

function loadGsiScript(): Promise<void> {
  if (window.google?.accounts?.id) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${GSI_SCRIPT}"]`) as HTMLScriptElement | null;
    if (existing) {
      const done = () => {
        if (window.google?.accounts?.id) resolve();
        else reject(new Error("Google Identity Services недоступен"));
      };
      if (existing.dataset.loaded === "1") {
        done();
        return;
      }
      existing.addEventListener("load", () => {
        existing.dataset.loaded = "1";
        done();
      });
      existing.addEventListener("error", () => reject(new Error("Не удалось загрузить Google")));
      return;
    }
    const s = document.createElement("script");
    s.src = GSI_SCRIPT;
    s.async = true;
    s.defer = true;
    s.onload = () => {
      s.dataset.loaded = "1";
      if (window.google?.accounts?.id) resolve();
      else reject(new Error("Google Identity Services недоступен"));
    };
    s.onerror = () => reject(new Error("Не удалось загрузить Google"));
    document.head.appendChild(s);
  });
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({ onCredential, onOpenInBrowser, disabled }) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const onCredRef = React.useRef(onCredential);
  onCredRef.current = onCredential;
  gsiSingleton.dispatchCredential = (credential) => {
    void onCredRef.current(credential);
  };

  const [error, setError] = React.useState<string | null>(null);
  const [hint, setHint] = React.useState<string | null>(null);
  const [ready, setReady] = React.useState(false);
  const protocol = typeof window !== "undefined" ? window.location.protocol : "";
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
  const isElectron = /Electron/i.test(ua);
  const googleUiSupported = /^(https?:|capacitor:|ionic:)$/i.test(protocol) && !isElectron;
  const isInAppWebView = /(FBAN|FBAV|Instagram|Line|Telegram|wv;|WebView|MiuiBrowser|YaApp_Android)/i.test(ua);
  const isMobile = /Android|iPhone|iPad|iPod/i.test(ua);

  // Не завязываем эффект на `disabled` / isSubmitting: иначе при «Отправить код» GSI
  // переинициализируется, в консоли сыпятся COOP/postMessage от accounts.google.com, возможны гонки.
  // Блокировка кликов — через `data-disabled` + CSS (pointer-events: none).
  React.useEffect(() => {
    if (!googleClientId || !googleUiSupported) return;

    let cancelled = false;

    (async () => {
      try {
        await loadGsiScript();
        if (cancelled || !containerRef.current) return;
        const g = window.google;
        if (!g?.accounts?.id) {
          setError("Google Identity Services недоступен");
          return;
        }
        if (!gsiSingleton.initialized) {
          const initConfig = {
            client_id: googleClientId,
            ux_mode: "popup",
            auto_select: false,
            itp_support: true,
            cancel_on_tap_outside: false,
            // Better compatibility for mobile/in-app browsers where FedCM path can fail with 4xx.
            use_fedcm_for_prompt: false,
            error_callback: (resp: any) => {
              const reason = String(resp?.type ?? "unknown");
              if (reason === "popup_failed_to_open" || reason === "popup_closed") {
                setError("Google popup не открылся на устройстве");
                setHint("Откройте сайт в Chrome/Safari и разрешите всплывающие окна.");
                return;
              }
              setError(`Ошибка Google (${reason})`);
              setHint("Проверьте, что вход выполняется не во встроенном браузере мессенджера.");
            },
            callback: (resp: any) => {
              const credential = typeof resp?.credential === "string" ? resp.credential.trim() : "";
              if (!credential || credential.length < 10) {
                setError("Google не передал корректный credential");
                setHint("Откройте сайт в обычном Chrome/Safari и повторите вход. Во встроенных браузерах это частая причина 400.");
                return;
              }
              gsiSingleton.dispatchCredential(credential);
            },
          };
          g.accounts.id.initialize(initConfig as any);
          gsiSingleton.initialized = true;
        }
        containerRef.current.innerHTML = "";
        g.accounts.id.renderButton(containerRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "signin_with",
          shape: "rectangular",
          width: 320,
          locale: "ru",
        });
        if (isInAppWebView) {
          setHint("Во встроенном браузере (Telegram/Instagram/др.) Google-вход часто возвращает 400. Лучше открыть ссылку в Chrome/Safari.");
        } else if (isMobile) {
          setHint("Если увидите 400, проверьте системную дату/время телефона и отключите строгую блокировку cookies для сайта.");
        } else {
          setHint(null);
        }
        setReady(true);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Ошибка Google");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [googleUiSupported]);

  if (!googleClientId) {
    return (
      <p className={cls.googleHint} role="status">
        Укажите <code className={cls.code}>VITE_GOOGLE_CLIENT_ID</code> для входа через Google.
      </p>
    );
  }
  if (!googleUiSupported) {
    return (
      <div className={cls.googleWrap}>
        <p className={cls.googleHint} role="status">
          {isElectron
            ? "Во встроенном окне Electron Google-вход блокируется. Используйте вход через браузер."
            : "В приложении вход через Google недоступен. Используйте вход по номеру телефона."}
        </p>
        {isElectron && onOpenInBrowser ? (
          <button type="button" className={cls.googleAltBtn} onClick={onOpenInBrowser} disabled={disabled}>
            Войти через Google в браузере
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div className={cls.googleWrap}>
      {error ? (
        <p className={cls.googleError} role="alert">
          {error}
        </p>
      ) : null}
      {hint ? (
        <p className={cls.googleHint} role="status">
          {hint}
        </p>
      ) : null}
      <div
        ref={containerRef}
        className={cls.googleButtonHost}
        aria-hidden={!ready}
        data-disabled={disabled ? "true" : undefined}
      />
      {onOpenInBrowser && isMobile && !isElectron ? (
        <button type="button" className={cls.googleAltBtn} onClick={onOpenInBrowser} disabled={disabled}>
          Войти через Google в браузере
        </button>
      ) : null}
    </div>
  );
};
