import * as React from "react";
import cls from "./TechPageHeader.module.css";

type TechPageHeaderProps = {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
};

export const TechPageHeader: React.FC<TechPageHeaderProps> = ({ title, subtitle, actions }) => {
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
