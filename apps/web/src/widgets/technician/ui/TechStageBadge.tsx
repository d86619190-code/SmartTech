import * as React from "react";
import type { TechRepairStage } from "@/entities/technician";
import cls from "./TechStageBadge.module.css";

const LABELS: Record<TechRepairStage, string> = {
  accepted: "Accepted",
  diagnostics: "Diagnostics",
  waiting_approval: "Awaiting approval",
  repair: "Under renovation",
  ready: "Ready for pickup",
  completed: "Completed",
};

export const TechStageBadge: React.FC<{ stage: TechRepairStage }> = ({ stage }) => (
  <span className={cls.root}>{LABELS[stage]}</span>
);
