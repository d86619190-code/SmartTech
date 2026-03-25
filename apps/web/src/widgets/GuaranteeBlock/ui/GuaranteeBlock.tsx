import * as React from "react";
import { GUARANTEE } from "@/shared/config/marketing";
import cls from "./GuaranteeBlock.module.css";

type Props = {
  variant?: "default" | "dark";
};

export const GuaranteeBlock: React.FC<Props> = ({ variant = "default" }) => {
  return (
    <section
      className={[cls.root, variant === "dark" ? cls.dark : ""].filter(Boolean).join(" ")}
      aria-labelledby="guarantee-heading"
    >
      <div className={cls.media}>
        <img
          src={GUARANTEE.imageUrl}
          alt="Гарантийный документ на ремонт"
          className={cls.photo}
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      </div>
      <div className={cls.text}>
        <h2 id="guarantee-heading" className={cls.title}>
          {GUARANTEE.title}
        </h2>
        <p className={cls.sub}>{GUARANTEE.subtitle}</p>
        <h3 className={cls.listTitle}>Что покрывает гарантия</h3>
        <div className={cls.list}>
          {GUARANTEE.items.map((line) => (
            <article key={line} className={cls.item}>
              <span className={cls.itemMark} aria-hidden>
                ✓
              </span>
              <span>{line}</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
