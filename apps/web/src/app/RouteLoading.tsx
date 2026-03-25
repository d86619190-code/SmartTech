import * as React from "react";
import cls from "./RouteLoading.module.css";

/** Единый fallback для lazy-страниц */
export const RouteLoading: React.FC = () => (
  <div className={cls.root} role="status" aria-live="polite" aria-label="Загрузка экрана">
    <div className={cls.ring} aria-hidden />
    <span className={cls.text}>Загрузка…</span>
  </div>
);
