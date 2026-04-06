import * as React from "react";
import cls from "./PortalBeforeAfter.module.css";

type Props = {
  beforeSrc: string;
  afterSrc: string;
  beforeLabel?: string;
  afterLabel?: string;
  /** Full screen immersion after splash screen */
  immersive?: boolean;
  onCloseImmersive?: () => void;
  /** The first section is full screen (without a modal window) */
  layout?: "default" | "hero";
};

export const PortalBeforeAfter: React.FC<Props> = ({
  beforeSrc,
  afterSrc,
  beforeLabel = "Before renovation",
  afterLabel = "After",
  immersive = false,
  onCloseImmersive,
  layout = "default",
}) => {
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const gradId = React.useId().replace(/:/g, "");
  /** Hero: first, the entire frame is “broken” (fixed clip ≈0); otherwise - the middle */
  const [split, setSplit] = React.useState(() => (layout === "hero" ? 0.02 : 0.5));
  const dragging = React.useRef(false);
  const pendingX = React.useRef<number | null>(null);
  const rafId = React.useRef<number | null>(null);

  const flushSplit = React.useCallback(() => {
    rafId.current = null;
    const clientX = pendingX.current;
    const el = wrapRef.current;
    if (clientX == null || !el) return;
    const r = el.getBoundingClientRect();
    const x = (clientX - r.left) / r.width;
    setSplit(Math.min(0.995, Math.max(0.005, x)));
  }, []);

  const setFromClientX = React.useCallback(
    (clientX: number) => {
      pendingX.current = clientX;
      if (rafId.current == null) {
        rafId.current = requestAnimationFrame(() => {
          rafId.current = null;
          flushSplit();
        });
      }
    },
    [flushSplit],
  );

  React.useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!dragging.current) return;
      setFromClientX(e.clientX);
    };
    const onUp = () => {
      dragging.current = false;
      if (rafId.current != null) {
        cancelAnimationFrame(rafId.current);
        rafId.current = null;
      }
      flushSplit();
      pendingX.current = null;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [setFromClientX, flushSplit]);

  React.useEffect(() => {
    if (!immersive) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseImmersive?.();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [immersive, onCloseImmersive]);

  const wrapStyle = { "--split": String(split) } as React.CSSProperties;
  /** The top layer is “After” (to the left of the separator); bottom - “Before” (broken) across the entire width */
  const repairedClip: React.CSSProperties = {
    clipPath: `inset(0 ${(1 - split) * 100}% 0 0)`,
    WebkitClipPath: `inset(0 ${(1 - split) * 100}% 0 0)`,
  };

  const inner = (
    <>
      <div
        ref={wrapRef}
        className={[cls.wrap, immersive ? cls.wrapImmersive : "", layout === "hero" ? cls.wrapHero : ""].filter(Boolean).join(" ")}
        style={wrapStyle}
        onPointerDown={(e) => {
          dragging.current = true;
          try {
            wrapRef.current?.setPointerCapture(e.pointerId);
          } catch {
            // noop
          }
          setFromClientX(e.clientX);
        }}
        role="img"
        aria-label={`${afterLabel} on the left and ${beforeLabel} on the right. Swipe the screen to move the border.`}
      >
        <div className={cls.viewport}>
          <img
            className={[cls.img, cls.layerBroken].join(" ")}
            src={beforeSrc}
            alt=""
            draggable={false}
            decoding="async"
            fetchPriority={layout === "hero" ? "high" : "auto"}
          />
          <div className={cls.portalPulse} aria-hidden />
          <img
            className={[cls.img, cls.layerRepaired].join(" ")}
            src={afterSrc}
            alt=""
            draggable={false}
            decoding="async"
            fetchPriority={layout === "hero" ? "high" : "auto"}
            style={repairedClip}
          />
          <div className={cls.seam} aria-hidden>
            <div className={cls.beamGlow} />
            <div className={cls.beamCore} />
            <svg className={cls.lightningSvg} viewBox="0 0 100 400" preserveAspectRatio="none" aria-hidden>
              <defs>
                <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#e0f2fe" />
                  <stop offset="45%" stopColor="#ffffff" />
                  <stop offset="100%" stopColor="#38bdf8" />
                </linearGradient>
              </defs>
              <path
                className={cls.bolt}
                d="M52 8 L46 72 L58 78 L42 168 L54 174 L38 260 L50 268 L44 392"
                fill="none"
                stroke={`url(#${gradId})`}
                strokeWidth={2.4}
              />
              <path
                className={[cls.bolt, cls.bolt2].join(" ")}
                d="M48 24 L58 96 L44 104 L56 188 L40 198 L52 292 L46 380"
                fill="none"
                stroke={`url(#${gradId})`}
                strokeWidth={2}
              />
              <path
                className={[cls.bolt, cls.bolt3].join(" ")}
                d="M56 40 L42 108 L54 118 L44 200 L52 210 L40 310 L48 370"
                fill="none"
                stroke={`url(#${gradId})`}
                strokeWidth={1.6}
              />
              <path
                className={[cls.bolt, cls.bolt4].join(" ")}
                d="M44 52 L52 130 L40 142 L48 240 L42 360"
                fill="none"
                stroke={`url(#${gradId})`}
                strokeWidth={1.2}
              />
            </svg>
            <svg className={cls.lightningSvgSide} viewBox="0 0 60 400" preserveAspectRatio="none" aria-hidden>
              <defs>
                <linearGradient id={`${gradId}-s`} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#a78bfa" />
                  <stop offset="100%" stopColor="#38bdf8" />
                </linearGradient>
              </defs>
              <path
                className={cls.boltSide}
                d="M28 20 L34 100 L22 120 L36 220 L24 240 L32 380"
                fill="none"
                stroke={`url(#${gradId}-s)`}
                strokeWidth={1.8}
              />
              <path
                className={[cls.boltSide, cls.boltSide2].join(" ")}
                d="M38 40 L30 160 L40 200 L32 380"
                fill="none"
                stroke={`url(#${gradId}-s)`}
                strokeWidth={1.2}
              />
            </svg>
          </div>
          <div className={cls.labels}>
            <span className={cls.label}>{afterLabel}</span>
            <span className={cls.label}>{beforeLabel}</span>
          </div>
        </div>
      </div>
      {!immersive && layout !== "hero" ? (
        <p className={cls.hint}>Pull the separator - the “portal” between before and after</p>
      ) : null}
    </>
  );

  if (immersive) {
    return (
      <div className={cls.immersiveOverlay} role="dialog" aria-modal="true" aria-label="Comparison before and after">
        <button type="button" className={cls.immersiveClose} onClick={onCloseImmersive} aria-label="Close full screen mode">
          ✕
        </button>
        <p className={cls.immersiveHint}>Pull the separator Esc - exit</p>
        <div className={cls.immersiveStage}>{inner}</div>
      </div>
    );
  }

  return <div className={[cls.root, layout === "hero" ? cls.rootHero : ""].filter(Boolean).join(" ")}>{inner}</div>;
};
