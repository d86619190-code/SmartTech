import {
  withStore,
  type AdminCategory,
  type AdminLogEvent,
  type AdminOrderDetail,
  type AdminPanelMockState,
  type AdminPriceRow,
  type AdminTechnician,
  type AdminUserMock,
  type AppState,
} from "../store.js";
import { MOCK_MASTERS } from "./mockMasters.js";

const M = MOCK_MASTERS;

const defaultAvgRevenueSeries: { label: string; value: number }[] = [
  { label: "Пн", value: 7.4 },
  { label: "Вт", value: 8.2 },
  { label: "Ср", value: 7.9 },
  { label: "Чт", value: 9.1 },
  { label: "Пт", value: 8.6 },
  { label: "Сб", value: 6.3 },
  { label: "Вс", value: 5.8 },
];

const defaultOrders: AdminOrderDetail[] = [
  {
    id: "ord-ff",
    publicId: "EV-FF-001",
    device: "iPhone 13 mini",
    customer: "Клиент (тест)",
    phone: "+77071492803",
    status: "in_progress",
    technician: M.ff.name,
    totalRub: 15490,
    createdAt: "24.03.2026",
    deviceType: "phone",
    email: "client@test.local",
    issue: "Замена дисплея — мастер ff ddd (ff6690473@gmail.com).",
    photos: 1,
    repairOption: "Оригинальный модуль",
    laborRub: 2500,
    partsRub: 12990,
    notes: ["Мастер ff ddd — деталь в пути."],
    timeline: [
      { at: "24.03 11:00", label: "В работе — замена модуля" },
      { at: "24.03 09:00", label: "Принято в ремонт" },
    ],
  },
  {
    id: "ord-alex",
    publicId: "EV-AL-002",
    device: "Samsung Galaxy S21",
    customer: "Клиент (тест)",
    phone: "+77071492803",
    status: "diagnostics",
    technician: M.alex.name,
    totalRub: 5300,
    createdAt: "24.03.2026",
    deviceType: "phone",
    email: "client@test.local",
    issue: "Диагностика АКБ — мастер Алексей (+79789195542).",
    photos: 0,
    repairOption: "Замена аккумулятора",
    laborRub: 800,
    partsRub: 4500,
    notes: ["Ожидается согласование после теста АКБ."],
    timeline: [{ at: "24.03 12:00", label: "Диагностика батареи" }],
  },
  {
    id: "ord-user",
    publicId: "EV-US-003",
    device: "MacBook Air M2",
    customer: "Клиент (тест)",
    phone: "+77071492803",
    status: "approval",
    technician: M.user.name,
    totalRub: 26500,
    createdAt: "23.03.2026",
    deviceType: "laptop",
    email: "client@test.local",
    issue: "Плата после залития — мастер Иван Петров (98y7tbnb97t@gmail.com), нужно согласование.",
    photos: 0,
    repairOption: "Восстановление платы / замена",
    laborRub: 4500,
    partsRub: 22000,
    notes: ["Ожидает решения клиента."],
    timeline: [{ at: "23.03 18:00", label: "Ожидает согласования сметы" }],
  },
  {
    id: "ord-ff-004",
    publicId: "EV-FF-004",
    device: "iPhone 12",
    customer: "Марина К.",
    phone: "+7 701 555-11-22",
    status: "completed",
    technician: M.ff.name,
    totalRub: 9800,
    createdAt: "19.03.2026",
    deviceType: "phone",
    email: "marina.k@test.local",
    issue: "Замена аккумулятора и чистка после перегрева.",
    photos: 2,
    repairOption: "Оригинальная АКБ",
    laborRub: 1800,
    partsRub: 8000,
    notes: ["Выдано клиенту, гарантия 90 дней."],
    timeline: [
      { at: "20.03 16:20", label: "Заказ завершён" },
      { at: "20.03 10:10", label: "Выполнена замена АКБ" },
    ],
  },
  {
    id: "ord-alex-005",
    publicId: "EV-AL-005",
    device: "Xiaomi Pad 6",
    customer: "Илья Р.",
    phone: "+7 777 301-22-10",
    status: "ready",
    technician: M.alex.name,
    totalRub: 12300,
    createdAt: "18.03.2026",
    deviceType: "tablet",
    email: "ilya.r@test.local",
    issue: "Тачскрин срабатывает через раз.",
    photos: 1,
    repairOption: "Замена сенсора",
    laborRub: 2300,
    partsRub: 10000,
    notes: ["Готов к выдаче, ожидает клиента."],
    timeline: [
      { at: "19.03 14:00", label: "Готово к выдаче" },
      { at: "19.03 09:40", label: "Установлен новый сенсор" },
    ],
  },
  {
    id: "ord-user-006",
    publicId: "EV-US-006",
    device: "Lenovo IdeaPad 5",
    customer: "Андрей Н.",
    phone: "+7 705 990-44-31",
    status: "in_progress",
    technician: M.user.name,
    totalRub: 18900,
    createdAt: "17.03.2026",
    deviceType: "laptop",
    email: "andrey.n@test.local",
    issue: "Шумит кулер и перегревается под нагрузкой.",
    photos: 0,
    repairOption: "Чистка + замена кулера",
    laborRub: 3900,
    partsRub: 15000,
    notes: ["Ожидается поставка кулера вечером."],
    timeline: [{ at: "18.03 12:30", label: "Ремонт в процессе" }],
  },
  {
    id: "ord-ff-007",
    publicId: "EV-FF-007",
    device: "iPhone 14 Pro",
    customer: "Марина К.",
    phone: "+7 701 555-11-22",
    status: "new",
    technician: M.ff.name,
    totalRub: 0,
    createdAt: "16.03.2026",
    deviceType: "phone",
    email: "marina.k@test.local",
    issue: "Не работает Face ID после падения.",
    photos: 3,
    repairOption: "Диагностика модуля TrueDepth",
    laborRub: 0,
    partsRub: 0,
    notes: ["Первичное обращение, ожидает диагностики."],
    timeline: [{ at: "16.03 11:15", label: "Новая заявка" }],
  },
  {
    id: "ord-alex-008",
    publicId: "EV-AL-008",
    device: "Samsung Galaxy Tab S8",
    customer: "Евгений П.",
    phone: "+7 702 100-70-60",
    status: "cancelled",
    technician: M.alex.name,
    totalRub: 0,
    createdAt: "14.03.2026",
    deviceType: "tablet",
    email: "evgeniy.p@test.local",
    issue: "Трещина стекла, клиент отказался от ремонта.",
    photos: 1,
    repairOption: "Замена стекла",
    laborRub: 0,
    partsRub: 0,
    notes: ["Отменено клиентом."],
    timeline: [{ at: "15.03 09:00", label: "Заявка отменена" }],
  },
  {
    id: "ord-user-009",
    publicId: "EV-US-009",
    device: "MacBook Pro 14",
    customer: "Ольга С.",
    phone: "+7 778 200-10-90",
    status: "diagnostics",
    technician: M.user.name,
    totalRub: 3500,
    createdAt: "13.03.2026",
    deviceType: "laptop",
    email: "olga.s@test.local",
    issue: "Ноутбук выключается на 30% заряда.",
    photos: 0,
    repairOption: "Проверка контроллера питания",
    laborRub: 3500,
    partsRub: 0,
    notes: ["Диагностика платы в процессе."],
    timeline: [{ at: "13.03 15:20", label: "Начата диагностика" }],
  },
  {
    id: "ord-ff-010",
    publicId: "EV-FF-010",
    device: "Google Pixel 8",
    customer: "Дмитрий Л.",
    phone: "+7 747 600-33-77",
    status: "completed",
    technician: M.ff.name,
    totalRub: 7600,
    createdAt: "10.03.2026",
    deviceType: "phone",
    email: "dmitriy.l@test.local",
    issue: "Порт зарядки люфтит, периодически не заряжает.",
    photos: 1,
    repairOption: "Замена нижнего шлейфа",
    laborRub: 2100,
    partsRub: 5500,
    notes: ["Работа выполнена и оплачена."],
    timeline: [{ at: "11.03 18:10", label: "Ремонт завершён" }],
  },
  {
    id: "ord-alex-011",
    publicId: "EV-AL-011",
    device: "iPad Air 5",
    customer: "Илья Р.",
    phone: "+7 777 301-22-10",
    status: "approval",
    technician: M.alex.name,
    totalRub: 14200,
    createdAt: "09.03.2026",
    deviceType: "tablet",
    email: "ilya.r@test.local",
    issue: "После попадания влаги перестал работать звук.",
    photos: 2,
    repairOption: "Восстановление аудиотракта",
    laborRub: 4200,
    partsRub: 10000,
    notes: ["Ожидает согласования стоимости."],
    timeline: [{ at: "10.03 13:10", label: "Отправлено на согласование" }],
  },
  {
    id: "ord-user-012",
    publicId: "EV-US-012",
    device: "ASUS Zenbook 14",
    customer: "Андрей Н.",
    phone: "+7 705 990-44-31",
    status: "ready",
    technician: M.user.name,
    totalRub: 22400,
    createdAt: "07.03.2026",
    deviceType: "laptop",
    email: "andrey.n@test.local",
    issue: "Замена матрицы после механического повреждения.",
    photos: 2,
    repairOption: "Оригинальная матрица",
    laborRub: 4400,
    partsRub: 18000,
    notes: ["Устройство готово, ждёт выдачи."],
    timeline: [{ at: "08.03 17:35", label: "Готово к выдаче" }],
  },
];

function buildHistoricalOrders(targetCount = 50): AdminOrderDetail[] {
  const result: AdminOrderDetail[] = [...defaultOrders];
  const customerPool = [
    { name: "Марина К.", phone: "+7 701 555-11-22", email: "marina.k@test.local" },
    { name: "Илья Р.", phone: "+7 777 301-22-10", email: "ilya.r@test.local" },
    { name: "Андрей Н.", phone: "+7 705 990-44-31", email: "andrey.n@test.local" },
    { name: "Евгений П.", phone: "+7 702 100-70-60", email: "evgeniy.p@test.local" },
    { name: "Ольга С.", phone: "+7 778 200-10-90", email: "olga.s@test.local" },
    { name: "Дмитрий Л.", phone: "+7 747 600-33-77", email: "dmitriy.l@test.local" },
    { name: "Татьяна В.", phone: "+7 708 443-22-91", email: "tatiana.v@test.local" },
    { name: "Роман З.", phone: "+7 775 200-44-19", email: "roman.z@test.local" },
    { name: "Александр М.", phone: "+7 701 888-71-45", email: "alex.m@test.local" },
    { name: "Полина Г.", phone: "+7 700 611-55-03", email: "polina.g@test.local" },
  ];
  const devicePool = [
    { device: "iPhone 11", type: "phone" as const, issue: "Быстро разряжается аккумулятор.", repair: "Замена АКБ", parts: 5200, labor: 1800 },
    { device: "Samsung Galaxy A54", type: "phone" as const, issue: "Не работает нижний микрофон.", repair: "Замена шлейфа", parts: 4800, labor: 1700 },
    { device: "Xiaomi Redmi Note 13", type: "phone" as const, issue: "Трещина стекла после падения.", repair: "Замена дисплея", parts: 8600, labor: 2100 },
    { device: "iPad 10", type: "tablet" as const, issue: "Слабый отклик тачскрина.", repair: "Замена сенсора", parts: 9700, labor: 2400 },
    { device: "Samsung Tab S9", type: "tablet" as const, issue: "Не заряжается от кабеля.", repair: "Ремонт разъёма", parts: 6200, labor: 2000 },
    { device: "MacBook Air M1", type: "laptop" as const, issue: "Периодические выключения при нагрузке.", repair: "Чистка и сервис платы", parts: 11000, labor: 4300 },
    { device: "ASUS TUF A15", type: "laptop" as const, issue: "Сильный шум кулеров и перегрев.", repair: "Замена системы охлаждения", parts: 13200, labor: 4700 },
    { device: "Lenovo Legion 5", type: "laptop" as const, issue: "Не работает клавиатура.", repair: "Замена клавиатурного модуля", parts: 12500, labor: 3900 },
  ];
  const statuses: AdminOrderDetail["status"][] = ["new", "diagnostics", "approval", "in_progress", "ready", "completed", "cancelled"];
  const techPool = [M.ff.name, M.alex.name, M.user.name];

  let seq = 13;
  while (result.length < targetCount) {
    const cust = customerPool[seq % customerPool.length];
    const dev = devicePool[seq % devicePool.length];
    const status = statuses[seq % statuses.length];
    const laborRub = status === "new" || status === "cancelled" ? 0 : dev.labor;
    const partsRub = status === "new" || status === "cancelled" ? 0 : dev.parts;
    const totalRub = laborRub + partsRub;
    const day = ((seq * 3) % 28) + 1;
    const month = (seq % 3) + 1; // 1..3
    const dd = String(day).padStart(2, "0");
    const mm = String(month).padStart(2, "0");
    const createdAt = `${dd}.${mm}.2026`;
    const idNum = String(seq).padStart(3, "0");
    result.push({
      id: `ord-hist-${idNum}`,
      publicId: `EV-HIS-${idNum}`,
      device: dev.device,
      customer: cust.name,
      phone: cust.phone,
      status,
      technician: techPool[seq % techPool.length],
      totalRub,
      createdAt,
      deviceType: dev.type,
      email: cust.email,
      issue: dev.issue,
      photos: seq % 4,
      repairOption: dev.repair,
      laborRub,
      partsRub,
      notes: [status === "cancelled" ? "Отменено клиентом." : "Историческая запись для аналитики."],
      timeline: [{ at: `${dd}.${mm} 12:00`, label: `Статус: ${status}` }],
    });
    seq += 1;
  }

  return result;
}

const seededOrders: AdminOrderDetail[] = buildHistoricalOrders(50);

const defaultUsers: AdminUserMock[] = [
  { id: "u-cl1", name: "Пользователь", phone: "+77071492803", email: "", ordersCount: 3, lastVisit: "24.03.2026", city: "Тест" },
  { id: "u-cl2", name: "gfdgdf 43", phone: "", email: "gfdgdf710@gmail.com", ordersCount: 1, lastVisit: "24.03.2026", city: "Тест" },
  { id: "u-boss", name: "Alexsey Swarovski", phone: "", email: "shostak-aleshka@mail.ru", ordersCount: 0, lastVisit: "24.03.2026", city: "Тест" },
];

const defaultTechnicians: AdminTechnician[] = [
  { id: "t-ff", name: M.ff.name, activeOrders: 1, rating: 4.8, completed: 210, revenueRub: 1840000, specialty: `Apple · ${M.ff.email}` },
  { id: "t-alex", name: M.alex.name, activeOrders: 1, rating: 4.9, completed: 340, revenueRub: 2210000, specialty: `Samsung / диагностика · ${M.alex.phone}` },
  { id: "t-user", name: M.user.name, activeOrders: 1, rating: 4.7, completed: 95, revenueRub: 980000, specialty: `Ноутбуки · ${M.user.email}` },
];

const defaultPricing: AdminPriceRow[] = [
  { id: "p1", category: "Дисплей", deviceGroup: "iPhone 12–15", service: "Замена модуля (оригинал)", laborRub: 1500, partsFromRub: 12000 },
  { id: "p2", category: "Аккумулятор", deviceGroup: "iPhone", service: "Замена АКБ оригинал", laborRub: 1200, partsFromRub: 4500 },
];

const defaultCategories: AdminCategory[] = [
  { id: "c1", name: "Дисплей и стекло", children: [{ id: "c1a", name: "Оригинальный модуль" }, { id: "c1b", name: "Аналог премиум" }] },
  { id: "c2", name: "Аккумулятор", children: [{ id: "c2a", name: "Оригинал" }, { id: "c2b", name: "Совместимый" }] },
];

const defaultLogs: AdminLogEvent[] = [
  { id: "l1", at: "24.03 11:02", type: "order", message: "EV-FF-001 — в работе у ff ddd", severity: "info" },
  { id: "l2", at: "24.03 10:40", type: "order", message: "EV-AL-002 — диагностика (Алексей)", severity: "info" },
  { id: "l3", at: "24.03 09:15", type: "order", message: "EV-US-003 — согласование (Иван Петров)", severity: "info" },
];

function ensureAdminState(s: AppState) {
  if (!s.adminPanelMock) {
    s.adminPanelMock = {
      kpi: { revenueRub: 0, activeRepairs: 0, completedMonth: 0, avgCheckRub: 0, pendingApprovals: 0 },
      orders: [],
      users: [],
      technicians: [],
      pricing: [],
      categories: [],
      logs: [],
      revenueSeries: [],
      avgRevenueSeries: [],
      techActivity: [],
      trend: [],
      settings: {
        defaultAdminRole: "Оператор",
        notifyEmail: false,
        notifyPush: false,
        legalName: "",
        inn: "",
        supportPhone: "",
        supportEmail: "",
      },
    };
  } else {
    const st = s.adminPanelMock;
    const isLegacyMockOrder = (o: AdminOrderDetail) =>
      ["ord-ff", "ord-alex", "ord-user"].includes(o.id) ||
      /^ord-(ff|alex|user)-/i.test(o.id) ||
      /^EV-(FF|AL|US)-/i.test(o.publicId);
    st.orders = (st.orders ?? []).filter((o) => !isLegacyMockOrder(o));
    st.users = st.users ?? [];
    st.technicians = st.technicians ?? [];
    st.pricing = st.pricing ?? [];
    st.categories = st.categories ?? [];
    st.logs = st.logs ?? [];
    st.revenueSeries = st.revenueSeries ?? [];
    st.trend = st.trend ?? [];
    st.avgRevenueSeries = st.avgRevenueSeries ?? [];
    st.techActivity = st.techActivity ?? [];
  }
  return s.adminPanelMock;
}

export async function getAdminDashboard() {
  return withStore((s) => {
    const st = ensureAdminState(s);
    return {
      kpi: st.kpi,
      revenueSeries: st.revenueSeries,
      avgRevenueSeries: st.avgRevenueSeries,
      recentOrders: st.orders.slice(0, 4),
      techActivity: st.techActivity,
      logs: st.logs.slice(0, 5),
    };
  });
}

export async function getAdminOrders() {
  return withStore((s) => ensureAdminState(s).orders);
}

export async function getAdminOrderById(id: string) {
  return withStore((s) => ensureAdminState(s).orders.find((o) => o.id === id));
}

export async function getAdminUsersMock() {
  return withStore((s) => ensureAdminState(s).users);
}

export async function getAdminUserById(id: string) {
  return withStore((s) => ensureAdminState(s).users.find((u) => u.id === id));
}

export async function getAdminTechnicians() {
  return withStore((s) => ensureAdminState(s).technicians);
}

export async function getAdminTechnicianById(id: string) {
  return withStore((s) => ensureAdminState(s).technicians.find((t) => t.id === id));
}

export async function getAdminPricing() {
  return withStore((s) => ensureAdminState(s).pricing);
}

export async function updateAdminPricing(rows: AdminPriceRow[]) {
  return withStore((s) => {
    const st = ensureAdminState(s);
    st.pricing = rows;
    return st.pricing;
  });
}

export async function getAdminCategories() {
  return withStore((s) => ensureAdminState(s).categories);
}

export async function updateAdminCategories(rows: AdminCategory[]) {
  return withStore((s) => {
    const st = ensureAdminState(s);
    st.categories = rows;
    return st.categories;
  });
}

export async function getAdminAnalytics() {
  return withStore((s) => {
    const st = ensureAdminState(s);
    return {
      kpi: st.kpi,
      revenueSeries: st.revenueSeries,
      avgRevenueSeries: st.avgRevenueSeries,
      trend: st.trend,
      orders: st.orders,
      technicians: st.technicians,
    };
  });
}

export async function updateAdminAvgRevenueSeries(series: { label: string; value: number }[]) {
  return withStore((s) => {
    const st = ensureAdminState(s);
    st.avgRevenueSeries = series;
    return st.avgRevenueSeries;
  });
}

export async function updateAdminKpi(patch: Partial<AdminPanelMockState["kpi"]>) {
  return withStore((s) => {
    const st = ensureAdminState(s);
    st.kpi = { ...st.kpi, ...patch };
    return st.kpi;
  });
}

export async function getAdminLogs() {
  return withStore((s) => ensureAdminState(s).logs);
}

export async function getAdminSettings() {
  return withStore((s) => ensureAdminState(s).settings);
}

export async function updateAdminSettings(
  patch: Partial<{
    defaultAdminRole: string;
    notifyEmail: boolean;
    notifyPush: boolean;
    legalName: string;
    inn: string;
    supportPhone: string;
    supportEmail: string;
  }>
) {
  return withStore((s) => {
    const st = ensureAdminState(s);
    st.settings = { ...st.settings, ...patch };
    return st.settings;
  });
}
