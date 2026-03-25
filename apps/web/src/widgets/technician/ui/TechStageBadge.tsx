import * as React from "react";
import type { TechRepairStage } from "@/entities/technician";
import cls from "./TechStageBadge.module.css";

const LABELS: Record<TechRepairStage, string> = {
  accepted: "Принято",
  diagnostics: "Диагностика",
  waiting_approval: "Ожидает согласования",
  repair: "В ремонте",
  ready: "Готово к выдаче",
  completed: "Завершено",
};

export const TechStageBadge: React.FC<{ stage: TechRepairStage }> = ({ stage }) => (
  <span className={cls.root}>{LABELS[stage]}</span>
);
