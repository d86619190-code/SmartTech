import * as React from "react";
import cls from "./Button.module.css";

export type ButtonVariant = "primary" | "outline" | "ghost";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  fullWidth?: boolean;
  variant?: ButtonVariant;
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { fullWidth, variant = "primary", className, type = "button", ...rest },
  ref
) {
  const v = variant === "primary" ? cls.primary : variant === "outline" ? cls.outline : cls.ghost;
  return (
    <button
      ref={ref}
      type={type}
      className={[cls.root, v, fullWidth && cls.fullWidth, className].filter(Boolean).join(" ")}
      {...rest}
    />
  );
});
