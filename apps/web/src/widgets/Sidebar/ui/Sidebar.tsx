import * as React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useMobileNavOptional } from "@/app/mobileNavContext";
import { useLandingExitNav } from "@/pages/Landing/lib/LandingExitNav";
import { getInboxSummaryApi, type InboxSummary } from "@/shared/lib/clientInboxApi";
import { useInboxSummarySse } from "@/shared/lib/realtime/useSseStreams";
import { readAuthSession } from "@/shared/lib/authSession";
import { useI18n, type Locale } from "@/shared/i18n/i18n";
import { IconLogin } from "@/shared/ui/Icon/NavAndAuthIcons";
import { primarySidebarItems } from "../model/sidebarNav";
import cls from "./Sidebar.module.css";

export const Sidebar: React.FC = () => {
  const mobileNav = useMobileNavOptional();
  const location = useLocation();
  const { navigateWithTransition } = useLandingExitNav();
  const closeMenu = () => mobileNav?.closeMobileNav();
  const auth = readAuthSession();
  const { t, locale, setLocale } = useI18n();
  const [badgeCount, setBadgeCount] = React.useState(0);
  const userName = auth?.user.name?.trim() || t("common.profile");
  const userAvatar = auth?.user.avatarUrl?.trim() || "";
  const userInitial = userName.charAt(0).toUpperCase();

  React.useEffect(() => {
    if (!auth) {
      setBadgeCount(0);
      return;
    }
    let mounted = true;
    const load = async () => {
      try {
        const inbox = await getInboxSummaryApi();
        if (mounted) setBadgeCount(inbox.badgeCount);
      } catch {
        if (mounted) setBadgeCount(0);
      }
    };
    void load();
    return () => {
      mounted = false;
    };
  }, [auth, location.pathname]);

  const onInboxBadge = React.useCallback((summary: InboxSummary) => {
    setBadgeCount(summary.badgeCount);
  }, []);

  useInboxSummarySse(!!auth, onInboxBadge);

  const onLanguageChange = React.useCallback(
    (next: Locale) => {
      if (next !== locale) setLocale(next);
    },
    [locale, setLocale]
  );

  return (
    <aside id="app-sidebar" className={cls.root} aria-label={t("sidebar.sections")}>
      <nav className={cls.nav} aria-label={t("sidebar.mainMenu")}>
        {primarySidebarItems.map((item) =>
          item.to === "/landing" ? (
            <NavLink
              key={item.key}
              to={item.to}
              end={false}
              onClick={(e) => {
                e.preventDefault();
                closeMenu();
                navigateWithTransition(item.to);
              }}
              className={({ isActive }) => [cls.item, isActive && cls.active].filter(Boolean).join(" ")}
            >
              <span className={cls.icon}>
                <item.Icon />
              </span>
              <span className={cls.itemLabel}>{t(item.labelKey)}</span>
            </NavLink>
          ) : (
            <NavLink
              key={item.key}
              to={item.to}
              end={item.to === "/"}
              onClick={closeMenu}
              className={({ isActive }) => [cls.item, isActive && cls.active].filter(Boolean).join(" ")}
            >
              <span className={cls.icon}>
                <item.Icon />
              </span>
              <span className={cls.itemLabel}>
                {t(item.labelKey)}
                {item.key === "messages" && badgeCount > 0 ? <span className={cls.badge}>{badgeCount}</span> : null}
              </span>
            </NavLink>
          ),
        )}
      </nav>
      <div className={cls.spacer} aria-hidden />
      <div className={cls.langRow} aria-label={t("sidebar.language")}>
        <span className={cls.langLabel}>{t("sidebar.language")}</span>
        <div className={cls.langButtons}>
          <button
            type="button"
            className={[cls.langButton, locale === "ru" ? cls.langButtonActive : ""].filter(Boolean).join(" ")}
            onClick={() => onLanguageChange("ru")}
            aria-pressed={locale === "ru"}
          >
            {t("sidebar.langRu")}
          </button>
          <button
            type="button"
            className={[cls.langButton, locale === "en" ? cls.langButtonActive : ""].filter(Boolean).join(" ")}
            onClick={() => onLanguageChange("en")}
            aria-pressed={locale === "en"}
          >
            {t("sidebar.langEn")}
          </button>
        </div>
      </div>
      <div className={cls.divider} role="separator" />
      <div className={cls.footer}>
        {auth ? (
          <NavLink to="/profile" onClick={closeMenu} className={({ isActive }) => [cls.item, isActive && cls.active].filter(Boolean).join(" ")}>
            <span className={cls.userAvatarWrap}>
              {userAvatar ? (
                <img src={userAvatar} alt="" className={cls.userAvatar} />
              ) : (
                <span className={cls.userAvatarFallback} aria-hidden>
                  {userInitial}
                </span>
              )}
            </span>
            <span className={cls.userName}>{userName}</span>
          </NavLink>
        ) : (
          <NavLink to="/login" onClick={closeMenu} className={({ isActive }) => [cls.item, isActive && cls.active].filter(Boolean).join(" ")}>
            <span className={cls.icon}>
              <IconLogin />
            </span>
            <span>{t("auth.login")}</span>
          </NavLink>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
