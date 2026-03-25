import * as React from "react";
import { REVIEWS } from "@/shared/config/marketing";
import { PageHeader } from "@/widgets/PageHeader";
import cls from "./clientPages.module.css";

export const ReviewsPage: React.FC = () => {
  return (
    <div className={cls.shell}>
      <PageHeader title="Отзывы" subtitle="Что говорят клиенты о сервисе." />
      <div className={[cls.body, cls.bodyWide].join(" ")}>
        <div className={cls.reviewGrid}>
          {REVIEWS.map((r) => (
            <article key={r.id} className={cls.reviewCard}>
              <div className={cls.stars}>{"★".repeat(r.rating)}</div>
              <p className={cls.reviewName}>{r.name}</p>
              <p className={cls.reviewText}>{r.text}</p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};
