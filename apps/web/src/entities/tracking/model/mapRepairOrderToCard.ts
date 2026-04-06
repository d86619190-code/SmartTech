import type { RepairOrder, RepairOrderStatus } from "@/entities/repair-order";
import type { TrackingCardData } from "./types";

function progressFromStatus(s: RepairOrderStatus): number {
  switch (s) {
    case "completed":
      return 100;
    case "in_progress":
      return 58;
    case "canceled":
      return 0;
    default:
      return 40;
  }
}

/** id order in `entities/order` (mockOrders) to go to details */
function demoRouteOrderId(order: RepairOrder): string | undefined {
  return order.id;
}

export function repairOrderToTrackingCard(order: RepairOrder): TrackingCardData {
  return {
    id: order.id,
    deviceName: order.deviceName,
    issueLabel: order.serviceName,
    imageUrl: order.imageUrl,
    progressPercent: progressFromStatus(order.status),
    estimateLabel:
      order.status === "completed"
        ? "Completed"
        : order.status === "canceled"
          ? "Canceled"
          : "See order details",
    orderId: demoRouteOrderId(order),
  };
}
