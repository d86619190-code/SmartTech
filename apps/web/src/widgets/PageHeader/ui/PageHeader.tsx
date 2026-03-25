import * as React from "react";
import cls from "./PageHeader.module.css";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  className?: string;
  titleClassName?: string;
};

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, className, titleClassName }) => {
  return (
    <header className={[cls.root, className].filter(Boolean).join(" ")}>
      <h1 className={[cls.title, titleClassName].filter(Boolean).join(" ")}>{title}</h1>
      {subtitle ? <p className={cls.subtitle}>{subtitle}</p> : null}
    </header>
  );
};
