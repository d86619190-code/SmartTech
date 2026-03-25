export type TechRepairStage =
  | "accepted"
  | "diagnostics"
  | "waiting_approval"
  | "repair"
  | "ready"
  | "completed";

export type TechIncomingStatus = "pending" | "accepted" | "declined";

export type TechIncomingRequest = {
  id: string;
  publicId: string;
  device: string;
  deviceType: "phone" | "tablet" | "laptop";
  thumb: string;
  issueShort: string;
  clientName: string;
  clientPhone: string;
  createdAt: string;
  priority: "normal" | "high";
  status: TechIncomingStatus;
};

export type TechRepairJob = {
  id: string;
  publicId: string;
  incomingId: string | null;
  device: string;
  deviceType: "phone" | "tablet" | "laptop";
  thumb: string;
  customer: string;
  phone: string;
  email: string;
  stage: TechRepairStage;
  issue: string;
  photos: number;
  photoUrls: string[];
  complexity: "low" | "medium" | "high";
  clientNotes: string;
  laborRub: number;
  partsRub: number;
  etaHours: number;
  deadline?: string;
  startedAt?: string;
  completedAt?: string;
  rating?: number;
  earningsRub?: number;
  diagnosticsIssues: string[];
  selectedPartIds: string[];
};

export type TechPart = {
  id: string;
  name: string;
  oem: boolean;
  inStock: boolean;
  priceRub: number;
  deviceHint: string;
};

export type TechMessage = {
  id: string;
  from: "client" | "tech";
  text: string;
  at: string;
  attachment?: string;
};

export type TechThread = {
  id: string;
  clientName: string;
  orderPublicId: string;
  repairId: string;
  lastMessage: string;
  updatedAt: string;
};

export type TechAlert = {
  id: string;
  at: string;
  message: string;
  type: "info" | "warning";
};

export type TechProfile = {
  name: string;
  role: string;
  rating: number;
  completedJobs: number;
  monthEarningsRub: number;
  responseMin: number;
};
