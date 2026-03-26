import * as React from "react";
import { Link } from "react-router-dom";
import { FAQ_ITEMS, PROCESS_STEPS, REVIEWS } from "@/shared/config/marketing";
import { SITE } from "@/shared/config/siteContacts";
import { readAuthSession } from "@/shared/lib/authSession";
import { getClientRepairsApi, type ClientRepairDto } from "@/shared/lib/clientInboxApi";
import { Button } from "@/shared/ui/Button/Button";
import { FaqAccordion } from "@/widgets/FaqAccordion";
import { GuaranteeBlock } from "@/widgets/GuaranteeBlock";
import { ProcessSteps } from "@/widgets/ProcessSteps";
import { ReviewsCarousel } from "@/widgets/ReviewsCarousel";
import cls from "./HomePage.module.css";

export const HomePage: React.FC = () => {
  const [repairs, setRepairs] = React.useState<ClientRepairDto[]>([]);
  const isAuthed = Boolean(readAuthSession()?.accessToken);

  React.useEffect(() => {
    let mounted = true;
    if (!isAuthed) {
      setRepairs([]);
      return;
    }
    void (async () => {
      try {
        const rows = await getClientRepairsApi();
        if (mounted) setRepairs(rows);
      } catch {
        if (mounted) setRepairs([]);
      } finally {
        // noop
      }
    })();
    return () => {
      mounted = false;
    };
  }, [isAuthed]);

  const hasTracking = repairs.length > 0;
  const nextTracking = repairs[0];

  return (
    <div className={cls.shell}>
      <div className={cls.inner}>
        <section className={[cls.card, cls.primaryCard].join(" ")} aria-label="Главный следующий шаг">
          <p className={cls.sectionHeading}>Следующий шаг</p>
          {!hasTracking ? (
            <>
              <h1 className={cls.primaryTitle}>Новая заявка</h1>
              <p className={cls.primaryText}>
                Начните здесь: опишите проблему, добавьте фото и отправьте заявку мастеру.
              </p>
              <div className={cls.primaryActions}>
                <Link className={cls.primaryBtn} to="/create-order">
                  Создать новую заявку
                </Link>
                <Link className={cls.secondaryBtn} to="/messages">
                  Сообщения по заказу
                </Link>
              </div>
            </>
          ) : (
            <>
              <h1 className={cls.primaryTitle}>Продолжить отслеживание</h1>
              <p className={cls.primaryText}>
                У вас есть активные заказы. Откройте текущий заказ или создайте новый.
              </p>
              <div className={cls.primaryActions}>
                <Link className={cls.primaryBtn} to={`/tracking/${nextTracking.orderId}`}>
                  Открыть текущий заказ
                </Link>
                <Link className={cls.secondaryBtn} to="/create-order">
                  Новая заявка
                </Link>
              </div>
            </>
          )}
        </section>

        <section className={cls.quickHub} aria-label="Ключевые разделы">
          <h2 className={cls.sectionTitle}>Ключевые разделы</h2>
          <div className={cls.quickGrid}>
            <Link className={cls.quickCard} to="/tracking">
              <p className={cls.quickTitle}>Отслеживание</p>
              <p className={cls.quickText}>Этапы, фото, стоимость и история по каждому заказу.</p>
            </Link>
            <Link className={cls.quickCard} to="/create-order">
              <p className={cls.quickTitle}>Новая заявка</p>
              <p className={cls.quickText}>Быстро создать заявку и прикрепить фото поломки.</p>
            </Link>
            <Link className={cls.quickCard} to="/messages">
              <p className={cls.quickTitle}>Сообщения</p>
              <p className={cls.quickText}>Чат с сервисом, ответы мастера, согласование стоимости.</p>
            </Link>
            <Link className={cls.quickCard} to="/history">
              <p className={cls.quickTitle}>История</p>
              <p className={cls.quickText}>Завершённые и прошлые заказы в одном месте.</p>
            </Link>
          </div>
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
