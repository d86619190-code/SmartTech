export type AdminOrderStatus =
  | "new"
  | "diagnostics"
  | "approval"
  | "in_progress"
  | "ready"
  | "completed"
  | "cancelled";

export type AdminOrderRow = {
  id: string;
  publicId: string;
  device: string;
  customer: string;
  phone: string;
  status: AdminOrderStatus;
  technician: string | null;
  totalRub: number;
  createdAt: string;
  deviceType: "phone" | "tablet" | "laptop";
};

export type AdminOrderDetail = AdminOrderRow & {
  email: string;
  issue: string;
  photos: number;
  repairOption: string;
  laborRub: number;
  partsRub: number;
  notes: string[];
  timeline: { at: string; label: string }[];
};

export type AdminUser = {
  id: string;
  name: string;
  phone: string;
  email: string;
  ordersCount: number;
  lastVisit: string;
  city: string;
};

export type AdminTechnician = {
  id: string;
  name: string;
  activeOrders: number;
  rating: number;
  completed: number;
  revenueRub: number;
  specialty: string;
};

export type AdminPriceRow = {
  id: string;
  category: string;
  deviceGroup: string;
  service: string;
  laborRub: number;
  partsFromRub: number;
};

export type AdminCategory = {
  id: string;
  name: string;
  children: { id: string; name: string }[];
};

export type AdminLogEvent = {
  id: string;
  at: string;
  type: "order" | "system" | "user" | "tech";
  message: string;
  severity: "info" | "warning" | "error";
};
