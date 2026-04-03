import * as React from "react";
import { NavLink } from "react-router-dom";
import { Button } from "@/shared/ui/Button/Button";
import { Card } from "@/shared/ui/Card/Card";
import { Input } from "@/shared/ui/Input/Input";
import { IconPhone } from "@/shared/ui/Icon/NavAndAuthIcons";
import { GoogleSignInButton } from "./GoogleSignInButton";
import cls from "./LoginForm.module.css";

type LoginFormProps = {
  mode: "login" | "register";
  authMethod: "phone" | "email";
  /** contact — только email/телефон и «Отправить код»; code — шаг ввода OTP */
  otpPhase: "contact" | "code";
  name: string;
  phone: string;
  email: string;
  code: string;
  codeTone?: "idle" | "success" | "error";
  isSubmitting?: boolean;
  onAuthMethodChange: (method: "phone" | "email") => void;
  onPhoneChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onCodeChange: (value: string) => void;
  onNameChange: (value: string) => void;
  onModeChange: (mode: "login" | "register") => void;
  onBackToContact: () => void;
  onSendCode: () => void | Promise<void>;
  onVerifyCode: () => void | Promise<void>;
  onGoogleCredential?: (credential: string) => void | Promise<void>;
  onGoogleOpenInBrowser?: () => void;
  /** Из Electron: открыть страницу входа по коду в системном браузере с возвратом в приложение */
  onOpenAuthInBrowser?: () => void;
  /** Пока main-процесс не поднял localhost-мост для возврата сессии */
  openInBrowserPending?: boolean;
};

export const LoginForm: React.FC<LoginFormProps> = ({
  mode,
  authMethod,
  otpPhase,
  name,
  phone,
  email,
  code,
  codeTone = "idle",
  isSubmitting,
  onAuthMethodChange,
  onPhoneChange,
  onEmailChange,
  onCodeChange,
  onNameChange,
  onModeChange,
  onBackToContact,
  onSendCode,
  onVerifyCode,
  onGoogleCredential,
  onGoogleOpenInBrowser,
  onOpenAuthInBrowser,
  openInBrowserPending,
}) => {
  const onGoogle = onGoogleCredential ?? (async () => {});
  const contactReady = authMethod === "phone" ? phone.trim().length >= 8 : email.trim().includes("@");
  const inputRef = React.useRef<HTMLInputElement>(null);
  const codeDigits = React.useMemo(() => {
    const padded = `${code}`.replace(/\D/g, "").slice(0, 6).padEnd(6, " ");
    return padded.split("");
  }, [code]);

  return (
    <Card>
      <form
        className={cls.form}
        onSubmit={(e) => {
          e.preventDefault();
          if (otpPhase !== "code") return;
          void onVerifyCode();
        }}
        noValidate
      >
        {otpPhase === "contact" ? (
          <>
            <div className={cls.methodTabs} role="tablist" aria-label="Способ входа">
              <button
                type="button"
                className={[cls.methodTab, authMethod === "email" ? cls.methodTabActive : ""].join(" ")}
                onClick={() => onAuthMethodChange("email")}
              >
                Email
              </button>
              <button
                type="button"
                className={[cls.methodTab, authMethod === "phone" ? cls.methodTabActive : ""].join(" ")}
                onClick={() => onAuthMethodChange("phone")}
              >
                Телефон (опционально)
              </button>
            </div>
            <div className={cls.fields}>
              {mode === "register" ? (
                <Input
                  type="text"
                  name="name"
                  autoComplete="name"
                  placeholder="Ваше имя"
                  value={name}
                  onChange={(e) => onNameChange(e.target.value)}
                  required
                  aria-label="Имя"
                />
              ) : null}
              {authMethod === "phone" ? (
                <Input
                  type="tel"
                  name="phone"
                  autoComplete="tel"
                  placeholder="+7 999 123-45-67"
                  value={phone}
                  onChange={(e) => onPhoneChange(e.target.value)}
                  icon={<IconPhone size={18} />}
                  required
                  aria-label="Телефон"
                />
              ) : null}
              {authMethod === "email" ? (
                <Input
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => onEmailChange(e.target.value)}
                  required
                  aria-label="Email"
                />
              ) : null}
            </div>
            <Button type="button" variant="outline" fullWidth disabled={isSubmitting || !contactReady} onClick={() => void onSendCode()}>
              Отправить код
            </Button>
            {onOpenAuthInBrowser ? (
              <Button
                type="button"
                variant="outline"
                fullWidth
                disabled={isSubmitting || openInBrowserPending}
                onClick={onOpenAuthInBrowser}
              >
                {openInBrowserPending ? "Подготовка входа в браузере…" : "Регистрация и вход в браузере"}
              </Button>
            ) : null}
            <div className={cls.orRow} role="separator" aria-label="или">
              <span className={cls.orLine} />
              <span className={cls.orText}>или</span>
              <span className={cls.orLine} />
            </div>
            <GoogleSignInButton onCredential={onGoogle} onOpenInBrowser={onGoogleOpenInBrowser} disabled={isSubmitting} />
            <div className={cls.footer}>
              <button
                type="button"
                className={cls.linkButton}
                onClick={() => onModeChange(mode === "login" ? "register" : "login")}
              >
                {mode === "login" ? "Нужна регистрация?" : "Уже есть аккаунт?"}
              </button>
              <NavLink className={cls.link} to="/forgot-password">
                Не пришёл код?
              </NavLink>
            </div>
          </>
        ) : (
          <>
            <div className={cls.codeStepHead}>
              <p className={cls.codeStepHint}>
                {authMethod === "phone" ? "Код отправлен на номер" : "Код отправлен на"}{" "}
                <strong className={cls.codeStepContact}>{authMethod === "phone" ? phone.trim() || "—" : email.trim() || "—"}</strong>
              </p>
              <button type="button" className={cls.changeContactBtn} onClick={onBackToContact}>
                Изменить
              </button>
            </div>
            <div className={cls.fields}>
              <div className={cls.otpBlock}>
                <p className={cls.otpLabel}>{authMethod === "phone" ? "Код из SMS" : "Код из email"}</p>
                <div
                  className={[
                    cls.otpGrid,
                    codeTone === "error" ? cls.otpGridError : "",
                    codeTone === "success" ? cls.otpGridSuccess : "",
                  ].join(" ")}
                  onClick={() => inputRef.current?.focus()}
                >
                  {codeDigits.map((digit, idx) => (
                    <span key={idx} className={[cls.otpCell, digit.trim() ? cls.otpCellFilled : ""].join(" ")}>
                      {digit.trim() ? digit : ""}
                    </span>
                  ))}
                  <input
                    ref={inputRef}
                    className={cls.otpHiddenInput}
                    type="text"
                    name="otp"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    pattern="[0-9]*"
                    maxLength={6}
                    value={code}
                    onChange={(e) => onCodeChange(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    aria-label="Код подтверждения"
                  />
                </div>
              </div>
            </div>
            <Button type="submit" fullWidth disabled={isSubmitting || code.length !== 6 || (mode === "register" && name.trim().length < 2)}>
              {isSubmitting ? "Отправляем…" : mode === "register" ? "Зарегистрироваться" : "Войти по коду"}
            </Button>
            <Button type="button" variant="outline" fullWidth disabled={isSubmitting || !contactReady} onClick={() => void onSendCode()}>
              Отправить код ещё раз
            </Button>
            <div className={cls.orRow} role="separator" aria-label="или">
              <span className={cls.orLine} />
              <span className={cls.orText}>или</span>
              <span className={cls.orLine} />
            </div>
            <GoogleSignInButton onCredential={onGoogle} onOpenInBrowser={onGoogleOpenInBrowser} disabled={isSubmitting} />
            <div className={cls.footer}>
              <button
                type="button"
                className={cls.linkButton}
                onClick={() => onModeChange(mode === "login" ? "register" : "login")}
              >
                {mode === "login" ? "Нужна регистрация?" : "Уже есть аккаунт?"}
              </button>
              <NavLink className={cls.link} to="/forgot-password">
                Не пришёл код?
              </NavLink>
            </div>
          </>
        )}
      </form>
    </Card>
  );
};
