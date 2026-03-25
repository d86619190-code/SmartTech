import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import cls from "./LandingBelowFold.module.css";

function motionOk(): boolean {
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Scroll-driven анимации в духе GSAP ScrollTrigger для нижней части лендинга.
 */
export function bindLandingScroll(root: HTMLElement): () => void {
  if (!motionOk()) {
    return () => {};
  }

  gsap.registerPlugin(ScrollTrigger);

  const ctx = gsap.context(() => {
    const q = (sel: string) => gsap.utils.toArray<HTMLElement>(root.querySelectorAll(sel));

    /* Универсальные появления */
    q(`[data-gsap="reveal"]`).forEach((el) => {
      gsap.from(el, {
        scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none none" },
        y: 48,
        opacity: 0,
        duration: 0.85,
        ease: "power3.out",
      });
    });

    /* Бенто: каскад */
    const bentoCells = q(`[data-gsap="bento"]`);
    const benefitsSec = root.querySelector<HTMLElement>(`.${cls.benefits}`);
    if (bentoCells.length && benefitsSec) {
      gsap.from(bentoCells, {
        scrollTrigger: { trigger: benefitsSec, start: "top 78%" },
        y: 36,
        opacity: 0,
        scale: 0.97,
        stagger: 0.07,
        duration: 0.65,
        ease: "power2.out",
      });
    }

    /* Процесс: лёгкий параллакс заголовка */
    const processScene = root.querySelector<HTMLElement>(`.${cls.processScene}`);
    const processMassive = root.querySelector<HTMLElement>(`.${cls.processMassive}`);
    if (processScene && processMassive) {
      gsap.to(processMassive, {
        y: -36,
        ease: "none",
        scrollTrigger: {
          trigger: processScene,
          start: "top bottom",
          end: "bottom top",
          scrub: 1.2,
        },
      });
    }

    /* Таймлайн процесса: линия */
    const lineInner = root.querySelector<HTMLElement>(`.${cls.processLineInner}`);
    const timeline = root.querySelector<HTMLElement>(`.${cls.processTimeline}`);
    if (lineInner && timeline) {
      gsap.fromTo(
        lineInner,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: timeline,
            start: "top 65%",
            end: "bottom 35%",
            scrub: 0.6,
          },
        },
      );
    }

    /* Узлы процесса */
    q(`[data-gsap="process-node"]`).forEach((el, i) => {
      gsap.from(el, {
        scrollTrigger: { trigger: el, start: "top 86%" },
        x: i % 2 ? 64 : -64,
        opacity: 0,
        duration: 0.95,
        ease: "power3.out",
      });
    });

    /* Гарантия: параллакс фона */
    const gBg = root.querySelector<HTMLElement>(`.${cls.guaranteeBg}`);
    const gSec = root.querySelector<HTMLElement>(`.${cls.guarantee}`);
    if (gBg && gSec) {
      gsap.to(gBg, {
        yPercent: 12,
        ease: "none",
        scrollTrigger: {
          trigger: gSec,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    }

    /* Панель гарантии */
    const gPanel = root.querySelector<HTMLElement>(`.${cls.guaranteePanel}`);
    if (gPanel) {
      gsap.from(gPanel, {
        scrollTrigger: { trigger: gPanel, start: "top 82%" },
        x: 50,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
      });
    }

    /* Отзывы */
    const revCards = q(`[data-gsap="review"]`);
    const reviewsSec = root.querySelector<HTMLElement>(`.${cls.reviews}`);
    if (revCards.length && reviewsSec) {
      gsap.from(revCards, {
        scrollTrigger: { trigger: reviewsSec, start: "top 75%" },
        y: 40,
        opacity: 0,
        stagger: 0.12,
        duration: 0.75,
        ease: "back.out(1.2)",
      });
    }

    /* FAQ карточки */
    const faqCards = q(`[data-gsap="faq-card"]`);
    if (faqCards.length) {
      gsap.from(faqCards, {
        scrollTrigger: { trigger: root.querySelector(`.${cls.faqMatrix}`), start: "top 80%" },
        y: 36,
        opacity: 0,
        stagger: 0.06,
        duration: 0.6,
        ease: "power2.out",
      });
    }

    /* Заголовок FAQ */
    const faqHead = root.querySelector<HTMLElement>(`.${cls.faqTitleBlock}`);
    if (faqHead) {
      const faqHeadEls = [
        faqHead.querySelector(`.${cls.kicker}`),
        faqHead.querySelector("h2"),
        faqHead.querySelector(`.${cls.faqTitleSub}`),
        faqHead.querySelector(`.${cls.faqTitleHint}`),
      ].filter(Boolean) as HTMLElement[];
      gsap.from(faqHeadEls, {
        scrollTrigger: { trigger: faqHead, start: "top 85%" },
        y: 40,
        opacity: 0,
        stagger: 0.1,
        duration: 0.88,
        ease: "power3.out",
      });
    }

    /* Контакт: рамка и декор */
    const leadFrame = root.querySelector<HTMLElement>(`.${cls.leadFrame}`);
    if (leadFrame) {
      gsap.from(leadFrame, {
        scrollTrigger: { trigger: leadFrame.closest("section"), start: "top 78%" },
        y: 64,
        opacity: 0,
        scale: 0.96,
        duration: 1.05,
        ease: "power3.out",
      });
    }

    const leadGlow = root.querySelector<HTMLElement>(`.${cls.leadGlowOrb}`);
    if (leadGlow) {
      gsap.to(leadGlow, {
        scrollTrigger: { trigger: leadGlow.closest("section"), start: "top bottom", end: "bottom top", scrub: 1 },
        x: "12%",
        y: "-8%",
        ease: "none",
      });
    }

    /* Карта */
    const mapFrame = root.querySelector<HTMLElement>(`.${cls.locationFrame}`);
    if (mapFrame) {
      gsap.from(mapFrame, {
        scrollTrigger: { trigger: mapFrame, start: "top 85%" },
        y: 30,
        opacity: 0.85,
        duration: 0.8,
        ease: "power2.out",
      });
    }

    /* Футер */
    const foot = root.querySelector<HTMLElement>(`.${cls.footer}`);
    if (foot) {
      gsap.from(foot.querySelectorAll(`.${cls.footerReveal}`), {
        scrollTrigger: { trigger: foot, start: "top 92%" },
        y: 28,
        opacity: 0,
        stagger: 0.08,
        duration: 0.7,
        ease: "power2.out",
      });
    }

    /* Лента */
    const tape = root.querySelector<HTMLElement>(`.${cls.tape}`);
    if (tape) {
      gsap.from(tape, {
        scrollTrigger: { trigger: tape, start: "top 95%" },
        opacity: 0,
        y: 16,
        duration: 0.6,
      });
    }
  }, root);

  return () => {
    ctx.revert();
  };
}
