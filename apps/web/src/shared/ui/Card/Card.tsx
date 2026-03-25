import * as React from "react";
import cls from "./Card.module.css";

type CardProps = React.HTMLAttributes<HTMLDivElement>;

export const Card: React.FC<CardProps> = ({ className, children, ...rest }) => (
  <div className={[cls.root, className].filter(Boolean).join(" ")} {...rest}>
    {children}
  </div>
);
