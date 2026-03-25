import * as React from "react";
import { NavLink } from "react-router-dom";
import { useMobileNavOptional } from "@/app/mobileNavContext";
import { techApi } from "@/shared/lib/techApi";
import cls from "./TechSidebar.module.css";

type Icon = "dash" | "inbox" | "tasks" | "done" | "chat" | "user" | "gear";

const ITEMS: { to: string; label: string; icon: Icon; end?: boolean }[] = [
  { to: "/tech", label: "Дашборд", icon: "dash", end: true },
  { to: "/tech/incoming", label: "Входящие", icon: "inbox" },
  { to: "/tech/tasks", label: "Задачи", icon: "tasks" },
  { to: "/tech/completed", label: "Завершённые", icon: "done" },
  { to: "/tech/messages", label: "Сообщения", icon: "chat" },
  { to: "/tech/profile", label: "Профиль", icon: "user" },
  { to: "/tech/settings", label: "Настройки", icon: "gear" },
];

function Icon({ name }: { name: Icon }) {
  const common = { className: cls.ico, viewBox: "0 0 24 24" as const, fill: "none", stroke: "currentColor", strokeWidth: 1.75 };
  switch (name) {
    case "dash":
      return (
        <svg {...common}>
          <path d="M4 4h7v7H4V4zm9 0h7v4h-7V4zM4 13h7v7H4v-7zm9 5h7v2h-7v-2zm0-4h7v2h-7v-2z" />
        </svg>
      );
    case "inbox":
      return (
        <svg {...common}>
          <path d="M4 4h16v16H4z" strokeLinejoin="round" />
          <path d="M4 9h16" />
          <path d="M8 13h3M13 13h3" strokeLinecap="round" />
        </svg>
      );
    case "tasks":
      return (
        <svg {...common}>
          <path d="M9 11l3 3L22 4" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="3" y="3" width="18" height="18" rx="2" />
        </svg>
      );
    case "done":
      return (
        <svg {...common}>
          <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "chat":
      return (
        <svg {...common}>
          <path d="M21 12a8 8 0 10-3.2 6.4L21 21l-2.6-3.2A8 8 0 0021 12z" strokeLinejoin="round" />
        </svg>
      );
    case "user":
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="3.5" />
          <path d="M5 20v-1a5 5 0 0110 0v1" strokeLinecap="round" />
        </svg>
      );
    case "gear":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" />
          <path
            d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
            strokeLinecap="round"
          />
        </svg>
      );
    default:
      return null;
  }
}

export const TechSidebar: React.FC = () => {
  const mobileNav = useMobileNavOptional();
  const closeMenu = () => mobileNav?.closeMobileNav();
  const [incomingBadge, setIncomingBadge] = React.useState(0);

  React.useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const d = await techApi.getDashboard();
        if (mounted) setIncomingBadge(Number(d.pendingIncomingCount ?? 0));
      } catch {
        if (mounted) setIncomingBadge(0);
      }
    };
    void load();
    const t = window.setInterval(() => void load(), 3000);
    return () => {
      mounted = false;
      window.clearInterval(t);
    };
  }, []);

  return (
    <aside id="tech-sidebar" className={cls.root} aria-label="Меню мастера">
      <div className={cls.brand}>
        <span className={cls.brandMark} aria-hidden />
        <span className={cls.brandText}>Сервис · Мастер</span>
      </div>
      <nav className={cls.nav} aria-label="Разделы мастера">
        {ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={closeMenu}
            className={({ isActive }) => [cls.item, isActive && cls.active].filter(Boolean).join(" ")}
          >
            <Icon name={item.icon} />
            <span className={cls.itemLabel}>
              {item.label}
              {item.to === "/tech/incoming" && incomingBadge > 0 ? <span className={cls.badge}>{incomingBadge}</span> : null}
            </span>
          </NavLink>
        ))}
      </nav>
      <div className={cls.spacer} aria-hidden />
      <div className={cls.divider} role="separator" />
      <div className={cls.footer}>
        <NavLink to="/" onClick={closeMenu} className={cls.back}>
          ← К сайту
        </NavLink>
      </div>
    </aside>
  );
};
