import type {
  TechAlert,
  TechIncomingRequest,
  TechMessage,
  TechPart,
  TechProfile,
  TechRepairJob,
  TechThread,
} from "./types";

export const techProfile: TechProfile = {
  name: "Ivan Petrov",
  role: "Engineer · Apple displays",
  rating: 4.9,
  completedJobs: 842,
  monthEarningsRub: 187_400,
  responseMin: 12,
};

export const techAlerts: TechAlert[] = [
  { id: "al1", at: "11:20", message: "New application EV-10422 - high priority", type: "warning" },
  { id: "al2", at: "10:05", message: "The client confirmed the estimate for EV-10421", type: "info" },
];

export const techIncoming: TechIncomingRequest[] = [
  {
    id: "in1",
    publicId: "EV-10422",
    device: "iPhone 15 Pro",
    deviceType: "phone",
    thumb: "📱",
    issueShort: "The glass is broken, the sensor is partially working",
    clientName: "Pavel N.",
    clientPhone: "+7 916 000-11-22",
    createdAt: "24.03.2026",
    priority: "high",
    status: "pending",
  },
  {
    id: "in2",
    publicId: "EV-10419",
    device: "iPad Air",
    deviceType: "tablet",
    thumb: "📲",
    issueShort: "Doesn't charge, suspect connector",
    clientName: "Elena S.",
    clientPhone: "+7 903 333-44-55",
    createdAt: "23.03.2026",
    priority: "normal",
    status: "pending",
  },
];

export const techRepairs: TechRepairJob[] = [
  {
    id: "r1",
    publicId: "EV-10421",
    incomingId: "in0",
    device: "iPhone 14 Pro",
    deviceType: "phone",
    thumb: "📱",
    customer: "Alexey Smirnov",
    phone: "+7 900 111-22-33",
    email: "alex@mail.ru",
    stage: "repair",
    issue: "The display is broken, the sensor is partially unresponsive. Request for an original part.",
    photos: 2,
    photoUrls: [],
    complexity: "medium",
    clientNotes: "You can call after 18:00",
    laborRub: 2500,
    partsRub: 16490,
    etaHours: 4,
    deadline: "24.03.2026 20:00",
    startedAt: "24.03.2026 09:00",
    diagnosticsIssues: ["Cracks in display module", "Backlight without dead zones"],
    selectedPartIds: ["p1"],
  },
  {
    id: "r2",
    publicId: "EV-10418",
    incomingId: null,
    device: "MacBook Air M2",
    deviceType: "laptop",
    thumb: "💻",
    customer: 'LLC "Start"',
    phone: "+7 495 000-11-22",
    email: "zakaz@start.ru",
    stage: "diagnostics",
    issue: "After the update, macOS does not see Wi-Fi, the indicator is gray.",
    photos: 0,
    photoUrls: [],
    complexity: "high",
    clientNotes: "",
    laborRub: 3500,
    partsRub: 0,
    etaHours: 24,
    deadline: "25.03.2026",
    startedAt: "23.03.2026 14:00",
    diagnosticsIssues: ["Module driver - check"],
    selectedPartIds: [],
  },
  {
    id: "r3",
    publicId: "EV-10410",
    incomingId: null,
    device: "iPad Pro 11",
    deviceType: "tablet",
    thumb: "📲",
    customer: "Dmitry V.",
    phone: "+7 903 777-88-99",
    email: "dv@mail.ru",
    stage: "waiting_approval",
    issue: "Glass replacement + premium display",
    photos: 1,
    photoUrls: [],
    complexity: "medium",
    clientNotes: "Waiting for the amount to be agreed",
    laborRub: 3200,
    partsRub: 11800,
    etaHours: 6,
    diagnosticsIssues: ["The glass is broken, the matrix is ​​intact"],
    selectedPartIds: ["p4"],
  },
];

export const techCompleted: TechRepairJob[] = [
  {
    id: "c1",
    publicId: "EV-10398",
    incomingId: null,
    device: "Pixel 8",
    deviceType: "phone",
    thumb: "📱",
    customer: "Anna L.",
    phone: "+7 904 222-33-44",
    email: "anna@mail.ru",
    stage: "completed",
    issue: "Battery replacement",
    photos: 0,
    photoUrls: [],
    complexity: "low",
    clientNotes: "",
    laborRub: 1200,
    partsRub: 4500,
    etaHours: 2,
    completedAt: "20.03.2026 16:30",
    rating: 5,
    earningsRub: 2100,
    diagnosticsIssues: [],
    selectedPartIds: ["p2"],
  },
];

export const techPartsCatalog: TechPart[] = [
  { id: "p1", name: "iPhone 14 Pro Display Module (OEM)", oem: true, inStock: true, priceRub: 16490, deviceHint: "iPhone 14 Pro" },
  { id: "p2", name: "Pixel 8 battery compatible", oem: false, inStock: true, priceRub: 4500, deviceHint: "Pixel 8" },
  { id: "p3", name: "iPad Air bottom connector board", oem: true, inStock: false, priceRub: 3200, deviceHint: "iPad Air" },
  { id: "p4", name: "iPad Pro 11 Premium Display Module", oem: false, inStock: true, priceRub: 11800, deviceHint: "iPad Pro 11" },
  { id: "p5", name: "Wi‑Fi cable MacBook Air M2", oem: true, inStock: true, priceRub: 8900, deviceHint: "MacBook Air M2" },
];

export const techThreads: TechThread[] = [
  {
    id: "th1",
    clientName: "Alexey Smirnov",
    orderPublicId: "EV-10421",
    repairId: "r1",
    lastMessage: "When can I pick it up?",
    updatedAt: "24.03 11:00",
  },
  {
    id: "th2",
    clientName: 'LLC "Start"',
    orderPublicId: "EV-10418",
    repairId: "r2",
    lastMessage: "Need a certificate after repair",
    updatedAt: "23.03 17:40",
  },
];

const chat1: TechMessage[] = [
  { id: "m1", from: "client", text: "Hello, can you tell me the timing?", at: "24.03 09:10" },
  { id: "m2", from: "tech", text: "Good afternoon The part is already in service, it will be ready by evening.", at: "24.03 09:25" },
  { id: "m3", from: "client", text: "When can I pick it up?", at: "24.03 11:00" },
];

const chat2: TechMessage[] = [
  { id: "m4", from: "client", text: "We need a certificate of completed work for accounting.", at: "23.03 16:00" },
  { id: "m5", from: "tech", text: "I’ll send it to zakaz@start.ru by email after diagnostics.", at: "23.03 17:40" },
];

export const techMessagesByThread: Record<string, TechMessage[]> = {
  th1: chat1,
  th2: chat2,
};

export const techTemplates = [
  "The device has been put into operation",
  "The diagnostics are completed, we are preparing an estimate",
  "Please agree on the price in the application",
  "The repair is complete, you can pick it up",
];

export function getTechIncoming(id: string): TechIncomingRequest | undefined {
  return techIncoming.find((x) => x.id === id);
}

export function getTechRepair(id: string): TechRepairJob | undefined {
  return techRepairs.find((x) => x.id === id) ?? techCompleted.find((x) => x.id === id);
}

export function getTechThread(id: string): TechThread | undefined {
  return techThreads.find((t) => t.id === id);
}
