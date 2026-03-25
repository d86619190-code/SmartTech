/** Этапы заказа по ТЗ (таймлайн отслеживания) */
export const ORDER_FLOW_STEPS = [
  { id: "created", label: "Создана" },
  { id: "awaiting_device", label: "Ожидает передачи устройства" },
  { id: "diagnostics", label: "Диагностика" },
  { id: "awaiting_approval", label: "Согласование ремонта" },
  { id: "in_repair", label: "В работе" },
  { id: "ready", label: "Готово" },
  { id: "completed", label: "Выдано" },
] as const;

export type OrderFlowStepId = (typeof ORDER_FLOW_STEPS)[number]["id"];

export function stepIndex(id: OrderFlowStepId): number {
  return ORDER_FLOW_STEPS.findIndex((s) => s.id === id);
}
