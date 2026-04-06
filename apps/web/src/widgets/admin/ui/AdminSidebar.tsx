import * as React from "react";
import { NavLink } from "react-router-dom";
import { useMobileNavOptional } from "@/app/mobileNavContext";
import { useI18n } from "@/shared/i18n/i18n";
import cls from "./AdminSidebar.module.css";

type Item = {
  to: string;
  labelKey: string;
  icon: "dash" | "orders" | "users" | "tech" | "price" | "cat" | "chart" | "log" | "gear";
};

const ITEMS: Item[] = [
  { to: "/admin", labelKey: "admin.dashboard", icon: "dash" },
  { to: "/admin/orders", labelKey: "admin.orders", icon: "orders" },
  { to: "/admin/users", labelKey: "admin.clients", icon: "users" },
  { to: "/admin/technicians", labelKey: "admin.masters", icon: "tech" },
  { to: "/admin/pricing", labelKey: "admin.pricing", icon: "price" },
  { to: "/admin/services", labelKey: "admin.services", icon: "cat" },
  { to: "/admin/analytics", labelKey: "admin.analytics", icon: "chart" },
  { to: "/admin/logs", labelKey: "admin.logs", icon: "log" },
  { to: "/admin/settings", labelKey: "admin.settings", icon: "gear" },
];

function Icon({ name }: { name: Item["icon"] }) {
  const common = { className: cls.ico, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.75 };
  switch (name) {
    case "dash":
      return (
        <svg {...common}>
          <path d="M4 4h7v7H4V4zm9 0h7v4h-7V4zM4 13h7v7H4v-7zm9 5h7v2h-7v-2zm0-4h7v2h-7v-2z" />
        </svg>
      );
    case "orders":
      return (
        <svg {...common}>
          <path d="M9 5H5v4M15 5h4v4M9 19H5v-4M15 19h4v-4" strokeLinecap="round" />
          <rect x="9" y="9" width="6" height="6" rx="1" />
        </svg>
      );
    case "users":
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="3.5" />
          <path d="M5 20v-1a5 5 0 0110 0v1" strokeLinecap="round" />
        </svg>
      );
    case "tech":
      return (
        <svg {...common}>
          <path d="M12 3l8 4v6c0 5-3.5 8-8 8.5C7.5 21 4 18 4 13V7l8-4z" strokeLinejoin="round" />
        </svg>
      );
    case "price":
      return (
        <svg {...common}>
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" strokeLinecap="round" />
        </svg>
      );
    case "cat":
      return (
        <svg {...common}>
          <path d="M4 6h16M4 12h16M4 18h10" strokeLinecap="round" />
        </svg>
      );
    case "chart":
      return (
        <svg {...common}>
          <path d="M4 19V5M4 19h16M8 15v4M12 11v8M16 7v12" strokeLinecap="round" />
        </svg>
      );
    case "log":
      return (
        <svg {...common}>
          <path d="M6 4h9l3 3v13H6V4z" strokeLinejoin="round" />
          <path d="M9 12h6M9 16h4" strokeLinecap="round" />
        </svg>
      );
    case "gear":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
}

export const AdminSidebar: React.FC = () => {
  const mobileNav = useMobileNavOptional();
  const { t } = useI18n();
  const closeMenu = () => mobileNav?.closeMobileNav();

  return (
    <aside id="admin-sidebar" className={cls.root} aria-label={t("admin.menu")}>
      <div className={cls.brand}>
        <span className={cls.brandMark} aria-hidden />
        <span className={cls.brandText}>Service Admin</span>
      </div>
      <nav className={cls.nav} aria-label={t("admin.sections")}>
        {ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/admin"}
            onClick={closeMenu}
            className={({ isActive }) => [cls.item, isActive && cls.active].filter(Boolean).join(" ")}
          >
            <Icon name={item.icon} />
            <span>{t(item.labelKey)}</span>
          </NavLink>
        ))}
      </nav>
      <div className={cls.spacer} aria-hidden />
      <div className={cls.divider} role="separator" />
      <div className={cls.footer}>
        <NavLink to="/" onClick={closeMenu} className={cls.back}>
          ← {t("admin.backToSite")}
        </NavLink>
      </div>
    </aside>
  );
};
