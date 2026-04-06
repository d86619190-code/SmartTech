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

/** Hover background animation theme (see CSS bentoTheme_*) */
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
          <span>TECH · TRANSPARENCY · SPEED · GUARANTEE · ONLINE · TECH · TRANSPARENCY · SPEED · GUARANTEE · ONLINE ·</span>
          <span aria-hidden>TECH · TRANSPARENCY · SPEED · GUARANTEE · ONLINE · TECH · TRANSPARENCY · SPEED · GUARANTEE · ONLINE ·</span>
        </div>
      </div>

      <section ref={benefitsRef} className={[cls.block, cls.benefits].join(" ")} aria-labelledby="below-benefits">
        <div className={cls.blockInner}>
          <header className={cls.blockHead} data-gsap="reveal">
            <span className={cls.kicker}>01 / advantages</span>
            <h2 id="below-benefits" className={cls.blockTitle}>
              Seven things that really set us apart
            </h2>
            <p className={cls.blockLead}>The same information - but without boredom: each item has its own character.</p>
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

      {/* Process - vertical cinematic timeline */}
      <section className={[cls.block, cls.processScene].join(" ")} aria-labelledby="below-process">
        <div className={cls.processIntro}>
          <span className={cls.kicker}>02 / route</span>
          <div className={cls.processTitleCluster}>
            <h2 id="below-process" className={cls.processMassive}>
              Five steps
            </h2>
            <p className={cls.processMassiveSub}>and you are always in the know</p>
            <p className={cls.processTagline}>One path from application to issue - without holes in information.</p>
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
              <span className={cls.kicker}>03 / guarantee</span>
              <h2 id="below-guarantee" className={cls.guaranteeTitle}>
                {GUARANTEE.title}
              </h2>
              <p className={cls.guaranteeSub}>{GUARANTEE.subtitle}</p>
              <p className={cls.guaranteeListLabel}>What does the warranty cover</p>
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
                Leave a request
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className={[cls.block, cls.reviews].join(" ")} aria-labelledby="below-reviews">
        <div className={cls.blockInner}>
          <header className={cls.blockHead} data-gsap="reveal">
            <span className={cls.kicker}>04 / vote</span>
            <h2 id="below-reviews" className={cls.blockTitle}>
              People have already checked
            </h2>
          </header>
          <div className={cls.reviewWall}>
            {REVIEWS.map((r, i) => (
              <blockquote
                key={r.id}
                data-gsap="review"
                className={[cls.reviewCard, i % 2 === 0 ? cls.reviewTiltL : cls.reviewTiltR].join(" ")}
              >
                <div className={cls.reviewStars} aria-label={`Rating ${r.rating} out of 5`}>
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

      {/* FAQ — movie title + grid */}
      <section className={[cls.block, cls.faqScene].join(" ")} aria-labelledby="below-faq">
        <div className={cls.blockInner}>
          <header className={cls.faqTitleBlock} id="below-faq">
            <span className={cls.kicker}>05 / questions</span>
            <h2 className={cls.faqTitleLine}>Short</h2>
            <p className={cls.faqTitleSub}>and to the point</p>
            <p className={cls.faqTitleHint}>Expand the card - the answer is right under the question.</p>
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

      {/* Contact */}
      <section className={[cls.block, cls.contactScene].join(" ")} aria-labelledby="below-map">
        <div className={cls.leadGlowOrb} aria-hidden />
        <div className={cls.contactSplit}>
          <div className={cls.mapCol} data-gsap="reveal">
            <span className={cls.kicker}>06 / address</span>
            <h2 id="below-map" className={cls.contactH2}>
              How to get there
            </h2>
            <p className={cls.locationAddr}>{SITE.address}</p>
            <div className={cls.locationFrame}>
              <iframe
                title="Map"
                src={SITE.yandexMapEmbedUrl}
                className={cls.locationIframe}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <div className={cls.locationStats}>
              <div className={cls.locationStat}>
                <span className={cls.locationStatVal}>{SITE.statsRepairs}</span>
                <span className={cls.locationStatLab}>repairs</span>
              </div>
              <div className={cls.locationStat}>
                <span className={cls.locationStatVal}>from {SITE.sinceYear}</span>
                <span className={cls.locationStatLab}>on the market</span>
              </div>
            </div>
            <Button type="button" variant="primary" onClick={() => window.open(SITE.mapsUrl, "_blank")}>
              Route
            </Button>
          </div>

          <div className={cls.formCol}>
            <div className={cls.leadFrame}>
              <div className={cls.leadFrameCorners} aria-hidden />
              <div className={cls.leadFrameScan} aria-hidden />
              <div className={cls.leadFrameInner}>
                <p className={cls.kicker}>07 / connection</p>
                <h2 className={cls.leadH2}>
                  <span className={cls.leadH2A}>Write</span>
                  <span className={cls.leadH2B}>we will answer</span>
                </h2>
                <p className={cls.leadHint}>The application goes into the same system - only the wrapper is different.</p>
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
            <p className={cls.footerTagline}>Repair with transparency and online status.</p>
          </div>
          <div className={[cls.footerCol, cls.footerReveal].join(" ")}>
            <p className={cls.footerNote}>Ready to go? The sidebar and all sections are in the application.</p>
          </div>
          <div className={[cls.footerCol, cls.footerActions, cls.footerReveal].join(" ")}>
            <LandingLink className={cls.footerLink} to="/">
              Open application
            </LandingLink>
            <LandingLink className={cls.footerLink} to="/login">
              Login
            </LandingLink>
          </div>
        </div>
      </footer>
    </div>
  );
};
