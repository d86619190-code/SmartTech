import * as React from "react";
import cls from "./FilterBar.module.css";

type FilterBarProps = {
  children: React.ReactNode;
};

export const FilterBar: React.FC<FilterBarProps> = ({ children }) => {
  return <div className={cls.root}>{children}</div>;
};
