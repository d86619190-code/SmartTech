export type RepairOrderStatus = "completed" | "canceled" | "in_progress";

export type RepairOrder = {
  id: string;
  deviceName: string;
  serviceName: string;
  metaLine: string;
  status: RepairOrderStatus;
  orderDateLabel: string;
  priceRub: number;
  imageUrl: string;
};
