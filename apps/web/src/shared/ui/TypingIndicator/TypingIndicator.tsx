import * as React from "react";
import cls from "./TypingIndicator.module.css";

type TypingIndicatorProps = {
  /** Текст перед точками, по умолчанию «Печатает» */
  label?: string;
  className?: string;
  /** В чате мастера — выравнивание «как пузырь» клиента или сервиса */
  align?: "start" | "end";
};

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  label = "Печатает",
  className,
  align = "start",
}) => {
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
