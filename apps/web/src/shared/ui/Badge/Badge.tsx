import * as React from "react";
import cls from "./Badge.module.css";

export type BadgeVariant = "success" | "danger" | "warning";

type BadgeProps = {
  variant: BadgeVariant;
  children: React.ReactNode;
  className?: string;
};

const variantClass: Record<BadgeVariant, string> = {
  success: cls.success,
  danger: cls.danger,
  warning: cls.warning,
};

export const Badge: React.FC<BadgeProps> = ({ variant, children, className }) => (
  <span className={[cls.root, variantClass[variant], className].filter(Boolean).join(" ")}>{children}</span>
);
