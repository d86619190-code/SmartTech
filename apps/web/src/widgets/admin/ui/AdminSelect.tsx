import * as React from "react";
import cls from "./AdminSelect.module.css";

type AdminSelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
};

export const AdminSelect = React.forwardRef<HTMLSelectElement, AdminSelectProps>(function AdminSelect(
  { label, className, id, children, ...rest },
  ref
) {
  const sid = id ?? React.useId();
  return (
    <div className={[cls.wrap, className].filter(Boolean).join(" ")}>
      {label ? (
        <label className={cls.label} htmlFor={sid}>
          {label}
        </label>
      ) : null}
      <select ref={ref} id={sid} className={cls.field} {...rest}>
        {children}
      </select>
    </div>
  );
});
