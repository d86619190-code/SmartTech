import * as React from "react";
import cls from "./PageHeader.module.css";

export type PageHeaderMaxWidth = "standard" | "wide" | "narrow";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  className?: string;
  titleClassName?: string;
  /** Heading inside an already limited page container (without its own max-width and side padding). */
  embedded?: boolean;
  /** Header column width; does not apply when embedded. */
  maxWidth?: PageHeaderMaxWidth;
};

const maxWidthClass: Record<PageHeaderMaxWidth, string> = {
  standard: cls.wStandard,
  wide: cls.wWide,
  narrow: cls.wNarrow,
};

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  className,
  titleClassName,
  embedded,
  maxWidth = "standard",
}) => {
  const innerClass = embedded
    ? [cls.inner, cls.innerEmbedded].join(" ")
    : [cls.inner, maxWidthClass[maxWidth]].join(" ");
  return (
    <header className={[cls.root, embedded ? cls.rootEmbedded : "", className].filter(Boolean).join(" ")}>
      <div className={innerClass}>
        <h1 className={[cls.title, titleClassName].filter(Boolean).join(" ")}>{title}</h1>
        {subtitle ? <p className={cls.subtitle}>{subtitle}</p> : null}
      </div>
    </header>
  );
};
