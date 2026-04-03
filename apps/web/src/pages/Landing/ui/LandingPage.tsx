import * as React from "react";
import { HERO } from "@/shared/config/marketing";
import phoneAfter1 from "@/shared/assets/phone-after-1.jpg";
import phoneBrokenHq from "@/shared/assets/phone-broken-hq.jpg";
import btnCls from "@/shared/ui/Button/Button.module.css";
import { LandingLink, useLandingExitNav } from "@/pages/Landing/lib/LandingExitNav";
import { PortalBeforeAfter, TechIntroOverlay } from "@/widgets/HomeCinematic";
import { LandingBelowFold } from "./LandingBelowFold";
import cls from "./LandingPage.module.css";

const FLOAT_ORBS = Array.from({ length: 14 }, (_, i) => ({
  k: i,
  x: `${(i * 37 + 11) % 100}%`,
  y: `${(i * 23 + 7) % 100}%`,
  s: 0.6 + (i % 5) * 0.12,
  d: `${i * 0.35}s`,
}));

function useReveal<T extends HTMLElement>(): React.RefObject<T | null> {
  const ref = React.useRef<T | null>(null);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add(cls.revealed);
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

export const LandingPage: React.FC = () => {
  const { isExiting } = useLandingExitNav();
  const [showIntro, setShowIntro] = React.useState(true);
  const [introKey, setIntroKey] = React.useState(0);
  const [showBackTop, setShowBackTop] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement>(null);

  const heroReveal = useReveal<HTMLElement>();

  const onIntroDone = React.useCallback(() => {
    setShowIntro(false);
  }, []);

  React.useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const onScroll = () => {
      const y = window.scrollY;
      const doc = document.documentElement;
      const maxScroll = Math.max(1, doc.scrollHeight - window.innerHeight);
      const progress = Math.min(1, y / maxScroll);
      root.style.setProperty("--landing-scroll", String(y));
      root.style.setProperty("--landing-fog", String(Math.min(1, y / 400)));
      root.style.setProperty("--landing-progress", String(progress));
      root.classList.toggle(cls.navDocked, y > 12);
      setShowBackTop(y > 420);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div ref={rootRef} className={[cls.root, isExiting ? cls.rootExiting : ""].filter(Boolean).join(" ")}>
      {showIntro ? <TechIntroOverlay key={introKey} onDone={onIntroDone} /> : null}

      <div className={cls.bgMesh} aria-hidden />
      <div className={cls.bgNoise} aria-hidden />
      <div className={cls.bgScan} aria-hidden />

      <div className={cls.globalLightning} aria-hidden>
        <div className={cls.ambientBolt} data-n="1" />
        <div className={cls.ambientBolt} data-n="2" />
        <div className={cls.ambientBolt} data-n="3" />
        <div className={cls.ambientBolt} data-n="4" />
        <div className={cls.scrollBoltTrack} aria-hidden>
          <svg className={cls.scrollBoltSvg} viewBox="0 0 64 420" preserveAspectRatio="xMidYMin slice">
            <defs>
              <linearGradient id="scroll-bolt-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.95" />
                <stop offset="45%" stopColor="#e0f2fe" stopOpacity="1" />
                <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.85" />
              </linearGradient>
              <filter id="scroll-bolt-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <path
              className={cls.scrollBoltPath}
              d="M32 8 L26 120 L38 132 L22 260 L36 272 L18 412"
              fill="none"
              stroke="url(#scroll-bolt-grad)"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#scroll-bolt-glow)"
            />
          </svg>
        </div>
      </div>

      {FLOAT_ORBS.map((o) => (
        <span
          key={o.k}
          className={cls.floatOrb}
          style={{ left: o.x, top: o.y, transform: `scale(${o.s})`, animationDelay: o.d }}
          aria-hidden
        />
      ))}

      <div className={cls.scrollFog} aria-hidden />
      <div className={cls.scrollProgress} aria-hidden>
        <div className={cls.scrollProgressBar} />
      </div>

      <header className={cls.topNav}>
        <span className={cls.brand} aria-hidden>
          TECH
        </span>
        <nav className={cls.topLinks} aria-label="Навигация лендинга">
          <LandingLink className={cls.navLink} to="/">
            В приложение
          </LandingLink>
          <LandingLink className={cls.navLink} to="/create-order">
            Новая заявка
          </LandingLink>
          <LandingLink className={cls.navLink} to="/tracking">
            Отслеживание
          </LandingLink>
        </nav>
      </header>

      <main className={cls.scroll}>
        <section className={cls.portalHero} aria-label="До и после ремонта">
          <div className={cls.portalHeroInner}>
            <PortalBeforeAfter
              layout="hero"
              beforeSrc={phoneBrokenHq}
              afterSrc={phoneAfter1}
              beforeLabel="До ремонта"
              afterLabel="После"
            />
          </div>
        </section>

        <section ref={heroReveal} className={[cls.hero, cls.reveal].join(" ")} aria-labelledby="landing-hero-title">
          <div className={cls.heroGrid} aria-hidden />
          <div className={cls.heroGlow} aria-hidden />
          <div className={cls.lightningBg} aria-hidden>
            <svg viewBox="0 0 400 200" className={cls.lightningSvg} preserveAspectRatio="none">
              <defs>
                <linearGradient id="lg-bolt-a" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#67e8f9" />
                  <stop offset="50%" stopColor="#ffffff" />
                  <stop offset="100%" stopColor="#a78bfa" />
                </linearGradient>
              </defs>
              <path
                className={cls.lightningPath}
                d="M120 8 L108 88 L126 96 L96 180 L118 188 L88 196"
                fill="none"
                stroke="url(#lg-bolt-a)"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <path
                className={[cls.lightningPath, cls.lightningPath2].join(" ")}
                d="M260 20 L276 100 L248 112 L272 196"
                fill="none"
                stroke="url(#lg-bolt-a)"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div className={cls.heroInner}>
            <div className={cls.heroCard}>
              <div className={cls.heroCardInner}>
                <p className={cls.heroKicker}>Первое впечатление · без сайдбара · только шоу</p>
                <h1 id="landing-hero-title" className={cls.heroTitle}>
                  {HERO.title}
                </h1>
                <p className={cls.heroSub}>{HERO.subtitle}</p>
                <div className={cls.heroCta}>
                  <span className={cls.ctaSparks}>
                    <LandingLink to="/create-order" className={[btnCls.root, btnCls.primary].join(" ")}>
                      Оставить заявку
                    </LandingLink>
                  </span>
                  <LandingLink className={cls.ctaGhost} to="/">
                    Перейти в приложение
                  </LandingLink>
                </div>
              </div>
            </div>
          </div>
        </section>

        <LandingBelowFold />
      </main>

      <button
        type="button"
        className={[cls.backToTop, showBackTop ? cls.backToTopVisible : ""].filter(Boolean).join(" ")}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Наверх"
      >
        ↑
      </button>
    </div>
  );
};
