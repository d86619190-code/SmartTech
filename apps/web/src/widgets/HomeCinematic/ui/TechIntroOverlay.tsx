import * as React from "react";
import phoneAfter from "@/shared/assets/phone-after-1.jpg";
import phoneBroken from "@/shared/assets/phone-broken-hq.jpg";
import cls from "./TechIntroOverlay.module.css";

type Props = {
  onDone: () => void;
};

function preloadUrls(urls: string[]): Promise<void> {
  return Promise.all(
    urls.map(
      (src) =>
        new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = () => resolve();
          img.src = src;
        }),
    ),
  ).then(() => undefined);
}

const PARTICLE_SEEDS = Array.from({ length: 48 }, (_, i) => ({
  id: i,
  left: `${(i * 17 + 13) % 100}%`,
  top: `${(i * 7 + 23) % 100}%`,
  delay: `${(i % 12) * 0.08}s`,
  dur: `${2.5 + (i % 5) * 0.35}s`,
}));

export const TechIntroOverlay: React.FC<Props> = ({ onDone }) => {
  const [booting, setBooting] = React.useState(true);
  const [exiting, setExiting] = React.useState(false);
  const finished = React.useRef(false);
  const reducedMotion = React.useMemo(
    () => (typeof window !== "undefined" ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false),
    [],
  );

  const finish = React.useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    setExiting(true);
    window.setTimeout(() => {
      onDone();
    }, 700);
  }, [onDone]);

  React.useEffect(() => {
    let cancelled = false;
    const t0 = performance.now();
    const boot = async () => {
      await preloadUrls([phoneBroken, phoneAfter]);
      const elapsed = performance.now() - t0;
      const minBoot = 720;
      const wait = Math.max(0, minBoot - elapsed);
      await new Promise((r) => setTimeout(r, wait));
      if (!cancelled) setBooting(false);
    };
    void boot();
    return () => {
      cancelled = true;
    };
  }, []);

  React.useEffect(() => {
    if (booting) return;
    if (reducedMotion) {
      const t = window.setTimeout(finish, 900);
      return () => window.clearTimeout(t);
    }
    const t = window.setTimeout(finish, 3600);
    return () => window.clearTimeout(t);
  }, [booting, finish, reducedMotion]);

  return (
    <div
      className={[cls.root, exiting ? cls.exit : "", booting ? cls.booting : cls.loaded].filter(Boolean).join(" ")}
      role="dialog"
      aria-modal="true"
      aria-label="Заставка"
      aria-busy={booting}
    >
      <div className={cls.bgGrid} aria-hidden />
      <div className={cls.bgPulse} aria-hidden />
      <div className={cls.ringOuter} aria-hidden />
      <div className={cls.ringMid} aria-hidden />
      <div className={cls.ringInner} aria-hidden />

      <div className={cls.noise} aria-hidden />
      <div className={cls.scanlines} aria-hidden />
      <div className={cls.vignette} aria-hidden />
      <div className={cls.chromatic} aria-hidden />

      <div className={cls.particleField} aria-hidden>
        {PARTICLE_SEEDS.map((p) => (
          <span
            key={p.id}
            className={cls.particle}
            style={{ left: p.left, top: p.top, animationDelay: p.delay, animationDuration: p.dur }}
          />
        ))}
      </div>

      <div className={cls.boltBurst} aria-hidden>
        <svg className={cls.boltSvg} viewBox="0 0 200 200" preserveAspectRatio="none">
          <defs>
            <linearGradient id="introBolt" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#67e8f9" />
              <stop offset="50%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#a78bfa" />
            </linearGradient>
          </defs>
          <path
            className={cls.introBoltPath}
            d="M100 4 L88 52 L104 58 L78 120 L96 128 L72 196"
            fill="none"
            stroke="url(#introBolt)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            className={[cls.introBoltPath, cls.introBoltPath2].join(" ")}
            d="M112 18 L96 78 L118 86 L92 154 L108 162 L84 198"
            fill="none"
            stroke="url(#introBolt)"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div className={cls.flash} aria-hidden />

      {booting ? (
        <div className={cls.bootPanel}>
          <div className={cls.bootLabel}>СИНХРОНИЗАЦИЯ</div>
          <div className={cls.bootBarWrap} aria-hidden>
            <div className={cls.bootBar} />
          </div>
          <p className={cls.bootHint}>Подготовка визуала и канала до / после</p>
        </div>
      ) : (
        <>
          <div className={cls.word} aria-hidden>
            {"TECH".split("").map((ch, i) => (
              <span key={`${ch}-${i}`} className={cls.letter}>
                {ch}
              </span>
            ))}
          </div>
          {[
            { top: "10%", left: "6%", delay: "0.15s" },
            { top: "18%", right: "11%", delay: "0.55s" },
            { top: "42%", left: "4%", delay: "1.1s" },
            { bottom: "22%", right: "8%", delay: "0.35s" },
            { bottom: "14%", left: "16%", delay: "1.45s" },
            { top: "58%", right: "18%", delay: "0.85s" },
            { top: "72%", left: "12%", delay: "1.25s" },
            { bottom: "8%", right: "22%", delay: "0.65s" },
          ].map((pos, i) => {
            const { delay, ...place } = pos;
            return <span key={i} className={cls.spark} style={{ ...place, animationDelay: delay }} aria-hidden />;
          })}
          <p className={cls.sub}>ремонт · прозрачность · скорость</p>
        </>
      )}

      <button type="button" className={cls.skip} onClick={finish}>
        Пропустить
      </button>
    </div>
  );
};
