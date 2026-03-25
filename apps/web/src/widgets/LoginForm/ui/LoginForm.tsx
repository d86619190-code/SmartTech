import * as React from "react";
import { NavLink } from "react-router-dom";
import { Button } from "@/shared/ui/Button/Button";
import { Card } from "@/shared/ui/Card/Card";
import { Input } from "@/shared/ui/Input/Input";
import { IconLock, IconPhone } from "@/shared/ui/Icon/NavAndAuthIcons";
import { GoogleSignInButton } from "./GoogleSignInButton";
import cls from "./LoginForm.module.css";

type LoginFormProps = {
  mode: "login" | "register";
  name: string;
  phone: string;
  code: string;
  isSubmitting?: boolean;
  devCode?: string | null;
  onPhoneChange: (value: string) => void;
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
  name,
  phone,
  code,
  isSubmitting,
  devCode,
  onPhoneChange,
  onCodeChange,
  onNameChange,
  onModeChange,
  onSendCode,
  onVerifyCode,
  onGoogleCredential,
  onGoogleOpenInBrowser,
}) => {
  const onGoogle = onGoogleCredential ?? (async () => {});

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
          <Input
            type="text"
            name="otp"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            placeholder="Код из SMS"
            value={code}
            onChange={(e) => onCodeChange(e.target.value.replace(/\D/g, "").slice(0, 6))}
            icon={<IconLock size={18} />}
            aria-label="Код подтверждения"
          />
        </div>
        {devCode ? <p className={cls.devCode}>Dev-код: {devCode}</p> : null}
        <Button type="button" variant="outline" fullWidth disabled={isSubmitting || phone.trim().length < 8} onClick={() => void onSendCode()}>
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
