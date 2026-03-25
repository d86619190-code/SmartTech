import * as React from "react";
import cls from "./StatusToast.module.css";

export type StatusTone = "success" | "error" | "info";

export type StatusToastProps = {
  tone: StatusTone;
  message: string;
  onClose?: () => void;
};

const toneIcon: Record<StatusTone, string> = {
  success: "✨",
  error: "⚠️",
  info: "💬",
};

export const StatusToast: React.FC<StatusToastProps> = ({ tone, message, onClose }) => {
  return (
    <div className={cls.wrap} role="status" aria-live="polite">
      <div className={[cls.toast, cls[tone]].join(" ")}>
        <span className={cls.icon} aria-hidden>
          {toneIcon[tone]}
        </span>
        <span className={cls.text}>{message}</span>
        <button type="button" className={cls.close} onClick={onClose} aria-label="Закрыть уведомление">
          ×
        </button>
      </div>
    </div>
  );
};
