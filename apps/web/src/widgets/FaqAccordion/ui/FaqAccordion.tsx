import * as React from "react";
import type { FaqItem } from "@/shared/config/marketing";
import cls from "./FaqAccordion.module.css";

type FaqAccordionProps = {
  items: FaqItem[];
  idPrefix?: string;
  /** Dark theme for landing pages / dark screens */
  variant?: "default" | "dark";
};

export const FaqAccordion: React.FC<FaqAccordionProps> = ({ items, idPrefix = "faq", variant = "default" }) => {
  const [open, setOpen] = React.useState<number | null>(0);

  return (
    <div className={[cls.root, variant === "dark" ? cls.dark : ""].filter(Boolean).join(" ")}>
      {items.map((item, i) => {
        const isOpen = open === i;
        const panelId = `${idPrefix}-panel-${i}`;
        const headerId = `${idPrefix}-header-${i}`;
        return (
          <div key={item.q} className={cls.item}>
            <button
              type="button"
              id={headerId}
              className={cls.trigger}
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => setOpen(isOpen ? null : i)}
            >
              <span>{item.q}</span>
              <span className={cls.chevron} aria-hidden>
                {isOpen ? "−" : "+"}
              </span>
            </button>
            <div
              id={panelId}
              role="region"
              aria-labelledby={headerId}
              className={cls.panel}
              data-open={isOpen}
              aria-hidden={!isOpen}
            >
              <p className={cls.answer}>{item.a}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
