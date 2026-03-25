import * as React from "react";
import type { AdminOrderStatus } from "@/entities/admin";
import cls from "./AdminStatusBadge.module.css";

const LABELS: Record<AdminOrderStatus, string> = {
  new: "Новый",
  diagnostics: "Диагностика",
  approval: "Согласование",
  in_progress: "В работе",
  ready: "Готово",
  completed: "Завершён",
  cancelled: "Отменён",
};

const CLASS: Record<AdminOrderStatus, string> = {
  new: cls.neutral,
  diagnostics: cls.warning,
  approval: cls.warning,
  in_progress: cls.progress,
  ready: cls.success,
  completed: cls.success,
  cancelled: cls.danger,
};

export const AdminStatusBadge: React.FC<{ status: AdminOrderStatus }> = ({ status }) => (
  <span className={[cls.root, CLASS[status]].join(" ")}>{LABELS[status]}</span>
);
