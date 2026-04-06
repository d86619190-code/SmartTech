import type { ComponentType } from "react";
import {
  IconDashboard,
  IconHelp,
  IconHistory,
  IconMapPin,
  IconMessage,
  IconPlus,
  IconSpark,
  IconTrack,
  IconUser,
} from "@/shared/ui/Icon/NavAndAuthIcons";

export type SidebarNavItem = {
  key: string;
  labelKey: string;
  to: string;
  Icon: ComponentType<{ className?: string }>;
};

export const primarySidebarItems: SidebarNavItem[] = [
  { key: "home", labelKey: "sidebar.home", to: "/", Icon: IconDashboard },
  { key: "landing", labelKey: "sidebar.landing", to: "/landing", Icon: IconSpark },
  { key: "tracking", labelKey: "sidebar.tracking", to: "/tracking", Icon: IconTrack },
  { key: "create", labelKey: "sidebar.create", to: "/create-order", Icon: IconPlus },
  { key: "history", labelKey: "sidebar.history", to: "/history", Icon: IconHistory },
  { key: "messages", labelKey: "sidebar.messages", to: "/messages", Icon: IconMessage },
  { key: "help", labelKey: "sidebar.help", to: "/help", Icon: IconHelp },
  { key: "contacts", labelKey: "sidebar.contacts", to: "/contacts", Icon: IconMapPin },
  { key: "profile", labelKey: "sidebar.profile", to: "/profile", Icon: IconUser },
];
