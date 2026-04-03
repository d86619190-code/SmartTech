import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import cls from "./LandingExitNav.module.css";

type Ctx = {
  navigateWithTransition: (to: string) => void;
  isExiting: boolean;
};

const LandingExitNavContext = React.createContext<Ctx | null>(null);

/** Синхронно с `animation-duration` у `.coverPanel` в LandingExitNav.module.css */
const EXIT_ANIM_MS = 880;
/** После fade-in (45% × 880 ≈ 396 ms при linear) — маршрут меняется под полным затемнением */
const NAVIGATE_AT_MS = 400;
const FALLBACK_PAD_MS = 400;

export function useLandingExitNav(): Ctx {
  const v = React.useContext(LandingExitNavContext);
  if (!v) throw new Error("useLandingExitNav must be used within LandingExitNavProvider");
  return v;
}

export type LandingLinkProps = Omit<React.ComponentProps<typeof Link>, "to"> & { to: string };

export function LandingLink({ to, onClick, ...rest }: LandingLinkProps) {
  const { navigateWithTransition } = useLandingExitNav();
  return (
    <Link
      {...rest}
      to={to}
      onClick={(e) => {
        e.preventDefault();
        navigateWithTransition(to);
        onClick?.(e);
      }}
    />
  );
}

export function LandingExitNavProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [pending, setPending] = React.useState<string | null>(null);
  const phaseRef = React.useRef<"idle" | "busy">("idle");
  const targetRef = React.useRef<string | null>(null);
  const navigatedRef = React.useRef(false);

  const clearOverlay = React.useCallback(() => {
    phaseRef.current = "idle";
    targetRef.current = null;
    setPending(null);
  }, []);

  const navigateWithTransition = React.useCallback(
    (to: string) => {
      if (phaseRef.current !== "idle") return;
      if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        navigate(to);
        return;
      }
      navigatedRef.current = false;
      phaseRef.current = "busy";
      targetRef.current = to;
      setPending(to);
    },
    [navigate],
  );

  const onExitFadeEnd = React.useCallback(
    (e: React.AnimationEvent<HTMLDivElement>) => {
      if (e.target !== e.currentTarget) return;
      clearOverlay();
    },
    [clearOverlay],
  );

  React.useEffect(() => {
    if (!pending) return;

    const navTimer = window.setTimeout(() => {
      const path = targetRef.current;
      if (path && !navigatedRef.current) {
        navigatedRef.current = true;
        navigate(path);
      }
    }, NAVIGATE_AT_MS);

    const failTimer = window.setTimeout(() => {
      const path = targetRef.current;
      if (path && !navigatedRef.current) {
        navigatedRef.current = true;
        navigate(path);
      }
      clearOverlay();
    }, EXIT_ANIM_MS + FALLBACK_PAD_MS);

    return () => {
      window.clearTimeout(navTimer);
      window.clearTimeout(failTimer);
    };
  }, [pending, navigate, clearOverlay]);

  const value = React.useMemo(
    () => ({
      navigateWithTransition,
      isExiting: pending !== null,
    }),
    [navigateWithTransition, pending],
  );

  return (
    <LandingExitNavContext.Provider value={value}>
      {children}
      {pending ? (
        <div className={cls.exitOverlay} aria-hidden>
          <div className={cls.coverPanel} onAnimationEnd={onExitFadeEnd} />
        </div>
      ) : null}
    </LandingExitNavContext.Provider>
  );
}
