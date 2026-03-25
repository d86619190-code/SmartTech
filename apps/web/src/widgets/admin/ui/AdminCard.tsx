import * as React from "react";
import cls from "./AdminCard.module.css";

type AdminCardProps = React.HTMLAttributes<HTMLDivElement>;

export const AdminCard: React.FC<AdminCardProps> = ({ className, children, ...rest }) => (
  <div className={[cls.root, className].filter(Boolean).join(" ")} {...rest}>
    {children}
  </div>
);
