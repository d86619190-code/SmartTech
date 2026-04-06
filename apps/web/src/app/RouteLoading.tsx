import * as React from "react";
import cls from "./RouteLoading.module.css";

/** Single fallback for lazy pages */
export const RouteLoading: React.FC = () => (
  <div className={cls.root} role="status" aria-live="polite" aria-label="Loading Screen">
    <div className={cls.ring} aria-hidden />
    <span className={cls.text}>Loading…</span>
  </div>
);
