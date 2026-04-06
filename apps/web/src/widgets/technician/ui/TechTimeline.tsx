import * as React from "react";
import type { TechRepairStage } from "@/entities/technician";
import cls from "./TechTimeline.module.css";

const STAGES: { key: TechRepairStage; label: string }[] = [
  { key: "accepted", label: "Accepted" },
  { key: "diagnostics", label: "Diagnostics" },
  { key: "waiting_approval", label: "Coordination" },
  { key: "repair", label: "Repair" },
  { key: "ready", label: "Ready" },
  { key: "completed", label: "Issued" },
];

function stageIndex(s: TechRepairStage): number {
  const i = STAGES.findIndex((x) => x.key === s);
  return i >= 0 ? i : 0;
}

type TechTimelineProps = {
  stage: TechRepairStage;
  onStepClick?: (stage: TechRepairStage) => void;
  interactive?: boolean;
};

export const TechTimeline: React.FC<TechTimelineProps> = ({ stage, onStepClick, interactive }) => {
  const cur = stageIndex(stage);
  const max = STAGES.length - 1;
  const fillPct = max === 0 ? 100 : (cur / max) * 100;

  return (
    <div className={cls.root}>
      <div className={cls.barTrack} aria-hidden>
        <div className={cls.barFill} style={{ width: `${fillPct}%` }} />
      </div>
      <div className={cls.steps}>
        {STAGES.map((st, i) => {
          const done = i < cur;
          const active = i === cur;
          const clickable = Boolean(interactive && onStepClick && i <= cur);
          return (
            <button
              key={st.key}
              type="button"
              className={[cls.step, active && cls.stepActive, done && cls.stepDone].filter(Boolean).join(" ")}
              disabled={!clickable}
              onClick={() => clickable && onStepClick?.(st.key)}
            >
              <span className={cls.dot} data-active={active} data-done={done && !active}>
                {i < cur ? "✓" : i + 1}
              </span>
              <span className={cls.lab}>{st.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
