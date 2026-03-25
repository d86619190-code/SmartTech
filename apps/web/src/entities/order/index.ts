export type { ServiceOrder, RepairQuoteOption } from "./model/types";
export { ORDER_FLOW_STEPS, stepIndex, type OrderFlowStepId } from "./model/orderFlow";
export {
  mockOrders,
  getActiveOrderPreview,
  getOrderById,
  getOrdersNeedingApproval,
} from "./model/mockOrders";
