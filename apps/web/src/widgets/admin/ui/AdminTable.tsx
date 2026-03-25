import * as React from "react";
import cls from "./AdminTable.module.css";

type AdminTableProps = {
  children: React.ReactNode;
  className?: string;
};

export const AdminTable: React.FC<AdminTableProps> = ({ children, className }) => (
  <div className={[cls.wrap, className].filter(Boolean).join(" ")}>
    <table className={cls.table}>{children}</table>
  </div>
);

export const AdminTh: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({ className, children, ...rest }) => (
  <th className={[cls.th, className].filter(Boolean).join(" ")} {...rest}>
    {children}
  </th>
);

export const AdminTd: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({ className, children, ...rest }) => (
  <td className={[cls.td, className].filter(Boolean).join(" ")} {...rest}>
    {children}
  </td>
);
