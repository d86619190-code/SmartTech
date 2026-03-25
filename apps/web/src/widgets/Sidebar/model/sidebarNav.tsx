import type { ComponentType } from "react";
import {
  IconDashboard,
  IconHelp,
  IconHistory,
  IconMapPin,
  IconMessage,
  IconPlus,
  IconTrack,
  IconUser,
} from "@/shared/ui/Icon/NavAndAuthIcons";

export type SidebarNavItem = {
  key: string;
  label: string;
  to: string;
  Icon: ComponentType<{ className?: string }>;
};

export const primarySidebarItems: SidebarNavItem[] = [
  { key: "home", label: "Главная", to: "/", Icon: IconDashboard },
  { key: "tracking", label: "Отслеживание", to: "/tracking", Icon: IconTrack },
  { key: "create", label: "Новая заявка", to: "/create-order", Icon: IconPlus },
  { key: "history", label: "История заказов", to: "/history", Icon: IconHistory },
  { key: "messages", label: "Сообщения", to: "/messages", Icon: IconMessage },
  { key: "help", label: "Помощь", to: "/help", Icon: IconHelp },
  { key: "contacts", label: "Контакты", to: "/contacts", Icon: IconMapPin },
  { key: "profile", label: "Профиль", to: "/profile", Icon: IconUser },
];
