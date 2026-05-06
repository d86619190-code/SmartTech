import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { Mutex } from "async-mutex";
import { config } from "./config.js";

export type UserRow = {
  id: string;
  created_at: number;
  role: "client" | "master" | "admin" | "boss";
  name?: string;
  avatar_url?: string;
  /** Вход по телефону */
  phone?: string;
  /** Вход через Google */
  email?: string;
  google_sub?: string;
};
export type OtpRow = { code_hash: string; expires_at: number; attempts: number };
export type RefreshRow = { user_id: string; token_hash: string; expires_at: number; created_at: number };
export type InboxMessageRow = {
  id: string;
  order_id: string;
  from: "user" | "service";
  text: string;
  at: number;
  read_by_user: boolean;
  /** Для сообщений клиента: прочитал ли мастер (для галочек у клиента). */
  read_by_service?: boolean;
  /** Для service: от какого мастера (если не задано — берётся профиль техпанели). */
  service_sender_name?: string;
  service_sender_avatar_url?: string;
  /** Локально: data URL изображения/видео, без облака */
  attachment_data_url?: string;
  attachment_name?: string;
};
export type ApprovalRow = {
  id: string;
  order_id: string;
  label: string;
  status: "pending" | "approved" | "declined";
  created_at: number;
  resolved_at?: number;
};
export type UserInboxRow = {
  messages: InboxMessageRow[];
  approvals: ApprovalRow[];
};
export type ClientOrderDraftRow = {
  id: string;
  title: string;
  saved_at: number;
  payload: {
    step: 1 | 2 | 3;
    deviceCategory: "phone" | "tablet" | "laptop";
    device: string;
    issue: string;
    contactPhone: string;
    visitMode: "asap" | "slot";
    slot: string;
    bringInPerson: boolean;
    needsConsultation: boolean;
    photos: Array<{ name: string; dataUrl: string }>;
  };
};
export type AdminOrderStatus = "new" | "diagnostics" | "approval" | "in_progress" | "ready" | "completed" | "cancelled";
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
  photoUrls?: string[];
  repairOption: string;
  laborRub: number;
  partsRub: number;
  notes: string[];
  timeline: { at: string; label: string }[];
};
export type AdminUserMock = {
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
export type AdminPanelMockState = {
  kpi: {
    revenueRub: number;
    activeRepairs: number;
    completedMonth: number;
    avgCheckRub: number;
    pendingApprovals: number;
  };
  orders: AdminOrderDetail[];
  users: AdminUserMock[];
  technicians: AdminTechnician[];
  pricing: AdminPriceRow[];
  categories: AdminCategory[];
  logs: AdminLogEvent[];
  revenueSeries: { label: string; value: number }[];
  /** Средняя выручка по дням (тыс. ₽) — отдельный график для тестов. */
  avgRevenueSeries: { label: string; value: number }[];
  techActivity: { name: string; done: number; inWork: number }[];
  trend: { label: string; value: number }[];
  settings: {
    defaultAdminRole: string;
    notifyEmail: boolean;
    notifyPush: boolean;
    legalName: string;
    inn: string;
    supportPhone: string;
    supportEmail: string;
  };
};
export type TechRepairStage = "accepted" | "diagnostics" | "waiting_approval" | "repair" | "ready" | "completed";
export type TechProgressEntry = {
  id: string;
  stage: TechRepairStage;
  kind: "stage" | "substep";
  title: string;
  description?: string;
  at: number;
  atLabel: string;
  photoDataUrls: string[];
};
export type TechIncomingStatus = "pending" | "accepted" | "declined";
export type TechIncomingRequest = {
  id: string;
  publicId: string;
  device: string;
  deviceType: "phone" | "tablet" | "laptop";
  thumb: string;
  issueShort: string;
  clientName: string;
  clientAvatarUrl?: string;
  clientPhone: string;
  /** Владелец заказа (клиент) — для доставки inbox/чата только ему */
  clientUserId?: string;
  photoDataUrls?: string[];
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
  /** ID клиента-владельца заказа */
  clientUserId?: string;
  /** Оценка клиента после выдачи (1–5) */
  clientRatingStars?: number;
  /** Текстовый отзыв клиента после завершения */
  clientReviewText?: string;
  clientRatedAt?: number;
  /** Момент, когда мастер выставил "завершено" и ожидается подтверждение клиента */
  completionRequestedAt?: number;
  /** Момент подтверждения завершения клиентом */
  completionConfirmedAt?: number;
  earningsRub?: number;
  diagnosticsIssues: string[];
  selectedPartIds: string[];
  quoteOptions?: Array<{
    id: string;
    title: string;
    laborRub: number;
    selectedPartIds: string[];
    availability: "in_stock" | "on_order";
    orderLeadDays?: number;
    isOriginal: boolean;
    repairDaysLabel?: string;
  }>;
  /** Свои позиции мастера (не из общего каталога) */
  customParts?: TechPart[];
  /** Подробная хронология этапов и подпунктов с фото */
  progressLog?: TechProgressEntry[];
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
  delivered_at?: number;
  read_by_client_at?: number;
  read_by_tech_at?: number;
  senderName?: string;
  senderAvatarUrl?: string;
};
export type TechThread = {
  id: string;
  clientName: string;
  clientAvatarUrl?: string;
  orderPublicId: string;
  repairId: string;
  lastMessage: string;
  updatedAt: string;
  /** Мастер, ведущий этот диалог (для подписей в чате и клиентском inbox). */
  masterName?: string;
  masterAvatarUrl?: string;
  /** Почта или телефон для подсказки в UI */
  masterContact?: string;
  unreadCount?: number;
  /** Время последнего события «мастер печатает» */
  masterTypingAt?: number;
  /** Время последнего события «клиент печатает» */
  clientTypingAt?: number;
};
export type TechAlert = { id: string; at: string; message: string; type: "info" | "warning" };
export type TechProfile = {
  name: string;
  role: string;
  rating: number;
  completedJobs: number;
  monthEarningsRub: number;
  responseMin: number;
  avatar_url?: string;
};
export type TechSettings = {
  available: boolean;
  notifyEmail: boolean;
  notifyPush: boolean;
  workFrom: string;
  workTo: string;
  phone: string;
  specialty: string;
};
export type TechPanelMockState = {
  profile: TechProfile;
  alerts: TechAlert[];
  incoming: TechIncomingRequest[];
  repairs: TechRepairJob[];
  completed: TechRepairJob[];
  partsCatalog: TechPart[];
  threads: TechThread[];
  messagesByThread: Record<string, TechMessage[]>;
  templates: string[];
  settings: TechSettings;
};

export type AppState = {
  usersById: Record<string, UserRow>;
  userIdByPhone: Record<string, string>;
  userIdByEmail: Record<string, string>;
  userIdByGoogleSub: Record<string, string>;
  otp: Record<string, OtpRow>;
  refreshById: Record<string, RefreshRow>;
  inboxByUserId: Record<string, UserInboxRow>;
  orderDraftsByUserId: Record<string, ClientOrderDraftRow[]>;
  adminPanelMock?: AdminPanelMockState;
  techPanelMock?: TechPanelMockState;
};

const emptyState = (): AppState => ({
  usersById: {},
  userIdByPhone: {},
  userIdByEmail: {},
  userIdByGoogleSub: {},
  otp: {},
  refreshById: {},
  inboxByUserId: {},
  orderDraftsByUserId: {},
});

const mutex = new Mutex();
let state: AppState = emptyState();
let loaded = false;
let db: DatabaseSync | null = null;

function configuredDbPath(): string {
  return path.isAbsolute(config.dbPath) ? config.dbPath : path.resolve(process.cwd(), config.dbPath);
}

function sqlitePath(): string {
  const p = configuredDbPath();
  if (p.toLowerCase().endsWith(".json")) {
    return `${p.slice(0, -5)}.sqlite`;
  }
  return p;
}

function legacyJsonPath(): string | null {
  const p = configuredDbPath();
  if (p.toLowerCase().endsWith(".json")) return p;
  const alt = p.toLowerCase().endsWith(".sqlite") ? `${p.slice(0, -7)}.json` : null;
  return alt && fs.existsSync(alt) ? alt : null;
}

function ensureDb(): DatabaseSync {
  if (db) return db;
  const p = sqlitePath();
  const dir = path.dirname(p);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  db = new DatabaseSync(p);
  db.exec(`
    CREATE TABLE IF NOT EXISTS app_state (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      data TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    );
  `);
  return db;
}

function normalizeState(parsed: AppState): AppState {
  const next: AppState = {
    ...emptyState(),
    ...parsed,
    usersById: parsed.usersById ?? {},
    userIdByPhone: parsed.userIdByPhone ?? {},
    userIdByEmail: parsed.userIdByEmail ?? {},
    userIdByGoogleSub: parsed.userIdByGoogleSub ?? {},
    otp: parsed.otp ?? {},
    refreshById: parsed.refreshById ?? {},
    inboxByUserId: parsed.inboxByUserId ?? {},
    orderDraftsByUserId: parsed.orderDraftsByUserId ?? {},
  };
  for (const user of Object.values(next.usersById)) {
    if (!user.role) user.role = "client";
  }
  return next;
}

function loadSync(): void {
  if (loaded) return;
  const conn = ensureDb();
  const row = conn.prepare("SELECT data FROM app_state WHERE id = 1").get() as { data: string } | undefined;
  if (row?.data) {
    state = normalizeState(JSON.parse(row.data) as AppState);
    loaded = true;
    return;
  }

  const legacyPath = legacyJsonPath();
  if (legacyPath && fs.existsSync(legacyPath)) {
    try {
      const raw = fs.readFileSync(legacyPath, "utf8");
      if (raw.trim()) {
        state = normalizeState(JSON.parse(raw) as AppState);
      } else {
        state = emptyState();
      }
    } catch {
      state = emptyState();
    }
  } else {
    state = emptyState();
  }
  loaded = true;
  // First write initializes SQLite with either migrated or empty state.
  conn
    .prepare("INSERT INTO app_state (id, data, updated_at) VALUES (1, ?, ?) ON CONFLICT(id) DO UPDATE SET data=excluded.data, updated_at=excluded.updated_at")
    .run(JSON.stringify(state), Date.now());
}

async function persistState(): Promise<void> {
  const conn = ensureDb();
  conn
    .prepare("INSERT INTO app_state (id, data, updated_at) VALUES (1, ?, ?) ON CONFLICT(id) DO UPDATE SET data=excluded.data, updated_at=excluded.updated_at")
    .run(JSON.stringify(state), Date.now());
}

export async function withStore<T>(fn: (s: AppState) => T): Promise<T> {
  return mutex.runExclusive(async () => {
    loadSync();
    const result = fn(state);
    await persistState();
    return result;
  });
}
