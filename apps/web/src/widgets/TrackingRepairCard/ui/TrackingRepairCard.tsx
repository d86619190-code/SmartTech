import * as React from "react";
import { useNavigate } from "react-router-dom";
import type { TrackingCardData } from "@/entities/tracking";
import cls from "./TrackingRepairCard.module.css";

const STAGES = [
  "Accepted",
  "In progress",
  "Ready",
] as const;

function stageClass(active: boolean): string {
  return active ? cls.stageActive : cls.stageInactive;
}

/** Accepted: 0–49%, in progress: 50–99%, ready: 100% */
function stageActiveFlags(progressPercent: number): [boolean, boolean, boolean] {
  const p = Math.min(100, Math.max(0, progressPercent));
  return [p < 50, p >= 50 && p < 100, p >= 100];
}

type TrackingRepairCardProps = {
  data: TrackingCardData;
  cardTitle?: string;
  fullWidth?: boolean;
};

export const TrackingRepairCard: React.FC<TrackingRepairCardProps> = ({
  data,
  cardTitle = "Active repair",
  fullWidth = false,
}) => {
  const navigate = useNavigate();
  const { progressPercent, deviceName, issueLabel, imageUrl, estimateLabel, orderId } = data;

  const pct = Math.min(100, Math.max(0, progressPercent));
  const [d0, d1, d2] = stageActiveFlags(pct);

  const goStatus = () => {
    if (orderId) navigate(`/tracking/${orderId}`);
    else navigate("/tracking");
  };

  const goContact = () => {
    if (orderId) {
      navigate(`/messages/${orderId}`);
      return;
    }
    navigate("/messages");
  };

  return (
    <article className={[cls.root, fullWidth ? cls.rootFullWidth : ""].join(" ").trim()}>
      <h2 className={cls.cardHeading}>{cardTitle}</h2>

      <div className={cls.mainRow}>
        <div className={cls.thumb}>
          <img src={imageUrl} alt="" loading="lazy" width={182} height={182} />
        </div>

        <div className={cls.textCol}>
          <h3 className={cls.device}>{deviceName}</h3>
          <p className={cls.issue}>
            Issue: {issueLabel}
          </p>

          <div className={cls.progressBlock}>
            <p className={cls.progressLabel}>Progress</p>
            <div
              className={cls.barTrack}
              role="progressbar"
              aria-valuenow={pct}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div className={cls.barFill} style={{ width: `${pct}%` }} />
            </div>
            <div className={cls.stages}>
              <span className={stageClass(d0)}>{STAGES[0]}</span>
              <span className={stageClass(d1)}>{STAGES[1]}</span>
              <span className={stageClass(d2)}>{STAGES[2]}</span>
            </div>
          </div>

          <p className={cls.estimate}>
            Completion Landmark: {estimateLabel}
          </p>
        </div>
      </div>

      <div className={cls.actions}>
        <button type="button" className={cls.btnPrimary} onClick={goStatus}>
          Repair status
        </button>
        <button type="button" className={cls.btnSecondary} onClick={goContact}>
          Order messages
        </button>
      </div>
    </article>
  );
};
