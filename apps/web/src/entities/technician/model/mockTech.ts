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
  name: "Иван Петров",
  role: "Инженер · дисплеи Apple",
  rating: 4.9,
  completedJobs: 842,
  monthEarningsRub: 187_400,
  responseMin: 12,
};

export const techAlerts: TechAlert[] = [
  { id: "al1", at: "11:20", message: "Новая заявка EV-10422 — высокий приоритет", type: "warning" },
  { id: "al2", at: "10:05", message: "Клиент подтвердил смету по EV-10421", type: "info" },
];

export const techIncoming: TechIncomingRequest[] = [
  {
    id: "in1",
    publicId: "EV-10422",
    device: "iPhone 15 Pro",
    deviceType: "phone",
    thumb: "📱",
    issueShort: "Разбито стекло, сенсор работает частично",
    clientName: "Павел Н.",
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
    issueShort: "Не заряжается, подозрение на разъём",
    clientName: "Елена С.",
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
    customer: "Алексей Смирнов",
    phone: "+7 900 111-22-33",
    email: "alex@mail.ru",
    stage: "repair",
    issue: "Разбит дисплей, сенсор частично не откликается. Запрос на оригинальную деталь.",
    photos: 2,
    photoUrls: [],
    complexity: "medium",
    clientNotes: "Можно звонить после 18:00",
    laborRub: 2500,
    partsRub: 16490,
    etaHours: 4,
    deadline: "24.03.2026 20:00",
    startedAt: "24.03.2026 09:00",
    diagnosticsIssues: ["Трещины по модулю дисплея", "Подсветка без битых зон"],
    selectedPartIds: ["p1"],
  },
  {
    id: "r2",
    publicId: "EV-10418",
    incomingId: null,
    device: "MacBook Air M2",
    deviceType: "laptop",
    thumb: "💻",
    customer: "ООО «Старт»",
    phone: "+7 495 000-11-22",
    email: "zakaz@start.ru",
    stage: "diagnostics",
    issue: "После обновления macOS не видит Wi‑Fi, индикатор серый.",
    photos: 0,
    photoUrls: [],
    complexity: "high",
    clientNotes: "",
    laborRub: 3500,
    partsRub: 0,
    etaHours: 24,
    deadline: "25.03.2026",
    startedAt: "23.03.2026 14:00",
    diagnosticsIssues: ["Драйвер модуля — проверка"],
    selectedPartIds: [],
  },
  {
    id: "r3",
    publicId: "EV-10410",
    incomingId: null,
    device: "iPad Pro 11",
    deviceType: "tablet",
    thumb: "📲",
    customer: "Дмитрий В.",
    phone: "+7 903 777-88-99",
    email: "dv@mail.ru",
    stage: "waiting_approval",
    issue: "Замена стекла + дисплей премиум",
    photos: 1,
    photoUrls: [],
    complexity: "medium",
    clientNotes: "Ждёт согласования суммы",
    laborRub: 3200,
    partsRub: 11800,
    etaHours: 6,
    diagnosticsIssues: ["Стекло разбито, матрица цела"],
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
    customer: "Анна Л.",
    phone: "+7 904 222-33-44",
    email: "anna@mail.ru",
    stage: "completed",
    issue: "Замена АКБ",
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
  { id: "p1", name: "Модуль дисплея iPhone 14 Pro (OEM)", oem: true, inStock: true, priceRub: 16490, deviceHint: "iPhone 14 Pro" },
  { id: "p2", name: "Аккумулятор Pixel 8 совместимый", oem: false, inStock: true, priceRub: 4500, deviceHint: "Pixel 8" },
  { id: "p3", name: "Нижняя плата разъёма iPad Air", oem: true, inStock: false, priceRub: 3200, deviceHint: "iPad Air" },
  { id: "p4", name: "Модуль дисплея iPad Pro 11 премиум", oem: false, inStock: true, priceRub: 11800, deviceHint: "iPad Pro 11" },
  { id: "p5", name: "Шлейф Wi‑Fi MacBook Air M2", oem: true, inStock: true, priceRub: 8900, deviceHint: "MacBook Air M2" },
];

export const techThreads: TechThread[] = [
  {
    id: "th1",
    clientName: "Алексей Смирнов",
    orderPublicId: "EV-10421",
    repairId: "r1",
    lastMessage: "Когда можно забрать?",
    updatedAt: "24.03 11:00",
  },
  {
    id: "th2",
    clientName: "ООО «Старт»",
    orderPublicId: "EV-10418",
    repairId: "r2",
    lastMessage: "Нужен акт после ремонта",
    updatedAt: "23.03 17:40",
  },
];

const chat1: TechMessage[] = [
  { id: "m1", from: "client", text: "Здравствуйте, подскажите по срокам?", at: "24.03 09:10" },
  { id: "m2", from: "tech", text: "Добрый день! Деталь уже в сервисе, к вечеру будет готово.", at: "24.03 09:25" },
  { id: "m3", from: "client", text: "Когда можно забрать?", at: "24.03 11:00" },
];

const chat2: TechMessage[] = [
  { id: "m4", from: "client", text: "Нужен акт выполненных работ для бухгалтерии.", at: "23.03 16:00" },
  { id: "m5", from: "tech", text: "Отправлю на email zakaz@start.ru после диагностики.", at: "23.03 17:40" },
];

export const techMessagesByThread: Record<string, TechMessage[]> = {
  th1: chat1,
  th2: chat2,
};

export const techTemplates = [
  "Устройство принято в работу",
  "Диагностика завершена, готовим смету",
  "Согласуйте, пожалуйста, стоимость в приложении",
  "Ремонт выполнен, можно забирать",
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
