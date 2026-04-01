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
  onSendCode: () => void | Promise<void>;
  onVerifyCode: () => void | Promise<void>;
  onGoogleCredential?: (credential: string) => void | Promise<void>;
  onGoogleOpenInBrowser?: () => void;
};

export const LoginForm: React.FC<LoginFormProps> = ({
  mode,
  authMethod,
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
  onSendCode,
  onVerifyCode,
  onGoogleCredential,
  onGoogleOpenInBrowser,
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
          void onVerifyCode();
        }}
        noValidate
      >
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
        <Button type="button" variant="outline" fullWidth disabled={isSubmitting || !contactReady} onClick={() => void onSendCode()}>
          Отправить код
        </Button>
        <Button type="submit" fullWidth disabled={isSubmitting || code.length !== 6 || (mode === "register" && name.trim().length < 2)}>
          {isSubmitting ? "Отправляем…" : mode === "register" ? "Зарегистрироваться" : "Войти по коду"}
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
      </form>
    </Card>
  );
};
