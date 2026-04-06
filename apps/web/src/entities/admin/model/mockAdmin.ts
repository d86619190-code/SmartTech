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
    customer: "Alexey Smirnov",
    phone: "+7 900 111-22-33",
    status: "in_progress",
    technician: "I. Petrov",
    totalRub: 18990,
    createdAt: "24.03.2026",
    deviceType: "phone",
  },
  {
    id: "a2",
    publicId: "EV-10420",
    device: "Samsung Galaxy S23",
    customer: "Maria K.",
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
    customer: 'LLC "Start"',
    phone: "+7 495 000-11-22",
    status: "diagnostics",
    technician: "K. Orlov",
    totalRub: 0,
    createdAt: "23.03.2026",
    deviceType: "laptop",
  },
  {
    id: "a4",
    publicId: "EV-10410",
    device: "iPad Pro 11",
    customer: "Dmitry V.",
    phone: "+7 903 777-88-99",
    status: "ready",
    technician: "I. Petrov",
    totalRub: 15200,
    createdAt: "22.03.2026",
    deviceType: "tablet",
  },
  {
    id: "a5",
    publicId: "EV-10398",
    device: "Pixel 8",
    customer: "Anna L.",
    phone: "+7 904 222-33-44",
    status: "completed",
    technician: "K. Orlov",
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
    issue: "The display is broken, the sensor is partially unresponsive. Request for an original part.",
    photos: 2,
    repairOption: "Original display module",
    laborRub: 2500,
    partsRub: 16490,
    notes: [
      "21.03 — the client agreed on the repair option online.",
      "22.03 — part on the way, estimated 1 day.",
    ],
    timeline: [
      { at: "24.03 10:20", label: "Module replacement in progress" },
      { at: "23.03 18:00", label: "Repair option agreed" },
      { at: "23.03 14:10", label: "Diagnostics completed" },
      { at: "23.03 11:00", label: "Device accepted" },
    ],
  };
}

export const adminUsers: AdminUser[] = [
  {
    id: "u1",
    name: "Alexey Smirnov",
    phone: "+7 900 111-22-33",
    email: "alex@mail.ru",
    ordersCount: 4,
    lastVisit: "24.03.2026",
    city: "Moscow",
  },
  {
    id: "u2",
    name: "Maria K.",
    phone: "+7 901 444-55-66",
    email: "maria.k@yandex.ru",
    ordersCount: 1,
    lastVisit: "24.03.2026",
    city: "Moscow",
  },
  {
    id: "u3",
    name: 'LLC "Start"',
    phone: "+7 495 000-11-22",
    email: "zakaz@start.ru",
    ordersCount: 12,
    lastVisit: "23.03.2026",
    city: "Moscow",
  },
];

export function getAdminUser(id: string): AdminUser | undefined {
  return adminUsers.find((u) => u.id === id);
}

export const adminTechnicians: AdminTechnician[] = [
  {
    id: "t1",
    name: "Ivan Petrov",
    activeOrders: 5,
    rating: 4.9,
    completed: 842,
    revenueRub: 4_200_000,
    specialty: "Apple, displays",
  },
  {
    id: "t2",
    name: "Konstantin Orlov",
    activeOrders: 3,
    rating: 4.8,
    completed: 610,
    revenueRub: 3_100_000,
    specialty: "Laptops, boards",
  },
  {
    id: "t3",
    name: "Sergey Nikolaev",
    activeOrders: 2,
    rating: 4.7,
    completed: 420,
    revenueRub: 2_050_000,
    specialty: "Android, connectors",
  },
];

export function getAdminTechnician(id: string): AdminTechnician | undefined {
  return adminTechnicians.find((t) => t.id === id);
}

export const adminPricing: AdminPriceRow[] = [
  {
    id: "p1",
    category: "Display",
    deviceGroup: "iPhone 12–15",
    service: "Replacing the module (original)",
    laborRub: 1500,
    partsFromRub: 12000,
  },
  {
    id: "p2",
    category: "Battery",
    deviceGroup: "iPhone",
    service: "Original battery replacement",
    laborRub: 1200,
    partsFromRub: 4500,
  },
  {
    id: "p3",
    category: "Connector",
    deviceGroup: "Universal",
    service: "Replacing the charging connector",
    laborRub: 2000,
    partsFromRub: 1500,
  },
];

export const adminCategories: AdminCategory[] = [
  {
    id: "c1",
    name: "Display and glass",
    children: [
      { id: "c1a", name: "Original module" },
      { id: "c1b", name: "Analogue premium" },
      { id: "c1c", name: "Glass replacement" },
    ],
  },
  {
    id: "c2",
    name: "Battery",
    children: [
      { id: "c2a", name: "Original" },
      { id: "c2b", name: "Compatible" },
    ],
  },
  {
    id: "c3",
    name: "Hull and water",
    children: [{ id: "c3a", name: "Cleaning after water" }],
  },
];

export const adminLogs: AdminLogEvent[] = [
  {
    id: "l1",
    at: "24.03 11:02",
    type: "order",
    message: "Order EV-10421 - change of status to “In progress”",
    severity: "info",
  },
  {
    id: "l2",
    at: "24.03 10:40",
    type: "user",
    message: "New client registered",
    severity: "info",
  },
  {
    id: "l3",
    at: "24.03 09:15",
    type: "system",
    message: "Price list configuration backup completed",
    severity: "info",
  },
  {
    id: "l4",
    at: "23.03 22:01",
    type: "order",
    message: "Order EV-10418 - waiting for spare parts",
    severity: "warning",
  },
];

export const revenueSeries = [
  { label: "Mon", value: 120 },
  { label: "W", value: 180 },
  { label: "Wed", value: 150 },
  { label: "Thu", value: 210 },
  { label: "Fri", value: 190 },
  { label: "Sat", value: 95 },
  { label: "Sun", value: 70 },
];

export const recentOrdersShort = adminOrders.slice(0, 4);

export const techActivity = [
  { name: "I. Petrov", done: 6, inWork: 5 },
  { name: "K. Orlov", done: 4, inWork: 3 },
  { name: "S. Nikolaev", done: 3, inWork: 2 },
];
