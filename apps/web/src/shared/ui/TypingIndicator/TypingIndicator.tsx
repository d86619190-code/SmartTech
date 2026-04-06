import * as React from "react";
import cls from "./TypingIndicator.module.css";

type TypingIndicatorProps = {
  /** Text before dots, “Prints” by default */
  label?: string;
  className?: string;
  /** In the wizard's chat - alignment “like a bubble” of the client or service */
  align?: "start" | "end";
  /** One line with status (instead of “you are online”), without a large card */
  variant?: "card" | "inline";
};

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  label = "Prints",
  className,
  align = "start",
  variant = "card",
}) => {
  if (variant === "inline") {
    return (
      <span
        className={[cls.inlineRoot, className].filter(Boolean).join(" ")}
        role="status"
        aria-live="polite"
        aria-label={`${label}…`}
      >
        <span className={cls.inlineLabel}>{label}</span>
        <span className={cls.inlineDots} aria-hidden>
          <span className={cls.inlineDot} />
          <span className={cls.inlineDot} />
          <span className={cls.inlineDot} />
        </span>
      </span>
    );
  }

  return (
    <div
      className={[cls.row, align === "end" ? cls.rowTech : cls.rowClient, className].filter(Boolean).join(" ")}
      role="status"
      aria-live="polite"
      aria-label={`${label}…`}
    >
      <div className={cls.wrap}>
        <span className={cls.label}>{label}</span>
        <span className={cls.dots} aria-hidden>
          <span className={cls.dot} />
          <span className={cls.dot} />
          <span className={cls.dot} />
        </span>
      </div>
    </div>
  );
};
