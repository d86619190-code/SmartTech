import * as React from "react";
import cls from "./Input.module.css";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  icon?: React.ReactNode;
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { icon, className, id, ...rest },
  ref
) {
  const inputId = id ?? React.useId();

  return (
    <div className={[cls.wrap, className].filter(Boolean).join(" ")}>
      {icon ? <span className={cls.icon}>{icon}</span> : null}
      <input ref={ref} id={inputId} className={cls.field} {...rest} />
    </div>
  );
});
