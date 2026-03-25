import type {
  AdminCategory,
  AdminLogEvent,
  AdminOrderDetail,
  AdminOrderRow,
  AdminPriceRow,
  AdminTechnician,
  AdminUser,
} from "./types";

export const adminKpi = {
  revenueRub: 2_847_500,
  activeRepairs: 42,
  completedMonth: 318,
  avgCheckRub: 8_940,
  pendingApprovals: 7,
};

export const adminOrders: AdminOrderRow[] = [
  {
    id: "a1",
    publicId: "EV-10421",
    device: "iPhone 14 Pro",
    customer: "Алексей Смирнов",
    phone: "+7 900 111-22-33",
    status: "in_progress",
    technician: "И. Петров",
    totalRub: 18990,
    createdAt: "24.03.2026",
    deviceType: "phone",
  },
  {
    id: "a2",
    publicId: "EV-10420",
    device: "Samsung Galaxy S23",
    customer: "Мария К.",
    phone: "+7 901 444-55-66",
    status: "approval",
    technician: null,
    totalRub: 12400,
    createdAt: "24.03.2026",
    deviceType: "phone",
  },
  {
    id: "a3",
    publicId: "EV-10418",
    device: "MacBook Air M2",
    customer: "ООО «Старт»",
    phone: "+7 495 000-11-22",
    status: "diagnostics",
    technician: "К. Орлов",
    totalRub: 0,
    createdAt: "23.03.2026",
    deviceType: "laptop",
  },
  {
    id: "a4",
    publicId: "EV-10410",
    device: "iPad Pro 11",
    customer: "Дмитрий В.",
    phone: "+7 903 777-88-99",
    status: "ready",
    technician: "И. Петров",
    totalRub: 15200,
    createdAt: "22.03.2026",
    deviceType: "tablet",
  },
  {
    id: "a5",
    publicId: "EV-10398",
    device: "Pixel 8",
    customer: "Анна Л.",
    phone: "+7 904 222-33-44",
    status: "completed",
    technician: "К. Орлов",
    totalRub: 9200,
    createdAt: "20.03.2026",
    deviceType: "phone",
  },
];

export function getAdminOrder(id: string): AdminOrderDetail | undefined {
  const base = adminOrders.find((o) => o.id === id);
  if (!base) return undefined;
  return {
    ...base,
    email: "client@example.com",
    issue: "Разбит дисплей, сенсор частично не откликается. Запрос на оригинальную деталь.",
    photos: 2,
    repairOption: "Оригинальный модуль дисплея",
    laborRub: 2500,
    partsRub: 16490,
    notes: [
      "21.03 — клиент согласовал вариант ремонта онлайн.",
      "22.03 — деталь в пути, ориентир 1 день.",
    ],
    timeline: [
      { at: "24.03 10:20", label: "В работе — замена модуля" },
      { at: "23.03 18:00", label: "Согласован вариант ремонта" },
      { at: "23.03 14:10", label: "Диагностика завершена" },
      { at: "23.03 11:00", label: "Устройство принято" },
    ],
  };
}

export const adminUsers: AdminUser[] = [
  {
    id: "u1",
    name: "Алексей Смирнов",
    phone: "+7 900 111-22-33",
    email: "alex@mail.ru",
    ordersCount: 4,
    lastVisit: "24.03.2026",
    city: "Москва",
  },
  {
    id: "u2",
    name: "Мария К.",
    phone: "+7 901 444-55-66",
    email: "maria.k@yandex.ru",
    ordersCount: 1,
    lastVisit: "24.03.2026",
    city: "Москва",
  },
  {
    id: "u3",
    name: "ООО «Старт»",
    phone: "+7 495 000-11-22",
    email: "zakaz@start.ru",
    ordersCount: 12,
    lastVisit: "23.03.2026",
    city: "Москва",
  },
];

export function getAdminUser(id: string): AdminUser | undefined {
  return adminUsers.find((u) => u.id === id);
}

export const adminTechnicians: AdminTechnician[] = [
  {
    id: "t1",
    name: "Иван Петров",
    activeOrders: 5,
    rating: 4.9,
    completed: 842,
    revenueRub: 4_200_000,
    specialty: "Apple, дисплеи",
  },
  {
    id: "t2",
    name: "Константин Орлов",
    activeOrders: 3,
    rating: 4.8,
    completed: 610,
    revenueRub: 3_100_000,
    specialty: "Ноутбуки, платы",
  },
  {
    id: "t3",
    name: "Сергей Николаев",
    activeOrders: 2,
    rating: 4.7,
    completed: 420,
    revenueRub: 2_050_000,
    specialty: "Android, разъёмы",
  },
];

export function getAdminTechnician(id: string): AdminTechnician | undefined {
  return adminTechnicians.find((t) => t.id === id);
}

export const adminPricing: AdminPriceRow[] = [
  {
    id: "p1",
    category: "Дисплей",
    deviceGroup: "iPhone 12–15",
    service: "Замена модуля (оригинал)",
    laborRub: 1500,
    partsFromRub: 12000,
  },
  {
    id: "p2",
    category: "Аккумулятор",
    deviceGroup: "iPhone",
    service: "Замена АКБ оригинал",
    laborRub: 1200,
    partsFromRub: 4500,
  },
  {
    id: "p3",
    category: "Разъём",
    deviceGroup: "Универсально",
    service: "Замена разъёма зарядки",
    laborRub: 2000,
    partsFromRub: 1500,
  },
];

export const adminCategories: AdminCategory[] = [
  {
    id: "c1",
    name: "Дисплей и стекло",
    children: [
      { id: "c1a", name: "Оригинальный модуль" },
      { id: "c1b", name: "Аналог премиум" },
      { id: "c1c", name: "Замена стекла" },
    ],
  },
  {
    id: "c2",
    name: "Аккумулятор",
    children: [
      { id: "c2a", name: "Оригинал" },
      { id: "c2b", name: "Совместимый" },
    ],
  },
  {
    id: "c3",
    name: "Корпус и вода",
    children: [{ id: "c3a", name: "Чистка после воды" }],
  },
];

export const adminLogs: AdminLogEvent[] = [
  {
    id: "l1",
    at: "24.03 11:02",
    type: "order",
    message: "Заказ EV-10421 — смена статуса «В работе»",
    severity: "info",
  },
  {
    id: "l2",
    at: "24.03 10:40",
    type: "user",
    message: "Новый клиент зарегистрирован",
    severity: "info",
  },
  {
    id: "l3",
    at: "24.03 09:15",
    type: "system",
    message: "Резервное копирование конфигурации прайса завершено",
    severity: "info",
  },
  {
    id: "l4",
    at: "23.03 22:01",
    type: "order",
    message: "Заказ EV-10418 — ожидание запчасти",
    severity: "warning",
  },
];

export const revenueSeries = [
  { label: "Пн", value: 120 },
  { label: "Вт", value: 180 },
  { label: "Ср", value: 150 },
  { label: "Чт", value: 210 },
  { label: "Пт", value: 190 },
  { label: "Сб", value: 95 },
  { label: "Вс", value: 70 },
];

export const recentOrdersShort = adminOrders.slice(0, 4);

export const techActivity = [
  { name: "И. Петров", done: 6, inWork: 5 },
  { name: "К. Орлов", done: 4, inWork: 3 },
  { name: "С. Николаев", done: 3, inWork: 2 },
];
