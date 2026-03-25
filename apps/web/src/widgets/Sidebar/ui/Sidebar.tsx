import * as React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useMobileNavOptional } from "@/app/mobileNavContext";
import { getInboxSummaryApi, type InboxSummary } from "@/shared/lib/clientInboxApi";
import { useInboxSummarySse } from "@/shared/lib/realtime/useSseStreams";
import { readAuthSession } from "@/shared/lib/authSession";
import { IconLogin } from "@/shared/ui/Icon/NavAndAuthIcons";
import { primarySidebarItems } from "../model/sidebarNav";
import cls from "./Sidebar.module.css";

export const Sidebar: React.FC = () => {
  const mobileNav = useMobileNavOptional();
  const location = useLocation();
  const closeMenu = () => mobileNav?.closeMobileNav();
  const auth = readAuthSession();
  const [badgeCount, setBadgeCount] = React.useState(0);
  const userName = auth?.user.name?.trim() || "Профиль";
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

  return (
    <aside id="app-sidebar" className={cls.root} aria-label="Разделы приложения">
      <nav className={cls.nav} aria-label="Основное меню">
        {primarySidebarItems.map((item) => (
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
              {item.label}
              {item.key === "messages" && badgeCount > 0 ? <span className={cls.badge}>{badgeCount}</span> : null}
            </span>
          </NavLink>
        ))}
      </nav>
      <div className={cls.spacer} aria-hidden />
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
            <span>Вход</span>
          </NavLink>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
