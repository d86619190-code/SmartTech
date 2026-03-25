import * as React from "react";
import cls from "./AdminPageHeader.module.css";

type AdminPageHeaderProps = {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
};

export const AdminPageHeader: React.FC<AdminPageHeaderProps> = ({ title, subtitle, actions }) => {
  return (
    <div className={cls.root}>
      <div className={cls.text}>
        <h1 className={cls.title}>{title}</h1>
        {subtitle ? <p className={cls.sub}>{subtitle}</p> : null}
      </div>
      {actions ? <div className={cls.actions}>{actions}</div> : null}
    </div>
  );
};
