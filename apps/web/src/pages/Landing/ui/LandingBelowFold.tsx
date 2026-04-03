import * as React from "react";
import { LandingLink, useLandingExitNav } from "@/pages/Landing/lib/LandingExitNav";
import {
  BENEFITS,
  FAQ_ITEMS,
  GUARANTEE,
  PROCESS_STEPS,
  REVIEWS,
} from "@/shared/config/marketing";
import { SITE } from "@/shared/config/siteContacts";
import { Button } from "@/shared/ui/Button/Button";
import { LeadForm } from "@/widgets/LeadForm";
import { bindLandingScroll } from "./landingScroll";
import cls from "./LandingBelowFold.module.css";

function useInView<T extends HTMLElement>(): React.RefObject<T | null> {
  const ref = React.useRef<T | null>(null);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add(cls.inView);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -6% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

const BENEFIT_ACCENTS = ["cyan", "violet", "emerald", "amber", "rose", "sky", "fuchsia"] as const;

/** Тема фоновой анимации при hover (см. CSS bentoTheme_*) */
const BENEFIT_THEMES = [
  "diagnostic",
  "craft",
  "pay",
  "track",
  "parts",
  "shield",
  "pricing",
] as const;

export const LandingBelowFold: React.FC = () => {
  const { navigateWithTransition } = useLandingExitNav();
  const belowRootRef = React.useRef<HTMLDivElement>(null);
  const benefitsRef = useInView<HTMLElement>();
  const guaranteeRef = useInView<HTMLElement>();

  React.useLayoutEffect(() => {
    const root = belowRootRef.current;
    if (!root) return;
    return bindLandingScroll(root);
  }, []);

  return (
    <div ref={belowRootRef} className={cls.belowRoot}>
      <div className={cls.tape} aria-hidden>
        <div className={cls.tapeTrack}>
          <span>TECH · ПРОЗРАЧНОСТЬ · СКОРОСТЬ · ГАРАНТИЯ · ОНЛАЙН · TECH · ПРОЗРАЧНОСТЬ · СКОРОСТЬ · ГАРАНТИЯ · ОНЛАЙН ·</span>
          <span aria-hidden>TECH · ПРОЗРАЧНОСТЬ · СКОРОСТЬ · ГАРАНТИЯ · ОНЛАЙН · TECH · ПРОЗРАЧНОСТЬ · СКОРОСТЬ · ГАРАНТИЯ · ОНЛАЙН ·</span>
        </div>
      </div>

      <section ref={benefitsRef} className={[cls.block, cls.benefits].join(" ")} aria-labelledby="below-benefits">
        <div className={cls.blockInner}>
          <header className={cls.blockHead} data-gsap="reveal">
            <span className={cls.kicker}>01 / преимущества</span>
            <h2 id="below-benefits" className={cls.blockTitle}>
              Семь вещей, которые реально отличают нас
            </h2>
            <p className={cls.blockLead}>Та же информация — но без скуки: каждый пункт со своим характером.</p>
          </header>
          <div className={cls.bento}>
            {BENEFITS.map((text, i) => (
              <article
                key={text}
                data-gsap="bento"
                className={[
                  cls.bentoCell,
                  cls[`accent_${BENEFIT_ACCENTS[i % BENEFIT_ACCENTS.length]}`],
                  cls[`bentoTheme_${BENEFIT_THEMES[i]}`],
                ].join(" ")}
                style={{ "--i": i } as React.CSSProperties}
              >
                <div className={cls.bentoFx} aria-hidden />
                <div className={cls.bentoSparks} aria-hidden>
                  <svg className={cls.bentoSparkSvg} viewBox="0 0 120 80" preserveAspectRatio="none">
                    <path
                      className={cls.bentoSparkPath}
                      d="M58 4 L52 28 L64 32 L48 76"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                    <path
                      className={cls.bentoSparkPath2}
                      d="M88 12 L82 44 L96 52 L90 78"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      opacity="0.85"
                    />
                  </svg>
                </div>
                <span className={cls.bentoIx} aria-hidden>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className={cls.bentoText}>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Процесс — вертикальный кинотаймлайн */}
      <section className={[cls.block, cls.processScene].join(" ")} aria-labelledby="below-process">
        <div className={cls.processIntro}>
          <span className={cls.kicker}>02 / маршрут</span>
          <div className={cls.processTitleCluster}>
            <h2 id="below-process" className={cls.processMassive}>
              Пять шагов
            </h2>
            <p className={cls.processMassiveSub}>и вы всегда в курсе</p>
            <p className={cls.processTagline}>Один путь от заявки до выдачи — без дыр в информации.</p>
          </div>
        </div>

        <div className={cls.processTimeline}>
          <div className={cls.processLineTrack} aria-hidden>
            <div className={cls.processLineInner} />
          </div>
          <div className={cls.processNodes}>
            {PROCESS_STEPS.map((step, i) => (
              <article
                key={step.n}
                data-gsap="process-node"
                className={[cls.processNode, i % 2 === 0 ? cls.processNodeOdd : cls.processNodeEven].join(" ")}
              >
                <div className={cls.processCard}>
                  <div className={cls.processVisual}>
                    <img src={step.imageUrl} alt="" className={cls.processImg} loading="lazy" referrerPolicy="no-referrer" />
                    <span className={cls.processBadge}>{String(step.n).padStart(2, "0")}</span>
                    <div className={cls.processVisualGrad} aria-hidden />
                  </div>
                  <div className={cls.processText}>
                    <h3 className={cls.processH3}>{step.title}</h3>
                    <p className={cls.processP}>{step.body}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section ref={guaranteeRef} className={[cls.block, cls.guarantee].join(" ")} aria-labelledby="below-guarantee">
        <div className={cls.guaranteeBg} aria-hidden style={{ backgroundImage: `url(${GUARANTEE.imageUrl})` }} />
        <div className={cls.guaranteeVignette} aria-hidden />
        <div className={cls.blockInner}>
          <div className={cls.guaranteeGrid}>
            <div className={cls.guaranteePanel}>
              <span className={cls.kicker}>03 / гарантия</span>
              <h2 id="below-guarantee" className={cls.guaranteeTitle}>
                {GUARANTEE.title}
              </h2>
              <p className={cls.guaranteeSub}>{GUARANTEE.subtitle}</p>
              <p className={cls.guaranteeListLabel}>Что покрывает гарантия</p>
              <ul className={cls.guaranteeList}>
                {GUARANTEE.items.map((line) => (
                  <li key={line} className={cls.guaranteeLine}>
                    <span className={cls.guaranteeTick} aria-hidden>
                      ✓
                    </span>
                    {line}
                  </li>
                ))}
              </ul>
              <Button type="button" variant="outline" onClick={() => navigateWithTransition("/create-order")}>
                Оставить заявку
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className={[cls.block, cls.reviews].join(" ")} aria-labelledby="below-reviews">
        <div className={cls.blockInner}>
          <header className={cls.blockHead} data-gsap="reveal">
            <span className={cls.kicker}>04 / голоса</span>
            <h2 id="below-reviews" className={cls.blockTitle}>
              Люди уже проверили
            </h2>
          </header>
          <div className={cls.reviewWall}>
            {REVIEWS.map((r, i) => (
              <blockquote
                key={r.id}
                data-gsap="review"
                className={[cls.reviewCard, i % 2 === 0 ? cls.reviewTiltL : cls.reviewTiltR].join(" ")}
              >
                <div className={cls.reviewStars} aria-label={`Оценка ${r.rating} из 5`}>
                  {Array.from({ length: r.rating }, (_, si) => (
                    <span key={si} aria-hidden>
                      ★
                    </span>
                  ))}
                </div>
                <p className={cls.reviewText}>«{r.text}»</p>
                <footer className={cls.reviewName}>— {r.name}</footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ — кинозаголовок + сетка */}
      <section className={[cls.block, cls.faqScene].join(" ")} aria-labelledby="below-faq">
        <div className={cls.blockInner}>
          <header className={cls.faqTitleBlock} id="below-faq">
            <span className={cls.kicker}>05 / вопросы</span>
            <h2 className={cls.faqTitleLine}>Коротко</h2>
            <p className={cls.faqTitleSub}>и по делу</p>
            <p className={cls.faqTitleHint}>Разверните карточку — ответ сразу под вопросом.</p>
          </header>
          <div className={cls.faqMatrix}>
            {FAQ_ITEMS.map((item, i) => (
              <details key={item.q} data-gsap="faq-card" className={cls.faqCard} name="landing-faq">
                <summary className={cls.faqSummary}>
                  <span className={cls.faqNum}>{String(i + 1).padStart(2, "0")}</span>
                  <span className={cls.faqQtext}>{item.q}</span>
                  <span className={cls.faqPlus} aria-hidden />
                </summary>
                <p className={cls.faqAnswer}>{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Контакт */}
      <section className={[cls.block, cls.contactScene].join(" ")} aria-labelledby="below-map">
        <div className={cls.leadGlowOrb} aria-hidden />
        <div className={cls.contactSplit}>
          <div className={cls.mapCol} data-gsap="reveal">
            <span className={cls.kicker}>06 / адрес</span>
            <h2 id="below-map" className={cls.contactH2}>
              Как добраться
            </h2>
            <p className={cls.locationAddr}>{SITE.address}</p>
            <div className={cls.locationFrame}>
              <iframe
                title="Карта"
                src={SITE.yandexMapEmbedUrl}
                className={cls.locationIframe}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <div className={cls.locationStats}>
              <div className={cls.locationStat}>
                <span className={cls.locationStatVal}>{SITE.statsRepairs}</span>
                <span className={cls.locationStatLab}>ремонтов</span>
              </div>
              <div className={cls.locationStat}>
                <span className={cls.locationStatVal}>с {SITE.sinceYear}</span>
                <span className={cls.locationStatLab}>на рынке</span>
              </div>
            </div>
            <Button type="button" variant="primary" onClick={() => window.open(SITE.mapsUrl, "_blank")}>
              Маршрут
            </Button>
          </div>

          <div className={cls.formCol}>
            <div className={cls.leadFrame}>
              <div className={cls.leadFrameCorners} aria-hidden />
              <div className={cls.leadFrameScan} aria-hidden />
              <div className={cls.leadFrameInner}>
                <p className={cls.kicker}>07 / связь</p>
                <h2 className={cls.leadH2}>
                  <span className={cls.leadH2A}>Напишите</span>
                  <span className={cls.leadH2B}>ответим</span>
                </h2>
                <p className={cls.leadHint}>Заявка уходит в ту же систему — только обёртка другая.</p>
                <LeadForm variant="dark" navigateTo={navigateWithTransition} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className={cls.footer}>
        <div className={cls.footerScan} aria-hidden />
        <div className={cls.footerBar} />
        <div className={cls.footerGrid}>
          <div className={[cls.footerCol, cls.footerReveal].join(" ")}>
            <p className={cls.footerBrand}>TECH</p>
            <p className={cls.footerTagline}>Ремонт с прозрачностью и онлайн-статусом.</p>
          </div>
          <div className={[cls.footerCol, cls.footerReveal].join(" ")}>
            <p className={cls.footerNote}>Готово к работе? Сайдбар и все разделы — в приложении.</p>
          </div>
          <div className={[cls.footerCol, cls.footerActions, cls.footerReveal].join(" ")}>
            <LandingLink className={cls.footerLink} to="/">
              Открыть приложение
            </LandingLink>
            <LandingLink className={cls.footerLink} to="/login">
              Войти
            </LandingLink>
          </div>
        </div>
      </footer>
    </div>
  );
};
