import * as React from "react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocation, useOutlet } from "react-router-dom";
import { getRouteNavOrder } from "@/shared/lib/navigation/routeNavOrder";
import { useMediaQuery } from "@/shared/lib/useMediaQuery";
import { setLastAuthRoute } from "@/shared/lib/authRedirect";
import cls from "./PageTransition.module.css";

const SLIDE_MS = 680;
const FALLBACK_CURTAIN_IN_MS = 520;
const FALLBACK_CURTAIN_OUT_MS = 550;

/** Согласовано с AppLayout: сайдбар колонкой от 768px */
const MEDIA_MIN_DESKTOP = "(min-width: 768px)";

type Direction = "forward" | "backward" | "neutral";

type SlideTransition = {
  mode: "slide";
  id: number;
  fromOutlet: React.ReactNode;
  toOutlet: React.ReactNode;
  direction: Direction;
};

type CurtainTransition = {
  mode: "curtain";
  id: number;
  phase: "covering" | "uncovering";
  fromOutlet: React.ReactNode;
  toOutlet: React.ReactNode;
  direction: Direction;
};

type TransitionState = SlideTransition | CurtainTransition;

function getDirection(fromPath: string, toPath: string): Direction {
  const a = getRouteNavOrder(fromPath);
  const b = getRouteNavOrder(toPath);
  if (b > a) return "forward";
  if (b < a) return "backward";
  return "neutral";
}

function scrollMainToTop() {
  const main = document.querySelector("main");
  if (main) main.scrollTop = 0;
  document.querySelectorAll<HTMLElement>("[data-panel-scroll]").forEach((el) => {
    el.scrollTop = 0;
  });
}

function parseDurationMs(cssValue: string, fallback: number): number {
  const v = cssValue.trim();
  if (!v) return fallback;
  if (v.endsWith("ms")) return Math.round(parseFloat(v));
  if (v.endsWith("s")) return Math.round(parseFloat(v) * 1000);
  const n = parseFloat(v);
  return Number.isFinite(n) ? Math.round(n * (n < 50 ? 1000 : 1)) : fallback;
}

function readCurtainDurations(): { inMs: number; outMs: number } {
  if (typeof window === "undefined") {
    return { inMs: FALLBACK_CURTAIN_IN_MS, outMs: FALLBACK_CURTAIN_OUT_MS };
  }
  const root = getComputedStyle(document.documentElement);
  return {
    inMs: parseDurationMs(root.getPropertyValue("--page-transition-curtain-in-duration"), FALLBACK_CURTAIN_IN_MS),
    outMs: parseDurationMs(root.getPropertyValue("--page-transition-curtain-out-duration"), FALLBACK_CURTAIN_OUT_MS),
  };
}

function curtainClassFor(phase: "covering" | "uncovering", direction: Direction): string {
  if (phase === "covering") {
    if (direction === "backward") return cls.curtainInBackward;
    if (direction === "neutral") return cls.curtainInNeutral;
    return cls.curtainInForward;
  }
  if (direction === "backward") return cls.curtainOutBackward;
  if (direction === "neutral") return cls.curtainOutNeutral;
  return cls.curtainOutForward;
}

export function PageTransition() {
  const location = useLocation();
  const outlet = useOutlet();
  const isDesktop = useMediaQuery(MEDIA_MIN_DESKTOP);
  const prevPathRef = useRef<string | null>(null);
  const prevOutletRef = useRef<React.ReactNode>(null);
  const [transition, setTransition] = useState<TransitionState | null>(null);
  const transitionIdRef = useRef(0);

  useLayoutEffect(() => {
    if (prevPathRef.current === null) {
      prevPathRef.current = location.pathname;
      prevOutletRef.current = outlet;
      return;
    }
    if (location.pathname !== prevPathRef.current) {
      const direction = getDirection(prevPathRef.current, location.pathname);
      transitionIdRef.current += 1;
      const fromOutlet = prevOutletRef.current;
      const toOutlet = outlet;

      if (isDesktop) {
        setTransition({
          mode: "curtain",
          id: transitionIdRef.current,
          phase: "covering",
          direction,
          fromOutlet,
          toOutlet,
        });
      } else {
        setTransition({
          mode: "slide",
          id: transitionIdRef.current,
          direction,
          fromOutlet,
          toOutlet,
        });
      }
      prevPathRef.current = location.pathname;
      prevOutletRef.current = outlet;
      scrollMainToTop();
      return;
    }
    prevOutletRef.current = outlet;
  }, [location.pathname, outlet, isDesktop]);

  useEffect(() => {
    // For auth-missing cases we need to restore where the user was.
    setLastAuthRoute(`${location.pathname}${location.search}`);
  }, [location.pathname, location.search]);

  const clearSlide = useCallback(() => {
    setTransition(null);
  }, []);

  const onCoverInComplete = useCallback(() => {
    setTransition((t) => {
      if (!t || t.mode !== "curtain" || t.phase !== "covering") return t;
      return { ...t, phase: "uncovering" };
    });
  }, []);

  const onCoverOutComplete = useCallback(() => {
    setTransition((t) => {
      if (!t || t.mode !== "curtain" || t.phase !== "uncovering") return t;
      return null;
    });
  }, []);

  const onCurtainAnimationEnd = useCallback(
    (e: React.AnimationEvent<HTMLDivElement>) => {
      if (e.target !== e.currentTarget) return;
      const phase = e.currentTarget.getAttribute("data-phase");
      if (phase === "covering") onCoverInComplete();
      else if (phase === "uncovering") onCoverOutComplete();
    },
    [onCoverInComplete, onCoverOutComplete]
  );

  useEffect(() => {
    if (!transition) return;
    if (transition.mode === "slide") {
      const t = window.setTimeout(clearSlide, SLIDE_MS + 48);
      return () => window.clearTimeout(t);
    }
    const { inMs, outMs } = readCurtainDurations();
    const ms = transition.phase === "covering" ? inMs + 120 : outMs + 120;
    const fn = transition.phase === "covering" ? onCoverInComplete : onCoverOutComplete;
    const t = window.setTimeout(fn, ms);
    return () => window.clearTimeout(t);
  }, [transition, clearSlide, onCoverInComplete, onCoverOutComplete]);

  if (!transition) {
    return (
      <div className={`${cls.root} ${cls.rootIdle}`} data-phase="idle">
        <div className={cls.layer}>{outlet}</div>
      </div>
    );
  }

  if (transition.mode === "curtain") {
    const pageContent = transition.phase === "covering" ? transition.fromOutlet : transition.toOutlet;
    const curtainClass = curtainClassFor(transition.phase, transition.direction);
    return (
      <div className={`${cls.root} ${cls.rootTransitioningCurtain}`} data-phase="transitioning" data-variant="curtain">
        <div className={cls.pageLayer}>{pageContent}</div>
        <div
          key={`${transition.id}-${transition.phase}`}
          className={`${cls.curtain} ${curtainClass}`}
          data-phase={transition.phase}
          aria-hidden
          onAnimationEnd={onCurtainAnimationEnd}
        />
      </div>
    );
  }

  const fromClass =
    transition.direction === "forward"
      ? cls.exitForward
      : transition.direction === "backward"
        ? cls.exitBackward
        : cls.exitNeutral;
  const toClass =
    transition.direction === "forward"
      ? cls.enterForward
      : transition.direction === "backward"
        ? cls.enterBackward
        : cls.enterNeutral;

  return (
    <div className={`${cls.root} ${cls.rootTransitioning}`} data-phase="transitioning" data-variant="slide">
      <div key={`from-${transition.id}`} className={`${cls.layer} ${cls.from} ${fromClass}`} aria-hidden>
        {transition.fromOutlet}
      </div>
      <div key={`to-${transition.id}`} className={`${cls.layer} ${cls.to} ${toClass}`}>
        {transition.toOutlet}
      </div>
    </div>
  );
}
