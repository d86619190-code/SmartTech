import * as React from "react";
import cls from "./Carousel3D.module.css";

const FLICK_VELOCITY = 0.42;
const SMOOTH_FALLBACK_MS = 380;

export type Carousel3DProps = {
  children: React.ReactNode;
  initialIndex?: number;
  className?: string;
  /** Minimum viewport height */
  sceneHeight?: number;
  onSlideChange?: (index: number) => void;
};

type DragState = {
  active: boolean;
  startX: number;
  startScroll: number;
  lastX: number;
  lastT: number;
  vx: number;
};

const initialDrag = (): DragState => ({
  active: false,
  startX: 0,
  startScroll: 0,
  lastX: 0,
  lastT: 0,
  vx: 0,
});

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getSlideLeft(el: HTMLDivElement | null, i: number): number {
  if (!el) return 0;
  const slides = el.children;
  if (i < 0 || i >= slides.length) return 0;
  return (slides[i] as HTMLElement).offsetLeft;
}

function indexFromScrollLeft(viewport: HTMLDivElement, n: number): number {
  if (n <= 1) return 0;
  const centerX = viewport.scrollLeft + viewport.clientWidth / 2;
  let best = 0;
  let bestDist = Infinity;
  for (let i = 0; i < n; i++) {
    const slide = viewport.children[i] as HTMLElement;
    const left = slide.offsetLeft;
    const right = left + slide.offsetWidth;
    const mid = (left + right) / 2;
    const d = Math.abs(centerX - mid);
    if (d < bestDist) {
      bestDist = d;
      best = i;
    }
  }
  return best;
}

function slideStepPx(viewport: HTMLDivElement): number {
  const first = viewport.children[0] as HTMLElement | undefined;
  const second = viewport.children[1] as HTMLElement | undefined;
  if (first && second) return second.offsetLeft - first.offsetLeft;
  return first?.offsetWidth ?? viewport.clientWidth;
}

export const Carousel3D: React.FC<Carousel3DProps> = ({
  children,
  initialIndex = 0,
  className,
  sceneHeight = 420,
  onSlideChange,
}) => {
  const items = React.Children.toArray(children).filter(React.isValidElement);
  const n = items.length;
  const viewportRef = React.useRef<HTMLDivElement>(null);
  const [index, setIndex] = React.useState(() => Math.min(initialIndex, Math.max(0, n - 1)));
  const dragRef = React.useRef<DragState>(initialDrag());
  const indexRef = React.useRef(index);
  indexRef.current = index;

  const onSlideChangeRef = React.useRef(onSlideChange);
  onSlideChangeRef.current = onSlideChange;

  React.useEffect(() => {
    setIndex((i) => Math.min(i, Math.max(0, n - 1)));
  }, [n]);

  React.useEffect(() => {
    onSlideChangeRef.current?.(index);
  }, [index]);

  const scrollToIndex = React.useCallback((i: number, behavior: ScrollBehavior = "smooth") => {
    const el = viewportRef.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(n - 1, i));
    const left = getSlideLeft(el, clamped);

    if (behavior === "smooth" && !prefersReducedMotion()) {
      el.style.scrollSnapType = "none";
      el.scrollTo({ left, behavior: "smooth" });
      let finished = false;
      const restoreSnap = () => {
        if (finished) return;
        finished = true;
        el.style.scrollSnapType = "";
      };
      el.addEventListener("scrollend", restoreSnap, { once: true });
      window.setTimeout(restoreSnap, SMOOTH_FALLBACK_MS);
    } else {
      el.scrollTo({ left, behavior });
    }
  }, [n]);

  const syncIndexFromScroll = React.useCallback(() => {
    const el = viewportRef.current;
    if (!el || n <= 1) return;
    const next = indexFromScrollLeft(el, n);
    setIndex((prev) => (next !== prev ? next : prev));
  }, [n]);

  React.useLayoutEffect(() => {
    const el = viewportRef.current;
    if (!el || n === 0) return;
    const i = Math.min(indexRef.current, n - 1);
    el.scrollLeft = getSlideLeft(el, i);
  }, [n]);

  React.useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const i = indexRef.current;
      el.scrollLeft = getSlideLeft(el, Math.min(i, n - 1));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [n]);

  const go = React.useCallback(
    (delta: number) => {
      if (n <= 1) return;
      const next = (indexRef.current + delta + n) % n;
      setIndex(next);
      scrollToIndex(next, prefersReducedMotion() ? "auto" : "smooth");
    },
    [n, scrollToIndex]
  );

  React.useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === "ArrowLeft") go(-1);
      if (ev.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  const snapToSlideAfterDrag = React.useCallback(() => {
    if (n <= 1) return;
    const el = viewportRef.current;
    if (!el) return;

    const step = slideStepPx(el);
    const ratio = step > 0 ? el.scrollLeft / step : 0;
    const vx = dragRef.current.vx;

    let target = Math.round(ratio);
    if (vx > FLICK_VELOCITY) {
      target = Math.floor(ratio);
    } else if (vx < -FLICK_VELOCITY) {
      target = Math.ceil(ratio);
    }
    target = Math.max(0, Math.min(n - 1, target));

    if (Math.abs(vx) < FLICK_VELOCITY) {
      target = indexFromScrollLeft(el, n);
    }

    setIndex(target);
    scrollToIndex(target, prefersReducedMotion() ? "auto" : "smooth");
  }, [n, scrollToIndex]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.closest("button, a, input, textarea, select, [data-no-carousel-drag]")) {
      return;
    }
    const el = viewportRef.current;
    if (!el) return;
    const now = performance.now();
    dragRef.current = {
      active: true,
      startX: e.clientX,
      startScroll: el.scrollLeft,
      lastX: e.clientX,
      lastT: now,
      vx: 0,
    };
    el.classList.add(cls.dragging);
    el.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active) return;
    const el = viewportRef.current;
    if (!el) return;

    const now = performance.now();
    const dt = Math.max(1, now - dragRef.current.lastT);
    dragRef.current.vx = (e.clientX - dragRef.current.lastX) / dt;
    dragRef.current.lastX = e.clientX;
    dragRef.current.lastT = now;

    const dx = e.clientX - dragRef.current.startX;
    el.scrollLeft = dragRef.current.startScroll - dx;
  };

  const finishPointer = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active) return;
    dragRef.current.active = false;

    const el = viewportRef.current;
    if (el) {
      el.classList.remove(cls.dragging);
      try {
        el.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    }

    snapToSlideAfterDrag();
  };

  const onScroll = () => {
    syncIndexFromScroll();
  };

  if (n === 0) return null;

  return (
    <div className={[cls.root, className].filter(Boolean).join(" ")}>
      <div
        ref={viewportRef}
        className={cls.viewport}
        style={{ minHeight: sceneHeight }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={finishPointer}
        onPointerCancel={finishPointer}
        onScroll={onScroll}
        role="region"
        aria-roledescription="carousel"
        aria-label="Carousel. Swipe or drag left and right."
      >
        {items.map((child, i) => (
          <div key={i} className={cls.slide} aria-hidden={i !== index}>
            {child}
          </div>
        ))}
      </div>
    </div>
  );
};
