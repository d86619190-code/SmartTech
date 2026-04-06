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
        <section className={[cls.card, cls.primaryCard].join(" ")} aria-label="The Big Next Step">
          <p className={cls.sectionHeading}>Next step</p>
          {!hasTracking ? (
            <>
              <h1 className={cls.primaryTitle}>New application</h1>
              <p className={cls.primaryText}>
                Start here: describe the problem, add a photo and send a request to the specialist.
              </p>
              <div className={cls.primaryActions}>
                <Link className={cls.primaryBtn} to="/create-order">
                  Create a new request
                </Link>
                <Link className={cls.secondaryBtn} to="/messages">
                  Order messages
                </Link>
              </div>
            </>
          ) : (
            <>
              <h1 className={cls.primaryTitle}>Continue tracking</h1>
              <p className={cls.primaryText}>
                You have active orders. Open a current order or create a new one.
              </p>
              <div className={cls.primaryActions}>
                <Link className={cls.primaryBtn} to={`/tracking/${nextTracking.orderId}`}>
                  Open current order
                </Link>
                <Link className={cls.secondaryBtn} to="/create-order">
                  New application
                </Link>
              </div>
            </>
          )}
        </section>

        <section className={cls.quickHub} aria-label="Key Sections">
          <h2 className={cls.sectionTitle}>Key Sections</h2>
          <div className={cls.quickGrid}>
            <Link className={cls.quickCard} to="/tracking">
              <p className={cls.quickTitle}>Tracking</p>
              <p className={cls.quickText}>Stages, photos, cost and history for each order.</p>
            </Link>
            <Link className={cls.quickCard} to="/create-order">
              <p className={cls.quickTitle}>New application</p>
              <p className={cls.quickText}>Quickly create a request and attach a photo of the breakdown.</p>
            </Link>
            <Link className={cls.quickCard} to="/messages">
              <p className={cls.quickTitle}>Messages</p>
              <p className={cls.quickText}>Chat with the service, answers from the technician, agreement on cost.</p>
            </Link>
            <Link className={cls.quickCard} to="/history">
              <p className={cls.quickTitle}>Story</p>
              <p className={cls.quickText}>Completed and past orders in one place.</p>
            </Link>
          </div>
        </section>

        {/* Vectary 3D: external embed is blocked - “Content unavailable: Project is locked” */}
        {false ? (
          <section className={cls.card} aria-labelledby="model3d-heading">
            <div className={cls.modelWrap}>
              <iframe
                title="3D-Vectary animation"
                src="https://app.vectary.com/p/3n4dvAeNEGUrapY8qBsuCq"
                className={cls.modelFrame}
                loading="lazy"
                allow="fullscreen; xr-spatial-tracking"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
          </section>
        ) : null}

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
          <h2 className={cls.sectionTitle}>Frequently asked questions</h2>
          <FaqAccordion items={FAQ_ITEMS} idPrefix="home-faq" />
        </section>

        <section className={cls.card} aria-labelledby="addr-heading">
          <h2 id="addr-heading" className={cls.sectionHeading}>
            How to get there
          </h2>
          <div className={cls.addressRow}>
            <p className={cls.addressText}>{SITE.address}</p>
            <Button type="button" variant="outline" onClick={() => window.open(SITE.mapsUrl, "_blank")}>
              Build a route
            </Button>
          </div>
          <div className={cls.mapWrap}>
            <iframe
              title="Directions map"
              src={SITE.yandexMapEmbedUrl}
              className={cls.mapFrame}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </section>

        <section className={cls.card} aria-labelledby="trust-heading">
          <h2 id="trust-heading" className={cls.sectionHeading}>
            They trust us
          </h2>
          <div className={cls.trustGrid}>
            <div className={cls.stat}>
              <span className={cls.statVal}>{SITE.statsRepairs}</span>
              <span className={cls.statLabel}>repairs completed</span>
            </div>
            <div className={cls.stat}>
              <span className={cls.statVal}>from {SITE.sinceYear}</span>
              <span className={cls.statLabel}>We work in the market</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
