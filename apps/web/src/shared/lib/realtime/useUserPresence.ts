import * as React from "react";

type PresenceState = "online" | "offline";

export function useUserPresence(idleMs = 45_000): PresenceState {
  const [lastActiveAt, setLastActiveAt] = React.useState<number>(() => Date.now());
  const [isVisible, setIsVisible] = React.useState<boolean>(() => document.visibilityState === "visible");
  const [now, setNow] = React.useState<number>(() => Date.now());

  React.useEffect(() => {
    const onMove = () => setLastActiveAt(Date.now());
    const onKey = () => setLastActiveAt(Date.now());
    const onPointer = () => setLastActiveAt(Date.now());
    const onVisibility = () => {
      setIsVisible(document.visibilityState === "visible");
      if (document.visibilityState === "visible") setLastActiveAt(Date.now());
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointer, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  React.useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);

  if (!isVisible) return "offline";
  return now - lastActiveAt <= idleMs ? "online" : "offline";
}

