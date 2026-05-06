import * as React from "react";
import { NavLink } from "react-router-dom";
import { Button } from "@/shared/ui/Button/Button";
import { Card } from "@/shared/ui/Card/Card";
import { Input } from "@/shared/ui/Input/Input";
import { useI18n } from "@/shared/i18n/i18n";
import { IconPhone } from "@/shared/ui/Icon/NavAndAuthIcons";
import { GoogleSignInButton } from "./GoogleSignInButton";
import cls from "./LoginForm.module.css";

type LoginFormProps = {
  mode: "login" | "register";
  modeSwitchStyle?: "toggle" | "routes";
  navSearch?: string;
  authMethod: "phone" | "email";
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
  onOpenAuthInBrowser?: () => void;
  openInBrowserPending?: boolean;
};

export const LoginForm: React.FC<LoginFormProps> = ({
  mode,
  modeSwitchStyle = "toggle",
  navSearch = "",
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
  const { t } = useI18n();
  const otherAuthPath = mode === "login" ? "/register" : "/login";
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
            <div className={cls.methodTabs} role="tablist" aria-label={t("login.method")}>
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
                {t("login.phoneOptional")}
              </button>
            </div>
            <div className={cls.fields}>
              {mode === "register" ? (
                <Input
                  type="text"
                  name="name"
                  autoComplete="name"
                  placeholder={t("login.yourName")}
                  value={name}
                  onChange={(e) => onNameChange(e.target.value)}
                  required
                  aria-label={t("login.name")}
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
                  aria-label={t("login.phone")}
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
              {t("login.sendCode")}
            </Button>
            {onOpenAuthInBrowser ? (
              <Button
                type="button"
                variant="outline"
                fullWidth
                disabled={isSubmitting || openInBrowserPending}
                onClick={onOpenAuthInBrowser}
              >
                {openInBrowserPending ? t("login.prepareBrowser") : t("login.openBrowserAuth")}
              </Button>
            ) : null}
            <div className={cls.orRow} role="separator" aria-label={t("login.or")}>
              <span className={cls.orLine} />
              <span className={cls.orText}>{t("login.or")}</span>
              <span className={cls.orLine} />
            </div>
            <GoogleSignInButton onCredential={onGoogle} onOpenInBrowser={onGoogleOpenInBrowser} disabled={isSubmitting} />
            <div className={cls.footer}>
              {modeSwitchStyle === "routes" ? (
                <NavLink className={cls.linkButton} to={{ pathname: otherAuthPath, search: navSearch }}>
                  {mode === "login" ? t("login.needRegister") : t("login.haveAccount")}
                </NavLink>
              ) : (
                <button
                  type="button"
                  className={cls.linkButton}
                  onClick={() => onModeChange(mode === "login" ? "register" : "login")}
                >
                  {mode === "login" ? t("login.needRegister") : t("login.haveAccount")}
                </button>
              )}
              <span className={cls.footerHint}>{t("login.resendHelp")}</span>
            </div>
          </>
        ) : (
          <>
            <div className={cls.codeStepHead}>
              <p className={cls.codeStepHint}>
                {authMethod === "phone" ? t("login.codeSentToPhone") : t("login.codeSentTo")}{" "}
                <strong className={cls.codeStepContact}>{authMethod === "phone" ? phone.trim() || "—" : email.trim() || "—"}</strong>
              </p>
              <button type="button" className={cls.changeContactBtn} onClick={onBackToContact}>
                {t("login.change")}
              </button>
            </div>
            <div className={cls.fields}>
              <div className={cls.otpBlock}>
                <p className={cls.otpLabel}>{authMethod === "phone" ? t("login.codeSms") : t("login.codeEmail")}</p>
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
                    aria-label={t("login.confirmationCode")}
                  />
                </div>
              </div>
            </div>
            <Button type="submit" fullWidth disabled={isSubmitting || code.length !== 6 || (mode === "register" && name.trim().length < 2)}>
              {isSubmitting ? t("login.sending") : mode === "register" ? t("login.signUp") : t("login.signInCode")}
            </Button>
            <Button type="button" variant="outline" fullWidth disabled={isSubmitting || !contactReady} onClick={() => void onSendCode()}>
              {t("login.sendAgain")}
            </Button>
            <div className={cls.orRow} role="separator" aria-label={t("login.or")}>
              <span className={cls.orLine} />
              <span className={cls.orText}>{t("login.or")}</span>
              <span className={cls.orLine} />
            </div>
            <GoogleSignInButton onCredential={onGoogle} onOpenInBrowser={onGoogleOpenInBrowser} disabled={isSubmitting} />
            <div className={cls.footer}>
              {modeSwitchStyle === "routes" ? (
                <NavLink className={cls.linkButton} to={{ pathname: otherAuthPath, search: navSearch }}>
                  {mode === "login" ? t("login.needRegister") : t("login.haveAccount")}
                </NavLink>
              ) : (
                <button
                  type="button"
                  className={cls.linkButton}
                  onClick={() => onModeChange(mode === "login" ? "register" : "login")}
                >
                  {mode === "login" ? t("login.needRegister") : t("login.haveAccount")}
                </button>
              )}
              <span className={cls.footerHint}>{t("login.resendHelp")}</span>
            </div>
          </>
        )}
      </form>
    </Card>
  );
};
