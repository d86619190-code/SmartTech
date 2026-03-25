import * as React from "react";
import cls from "./ChartPlaceholder.module.css";

type Point = { label: string; value: number };

type ChartPlaceholderProps = {
  title: string;
  data: Point[];
};

export const ChartPlaceholder: React.FC<ChartPlaceholderProps> = ({ title, data }) => {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className={cls.root}>
      <h3 className={cls.title}>{title}</h3>
      <div className={cls.chart} role="img" aria-label={title}>
        {data.map((d) => (
          <div key={d.label} className={cls.col}>
            <div className={cls.barWrap}>
              <div className={cls.bar} style={{ height: `${(d.value / max) * 100}%` }} />
            </div>
            <span className={cls.lab}>{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
