import * as React from "react";
import cls from "./TypingIndicator.module.css";

type TypingIndicatorProps = {
  /** Текст перед точками, по умолчанию «Печатает» */
  label?: string;
  className?: string;
  /** В чате мастера — выравнивание «как пузырь» клиента или сервиса */
  align?: "start" | "end";
  /** Одна строка со статусом (вместо «вы в сети»), без большой карточки */
  variant?: "card" | "inline";
};

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  label = "Печатает",
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
