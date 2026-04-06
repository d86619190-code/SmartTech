import * as React from "react";
import type { ReviewCard } from "@/shared/config/marketing";
import { SITE } from "@/shared/config/siteContacts";
import { Button } from "@/shared/ui/Button/Button";
import cls from "./ReviewsCarousel.module.css";

type ReviewsCarouselProps = {
  reviews: ReviewCard[];
  variant?: "default" | "dark";
};

export const ReviewsCarousel: React.FC<ReviewsCarouselProps> = ({ reviews, variant = "default" }) => {
  return (
    <section
      className={[cls.root, variant === "dark" ? cls.dark : ""].filter(Boolean).join(" ")}
      aria-labelledby="reviews-heading"
    >
      <div className={cls.head}>
        <h2 id="reviews-heading" className={cls.title}>
          Reviews
        </h2>
        <Button type="button" variant="outline" onClick={() => window.open(SITE.yandexReviewsUrl, "_blank")}>
          View all reviews
        </Button>
      </div>
      <div className={cls.strip} role="list">
        {reviews.map((r) => (
          <button
            key={r.id}
            type="button"
            className={cls.card}
            role="listitem"
            onClick={() => window.open(SITE.yandexReviewsUrl, "_blank")}
          >
            <span className={cls.stars} aria-hidden>
              {"★".repeat(Math.round(r.rating))}
            </span>
            <span className={cls.ratingNum}>{r.rating.toFixed(1)}</span>
            <span className={cls.name}>{r.name}</span>
            <span className={cls.text}>{r.text}</span>
          </button>
        ))}
      </div>
    </section>
  );
};
