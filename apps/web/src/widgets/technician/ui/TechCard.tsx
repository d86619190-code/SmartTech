import * as React from "react";
import cls from "./TechCard.module.css";

type TechCardProps = React.HTMLAttributes<HTMLDivElement>;

export const TechCard: React.FC<TechCardProps> = ({ className, children, ...rest }) => (
  <div className={[cls.root, className].filter(Boolean).join(" ")} {...rest}>
    {children}
  </div>
);
