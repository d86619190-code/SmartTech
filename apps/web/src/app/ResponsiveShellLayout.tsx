import * as React from "react";
import { useEffect } from "react";
import { IconMenu } from "@/shared/ui/Icon/NavAndAuthIcons";
import { useI18n } from "@/shared/i18n/i18n";
import { useMediaQuery } from "@/shared/lib/useMediaQuery";
import { MobileNavProvider, useMobileNav } from "./mobileNavContext";
import cls from "./ResponsiveShellLayout.module.css";

const MEDIA_MIN_DESKTOP = "(min-width: 768px)";

type ResponsiveShellLayoutProps = {
  sidebarId: string;
  sidebar: React.ReactNode;
  children: React.ReactNode;
};

function ResponsiveShellLayoutInner({ sidebarId, sidebar, children }: ResponsiveShellLayoutProps) {
  const { isMobileNavOpen, closeMobileNav, toggleMobileNav } = useMobileNav();
  const { t } = useI18n();
  const isDesktop = useMediaQuery(MEDIA_MIN_DESKTOP);

  useEffect(() => {
    if (isDesktop) closeMobileNav();
  }, [isDesktop, closeMobileNav]);

  return (
    <div className={cls.root}>
      <button
        type="button"
        className={cls.backdrop}
        data-visible={isMobileNavOpen}
        onClick={closeMobileNav}
        aria-label={t("nav.closeMenu")}
        tabIndex={isMobileNavOpen ? 0 : -1}
      />
      <div className={cls.sidebarShell} data-open={isMobileNavOpen}>
        {sidebar}
      </div>
      <button
        type="button"
        className={cls.burger}
        aria-label={isMobileNavOpen ? t("nav.closeMenu") : t("nav.openMenu")}
        aria-expanded={isMobileNavOpen}
        aria-controls={sidebarId}
        onClick={toggleMobileNav}
      >
        <IconMenu size={22} />
      </button>
      <main className={cls.main}>{children}</main>
    </div>
  );
}

export function ResponsiveShellLayout(props: ResponsiveShellLayoutProps) {
  return (
    <MobileNavProvider>
      <ResponsiveShellLayoutInner {...props} />
    </MobileNavProvider>
  );
}
