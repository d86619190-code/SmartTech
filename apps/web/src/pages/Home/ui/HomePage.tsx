import * as React from "react";
import { clientRepairToTrackingCard } from "@/entities/tracking";
import {
  BENEFITS,
  FAQ_ITEMS,
  HERO,
  PROCESS_STEPS,
  REVIEWS,
} from "@/shared/config/marketing";
import { SITE } from "@/shared/config/siteContacts";
import { getClientRepairsApi } from "@/shared/lib/clientInboxApi";
import { readAuthSession } from "@/shared/lib/authSession";
import { SkeletonTrackingCards } from "@/shared/ui/Skeleton";
import { Button } from "@/shared/ui/Button/Button";
import { FaqAccordion } from "@/widgets/FaqAccordion";
import { GuaranteeBlock } from "@/widgets/GuaranteeBlock";
import { LeadForm } from "@/widgets/LeadForm";
import { ProcessSteps } from "@/widgets/ProcessSteps";
import { ReviewsCarousel } from "@/widgets/ReviewsCarousel";
import { TrackingRepairCard } from "@/widgets/TrackingRepairCard";
import cls from "./HomePage.module.css";

export const HomePage: React.FC = () => {
  const auth = readAuthSession();
  const [repairs, setRepairs] = React.useState<Awaited<ReturnType<typeof getClientRepairsApi>>>([]);
  const [trackingLoading, setTrackingLoading] = React.useState(false);

  React.useEffect(() => {
    if (!auth?.accessToken) {
      setRepairs([]);
      return;
    }
    let mounted = true;
    void (async () => {
      setTrackingLoading(true);
      try {
        const rows = await getClientRepairsApi();
        if (mounted) setRepairs(rows);
      } catch {
        if (mounted) setRepairs([]);
      } finally {
        if (mounted) setTrackingLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [auth?.accessToken]);

  const activeCards = React.useMemo(
    () => repairs.filter((r) => r.status === "in_progress").map(clientRepairToTrackingCard),
    [repairs],
  );
  const hasActiveRepairs = activeCards.length > 0;
  const isSingleActiveRepair = activeCards.length === 1;
  return (
    <div className={cls.shell}>
      <div className={cls.inner}>
        <section className={cls.hero} aria-labelledby="home-title">
          <h1 id="home-title" className={cls.title}>
            Отслеживание
          </h1>
          <p className={cls.subtitle}>{HERO.subtitle}</p>
        </section>

        <section className={cls.repairPanel} aria-label="Отслеживание">
          {auth && trackingLoading ? (
            <div className={cls.emptyTrackingMessage} style={{ padding: 18 }}>
              <SkeletonTrackingCards count={1} />
            </div>
          ) : !hasActiveRepairs ? (
            <p className={cls.emptyTrackingMessage}>
              Сейчас у вас нет активного ремонта. Оставьте заявку, и мы сразу примем устройство в работу.
            </p>
          ) : isSingleActiveRepair ? (
            <div className={cls.singleTrackingCard}>
              <TrackingRepairCard data={activeCards[0]} cardTitle="Активный ремонт" fullWidth />
            </div>
          ) : (
            <div className={cls.trackingScrollViewport} aria-label="Активные ремонты">
              <div className={cls.trackingScrollTrack}>
                {activeCards.map((card) => (
                  <div key={card.id} className={cls.trackingScrollItem}>
                    <TrackingRepairCard data={card} cardTitle="Активный ремонт" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        <section className={cls.infoGrid}>
          <article className={[cls.card, cls.benefitsCard].join(" ")} aria-labelledby="benefits-heading">
            <h2 id="benefits-heading" className={cls.benefitsHeading}>
              Ремонт телефонов, планшетов и ноутбуков за 1 день
            </h2>
            <ul className={cls.benefits} aria-label="Преимущества">
              {BENEFITS.map((text) => (
                <li key={text} className={cls.benefitItem}>
                  <span className={cls.benefitText}>{text}</span>
                </li>
              ))}
            </ul>
          </article>
          <LeadForm className={cls.lead} />
        </section>

        <section className={cls.section}>
          <ProcessSteps steps={PROCESS_STEPS} />
        </section>

        <section className={cls.section}>
          <GuaranteeBlock />
        </section>

        <section className={cls.section}>
          <ReviewsCarousel reviews={REVIEWS} />
        </section>

        <section className={cls.section}>
          <h2 className={cls.sectionTitle}>Частые вопросы</h2>
          <FaqAccordion items={FAQ_ITEMS} idPrefix="home-faq" />
        </section>

        <section className={cls.card} aria-labelledby="addr-heading">
          <h2 id="addr-heading" className={cls.sectionHeading}>
            Как добраться
          </h2>
          <div className={cls.addressRow}>
            <p className={cls.addressText}>{SITE.address}</p>
            <Button type="button" variant="outline" onClick={() => window.open(SITE.mapsUrl, "_blank")}>
              Построить маршрут
            </Button>
          </div>
          <div className={cls.mapWrap}>
            <iframe
              title="Карта проезда"
              src={SITE.yandexMapEmbedUrl}
              className={cls.mapFrame}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </section>

        <section className={cls.card} aria-labelledby="trust-heading">
          <h2 id="trust-heading" className={cls.sectionHeading}>
            Нам доверяют
          </h2>
          <div className={cls.trustGrid}>
            <div className={cls.stat}>
              <span className={cls.statVal}>{SITE.statsRepairs}</span>
              <span className={cls.statLabel}>ремонтов выполнено</span>
            </div>
            <div className={cls.stat}>
              <span className={cls.statVal}>с {SITE.sinceYear}</span>
              <span className={cls.statLabel}>работаем на рынке</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
