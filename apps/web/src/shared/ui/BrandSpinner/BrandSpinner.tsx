import * as React from "react";
import cls from "./BrandSpinner.module.css";

const DOT_COUNT = 8;

type BrandSpinnerProps = {
  size?: "sm" | "md" | "lg";
  /** На тёмном фоне админки/канваса */
  onDarkCanvas?: boolean;
  className?: string;
  "aria-label"?: string;
};

export const BrandSpinner: React.FC<BrandSpinnerProps> = ({
  size = "md",
  onDarkCanvas,
  className,
  "aria-label": ariaLabel = "Загрузка",
}) => {
  const trackClass = size === "sm" ? cls.trackSm : size === "lg" ? cls.trackLg : cls.trackMd;
  return (
    <span className={[cls.wrap, className].filter(Boolean).join(" ")} role="status" aria-label={ariaLabel}>
      <span
        className={[cls.track, trackClass, onDarkCanvas ? cls.onDark : ""].filter(Boolean).join(" ")}
        aria-hidden
      >
        {Array.from({ length: DOT_COUNT }).map((_, i) => (
          <span key={i} className={cls.orbitDot} style={{ ["--i" as string]: String(i) }} />
        ))}
      </span>
    </span>
  );
};

type BrandSpinnerBlockProps = BrandSpinnerProps & {
  label?: string;
};

export const BrandSpinnerBlock: React.FC<BrandSpinnerBlockProps> = ({ label = "Загрузка…", ...rest }) => {
  return (
    <div className={cls.centered}>
      <BrandSpinner size="lg" {...rest} />
      {label ? (
        <p className={cls.label} aria-hidden>
          {label}
        </p>
      ) : null}
    </div>
  );
};
