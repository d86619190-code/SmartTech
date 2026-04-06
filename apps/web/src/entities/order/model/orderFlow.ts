/** Order stages according to technical specifications (tracking timeline) */
export const ORDER_FLOW_STEPS = [
  { id: "created", label: "Created" },
  { id: "awaiting_device", label: "Waiting for device transfer" },
  { id: "diagnostics", label: "Diagnostics" },
  { id: "awaiting_approval", label: "Repair approval" },
  { id: "in_repair", label: "In progress" },
  { id: "ready", label: "Ready" },
  { id: "completed", label: "Issued" },
] as const;

export type OrderFlowStepId = (typeof ORDER_FLOW_STEPS)[number]["id"];

export function stepIndex(id: OrderFlowStepId): number {
  return ORDER_FLOW_STEPS.findIndex((s) => s.id === id);
}
