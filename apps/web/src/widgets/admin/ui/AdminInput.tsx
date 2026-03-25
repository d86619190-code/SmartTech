import * as React from "react";
import cls from "./AdminInput.module.css";

type AdminInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export const AdminInput = React.forwardRef<HTMLInputElement, AdminInputProps>(function AdminInput(
  { label, className, id, ...rest },
  ref
) {
  const inputId = id ?? React.useId();
  return (
    <div className={[cls.wrap, className].filter(Boolean).join(" ")}>
      {label ? (
        <label className={cls.label} htmlFor={inputId}>
          {label}
        </label>
      ) : null}
      <input ref={ref} id={inputId} className={cls.field} {...rest} />
    </div>
  );
});
