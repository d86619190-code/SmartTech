import * as React from "react";

type MobileNavValue = {
  openMobileNav: () => void;
  closeMobileNav: () => void;
  toggleMobileNav: () => void;
  isMobileNavOpen: boolean;
};

const MobileNavContext = React.createContext<MobileNavValue | null>(null);

export function MobileNavProvider({ children }: { children: React.ReactNode }) {
  const [isMobileNavOpen, setOpen] = React.useState(false);

  const openMobileNav = React.useCallback(() => setOpen(true), []);
  const closeMobileNav = React.useCallback(() => setOpen(false), []);
  const toggleMobileNav = React.useCallback(() => setOpen((v) => !v), []);

  const value = React.useMemo(
    () => ({
      openMobileNav,
      closeMobileNav,
      toggleMobileNav,
      isMobileNavOpen,
    }),
    [openMobileNav, closeMobileNav, toggleMobileNav, isMobileNavOpen]
  );

  React.useEffect(() => {
    if (!isMobileNavOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMobileNav();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isMobileNavOpen, closeMobileNav]);

  React.useEffect(() => {
    if (typeof document === "undefined") return;
    if (isMobileNavOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
    return undefined;
  }, [isMobileNavOpen]);

  return <MobileNavContext.Provider value={value}>{children}</MobileNavContext.Provider>;
}

export function useMobileNav(): MobileNavValue {
  const ctx = React.useContext(MobileNavContext);
  if (!ctx) {
    throw new Error("useMobileNav must be used within MobileNavProvider");
  }
  return ctx;
}

export function useMobileNavOptional(): MobileNavValue | null {
  return React.useContext(MobileNavContext);
}
