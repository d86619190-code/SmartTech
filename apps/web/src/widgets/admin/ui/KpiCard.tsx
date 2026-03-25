import * as React from "react";
import cls from "./KpiCard.module.css";

type KpiCardProps = {
  label: string;
  value: string;
  hint?: string;
};

export const KpiCard: React.FC<KpiCardProps> = ({ label, value, hint }) => {
  return (
    <div className={cls.root}>
      <span className={cls.label}>{label}</span>
      <span className={cls.value}>{value}</span>
      {hint ? <span className={cls.hint}>{hint}</span> : null}
    </div>
  );
};
