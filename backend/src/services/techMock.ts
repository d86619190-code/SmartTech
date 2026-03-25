import crypto from "node:crypto";
import {
  withStore,
  type AppState,
  type InboxMessageRow,
  type TechIncomingRequest,
  type TechMessage,
  type TechPanelMockState,
  type TechProfile,
  type TechRepairJob,
  type TechRepairStage,
  type TechThread,
} from "../store.js";
import { MOCK_MASTERS } from "./mockMasters.js";

function nowLabel(): string {
  return new Date().toLocaleString("ru-RU", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" });
}

const M = MOCK_MASTERS;

function isLegacyMockRepairLike(input: { id?: string; publicId?: string }): boolean {
  const id = (input.id ?? "").toLowerCase();
  const publicId = (input.publicId ?? "").toUpperCase();
  if (["r-ff", "r-alex", "r-user", "r-done-1", "in-new-1", "in-new-2"].includes(id)) return true;
  if (["EV-FF-", "EV-AL-", "EV-US-", "EV-DONE-", "EV-NEW-101", "EV-NEW-102"].some((p) => publicId.startsWith(p))) return true;
  return false;
}

function purgeLegacyMockTechData(st: TechPanelMockState): void {
  st.incoming = st.incoming.filter((x) => !isLegacyMockRepairLike(x));
  st.repairs = st.repairs.filter((x) => !isLegacyMockRepairLike(x));
  st.completed = st.completed.filter((x) => !isLegacyMockRepairLike(x));
  st.alerts = st.alerts.filter((x) => !x.message.includes("EV-NEW-101") && !x.message.includes("EV-FF-001"));
  st.threads = st.threads.filter((x) => !isLegacyMockRepairLike({ id: x.repairId, publicId: x.orderPublicId }));
  const threadIds = new Set(st.threads.map((x) => x.id));
  const nextMessagesByThread: Record<string, TechMessage[]> = {};
  for (const [threadId, messages] of Object.entries(st.messagesByThread)) {
    if (!threadIds.has(threadId)) continue;
    nextMessagesByThread[threadId] = messages;
  }
  st.messagesByThread = nextMessagesByThread;
}

function ensureTechState(s: AppState): TechPanelMockState {
  if (!s.techPanelMock) {
    s.techPanelMock = {
      profile: {
        name: "Мастер",
        role: "Мастер",
        rating: 0,
        completedJobs: 0,
        monthEarningsRub: 0,
        responseMin: 0,
      },
      alerts: [],
      incoming: [],
      repairs: [],
      completed: [],
      partsCatalog: [],
      threads: [],
      messagesByThread: {},
      templates: [],
      settings: {
        available: true,
        notifyEmail: false,
        notifyPush: false,
        workFrom: "10:00",
        workTo: "20:00",
        phone: "",
        specialty: "",
      },
    };
  }
  purgeLegacyMockTechData(s.techPanelMock);
  return s.techPanelMock;
}

function allRepairs(st: TechPanelMockState): TechRepairJob[] {
  return [...st.repairs, ...st.completed];
}

function ensureThreadForIncoming(s: AppState, req: TechIncomingRequest): string {
  const st = ensureTechState(s);
  const existing = st.threads.find((t) => t.repairId === req.id);
  if (existing) return existing.id;
  const threadId = `th-${req.id}`;
  st.threads.unshift({
    id: threadId,
    clientName: req.clientName,
    clientAvatarUrl: req.clientAvatarUrl,
    orderPublicId: req.publicId,
    repairId: req.id,
    lastMessage: "Чат по заявке открыт.",
    updatedAt: nowLabel(),
    masterName: st.profile.name,
    masterAvatarUrl: st.profile.avatar_url,
  });
  if (!st.messagesByThread[threadId]) {
    st.messagesByThread[threadId] = [];
  }
  return threadId;
}

function staffFromContact(contact: string | undefined): { name: string; avatarUrl?: string } | undefined {
  if (!contact) return undefined;
  const c = contact.trim().toLowerCase();
  const values = Object.values(MOCK_MASTERS);
  const hit = values.find(
    (m) => m.email?.trim().toLowerCase() === c || m.phone?.trim().toLowerCase() === c || m.name?.trim().toLowerCase() === c,
  );
  if (!hit) return undefined;
  return { name: hit.name, avatarUrl: hit.avatarUrl };
}

function resolveClientForRepair(s: AppState, repairId: string): { label: string; avatarUrl?: string } | undefined {
  for (const [uid, inbox] of Object.entries(s.inboxByUserId)) {
    const hasOrder = inbox.messages.some((m) => m.order_id === repairId) || inbox.approvals.some((a) => a.order_id === repairId);
    if (!hasOrder) continue;
    const u = s.usersById[uid];
    if (!u) continue;
    const name = u.name?.trim() || "Клиент";
    const contact = u.phone?.trim() || u.email?.trim() || "";
    return {
      label: contact ? `${name} · ${contact}` : name,
      avatarUrl: u.avatar_url,
    };
  }
  return undefined;
}

function hydrateThreadParticipants(s: AppState): void {
  const st = ensureTechState(s);
  for (const t of st.threads) {
    const byContact = staffFromContact(t.masterContact);
    if (byContact) {
      t.masterName = byContact.name;
      t.masterAvatarUrl = byContact.avatarUrl;
    }
    const fromInbox = resolveClientForRepair(s, t.repairId);
    if (fromInbox) {
      t.clientName = fromInbox.label;
      t.clientAvatarUrl = fromInbox.avatarUrl;
    }
  }
}

function hydrateIncomingClientAvatars(s: AppState): void {
  const st = ensureTechState(s);
  for (const req of st.incoming) {
    if (req.clientAvatarUrl) continue;
    const byPhone = Object.values(s.usersById).find((u) => {
      const up = u.phone?.trim();
      const rp = req.clientPhone?.trim();
      return Boolean(up && rp && up === rp);
    });
    if (byPhone?.avatar_url) {
      req.clientAvatarUrl = byPhone.avatar_url;
      continue;
    }
    const byName = Object.values(s.usersById).find((u) => u.name?.trim() && u.name.trim() === req.clientName?.trim());
    if (byName?.avatar_url) req.clientAvatarUrl = byName.avatar_url;
  }
}

function userIdForIncomingRequest(s: AppState, req: TechIncomingRequest): string | undefined {
  const byPhone = Object.entries(s.usersById).find(([, u]) => {
    const up = u.phone?.trim();
    const rp = req.clientPhone?.trim();
    return Boolean(up && rp && up === rp);
  });
  if (byPhone) return byPhone[0];
  const byName = Object.entries(s.usersById).find(([, u]) => u.name?.trim() && u.name.trim() === req.clientName?.trim());
  return byName?.[0];
}

function techStageToAdminStatus(stage: TechRepairStage): "new" | "diagnostics" | "approval" | "in_progress" | "ready" | "completed" {
  if (stage === "accepted" || stage === "diagnostics") return "diagnostics";
  if (stage === "waiting_approval") return "approval";
  if (stage === "repair") return "in_progress";
  if (stage === "ready") return "ready";
  return "completed";
}

function unreadForTech(messages: TechMessage[]): number {
  return messages.filter((m) => m.from === "client" && !m.read_by_tech_at).length;
}

function dicebearAvatar(seed: string): string {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;
}

function enrichTechMessage(m: TechMessage, thread: TechThread | undefined, profile: TechProfile): TechMessage {
  if (m.from === "tech") {
    const name = thread?.masterName ?? profile.name;
    return {
      ...m,
      senderName: name,
      senderAvatarUrl: thread?.masterAvatarUrl ?? profile.avatar_url ?? dicebearAvatar(name),
    };
  }
  const clientName = thread?.clientName ?? "Клиент";
  return {
    ...m,
    senderName: clientName,
    senderAvatarUrl: thread?.clientAvatarUrl ?? dicebearAvatar(clientName),
  };
}

function masterForRepair(s: AppState, repairId: string): { name: string; avatarUrl?: string } | undefined {
  const thread = s.techPanelMock?.threads.find((t) => t.repairId === repairId);
  if (thread?.masterName) {
    return { name: thread.masterName, avatarUrl: thread.masterAvatarUrl };
  }
  return undefined;
}

function broadcastClientServiceMessage(
  s: AppState,
  orderId: string,
  text: string,
  att?: { attachment_data_url?: string; attachment_name?: string }
): void {
  const m = masterForRepair(s, orderId);
  const now = Date.now();
  for (const inbox of Object.values(s.inboxByUserId)) {
    inbox.messages.push({
      id: crypto.randomUUID(),
      order_id: orderId,
      from: "service",
      text,
      at: now,
      read_by_user: false,
      service_sender_name: m?.name,
      service_sender_avatar_url: m?.avatarUrl,
      attachment_data_url: att?.attachment_data_url,
      attachment_name: att?.attachment_name,
    });
  }
}

/** Сообщение клиента из inbox — копия в тред мастера (локально, без облака). */
export function mirrorUserMessageToTechThread(s: AppState, row: InboxMessageRow): void {
  if (row.from !== "user") return;
  const st = ensureTechState(s);
  const thread = st.threads.find((t) => t.repairId === row.order_id);
  if (!thread) return;
  const at = nowLabel();
  const display = row.text.trim() || (row.attachment_data_url ? "Вложение" : "");
  const msg: TechMessage = {
    id: row.id,
    from: "client",
    text: display,
    at,
    attachment: row.attachment_data_url,
    delivered_at: row.at,
  };
  const list = st.messagesByThread[thread.id] ?? [];
  list.push(msg);
  st.messagesByThread[thread.id] = list;
  thread.unreadCount = unreadForTech(list);
  thread.lastMessage = display.slice(0, 120) || "Вложение";
  thread.updatedAt = at;
}

export function markTechThreadReadByClient(s: AppState, orderId: string): void {
  const st = ensureTechState(s);
  const thread = st.threads.find((t) => t.repairId === orderId);
  if (!thread) return;
  const list = st.messagesByThread[thread.id] ?? [];
  const now = Date.now();
  for (const m of list) {
    if (m.from === "tech" && !m.read_by_client_at) m.read_by_client_at = now;
  }
}

export async function markTechThreadRead(threadId: string): Promise<void> {
  await withStore((s) => {
    const st = ensureTechState(s);
    const thread = st.threads.find((t) => t.id === threadId);
    if (!thread) return;
    const list = st.messagesByThread[thread.id] ?? [];
    const now = Date.now();
    for (const m of list) {
      if (m.from === "client" && !m.read_by_tech_at) m.read_by_tech_at = now;
    }
    thread.unreadCount = unreadForTech(list);

    for (const inbox of Object.values(s.inboxByUserId)) {
      for (const row of inbox.messages) {
        if (row.order_id === thread.repairId && row.from === "user" && !row.read_by_service) {
          row.read_by_service = true;
        }
      }
    }
  });
}

function broadcastClientApproval(s: AppState, orderId: string, label: string): void {
  const now = Date.now();
  for (const inbox of Object.values(s.inboxByUserId)) {
    inbox.approvals.push({
      id: crypto.randomUUID(),
      order_id: orderId,
      label,
      status: "pending",
      created_at: now,
    });
  }
}

export async function getTechDashboard() {
  return withStore((s) => {
    hydrateThreadParticipants(s);
    const st = ensureTechState(s);
    const active = st.repairs.filter((r) => r.stage !== "completed");
    const pendingIncoming = st.incoming.filter((i) => i.status === "pending");
    const inProg = active.filter((r) => r.stage === "repair" || r.stage === "diagnostics").length;
    const waiting = active.filter((r) => r.stage === "waiting_approval").length;
    return { profile: st.profile, alerts: st.alerts, active, pendingIncomingCount: pendingIncoming.length, inProg, waiting };
  });
}

export async function listTechIncoming() {
  return withStore((s) => {
    hydrateIncomingClientAvatars(s);
    return ensureTechState(s).incoming.filter((x) => x.status === "pending");
  });
}
export async function getTechIncomingById(id: string) {
  return withStore((s) => {
    hydrateIncomingClientAvatars(s);
    const req = ensureTechState(s).incoming.find((x) => x.id === id);
    if (!req) return null;
    const chatThreadId = ensureThreadForIncoming(s, req);
    return { ...req, chatThreadId };
  });
}
export async function createTechIncomingFromClient(
  userId: string,
  payload: {
    deviceType: "phone" | "tablet" | "laptop";
    device: string;
    issue: string;
    contactPhone: string;
    photoDataUrls: string[];
    needsConsultation?: boolean;
    bringInPerson?: boolean;
  }
): Promise<TechIncomingRequest> {
  return withStore((s) => {
    const st = ensureTechState(s);
    const u = s.usersById[userId];
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    const publicId = `EV-NEW-${String(st.incoming.length + st.repairs.length + st.completed.length + 100).padStart(3, "0")}`;
    const row: TechIncomingRequest = {
      id: crypto.randomUUID(),
      publicId,
      device: payload.device,
      deviceType: payload.deviceType,
      thumb: payload.deviceType === "laptop" ? "💻" : payload.deviceType === "tablet" ? "📱" : "📱",
      issueShort: payload.issue.trim().slice(0, 140),
      clientName: u?.name?.trim() || "Клиент",
      clientAvatarUrl: u?.avatar_url,
      clientPhone: payload.contactPhone.trim() || u?.phone?.trim() || "—",
      photoDataUrls: payload.photoDataUrls.slice(0, 8),
      createdAt: `${d}.${m}.${y}`,
      priority: payload.photoDataUrls.length > 0 ? "high" : "normal",
      status: "pending",
    };
    st.incoming.unshift(row);
    ensureThreadForIncoming(s, row);
    st.alerts.unshift({
      id: crypto.randomUUID(),
      at: nowLabel(),
      type: "warning",
      message: `Новая заявка ${publicId} — ${payload.device}`,
    });
    st.alerts = st.alerts.slice(0, 30);
    const inbox = s.inboxByUserId[userId];
    if (inbox) {
      inbox.messages.push({
        id: crypto.randomUUID(),
        order_id: row.id,
        from: "service",
        text: "Заявка принята сервисом. Ожидайте, мастер рассмотрит её во входящих.",
        at: Date.now(),
        read_by_user: false,
        service_sender_name: "Сервис",
      });
    }
    if (s.adminPanelMock) {
      s.adminPanelMock.orders.unshift({
        id: row.id,
        publicId: row.publicId,
        device: row.device,
        customer: row.clientName,
        phone: row.clientPhone,
        status: "new",
        technician: null,
        totalRub: 0,
        createdAt: row.createdAt,
        deviceType: row.deviceType,
        email: u?.email?.trim() || "",
        issue: payload.issue.trim(),
        photos: row.photoDataUrls?.length ?? 0,
        photoUrls: row.photoDataUrls ?? [],
        repairOption: "Первичная диагностика",
        laborRub: 0,
        partsRub: 0,
        notes: [payload.needsConsultation ? "Клиент просил предварительную консультацию." : "Новая заявка от клиента."],
        timeline: [{ at: `${d}.${m} ${now.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}`, label: "Создана новая заявка" }],
      });
    }
    return row;
  });
}
export async function acceptIncoming(id: string): Promise<string | null> {
  return withStore((s) => {
    const st = ensureTechState(s);
    const req = st.incoming.find((x) => x.id === id);
    if (!req) return null;
    req.status = "accepted";
    const existing = st.repairs.find((r) => r.incomingId === req.id || r.id === req.id);
    if (existing) return existing.id;

    const newRepair: TechRepairJob = {
      id: req.id,
      publicId: req.publicId,
      incomingId: req.id,
      device: req.device,
      deviceType: req.deviceType,
      thumb: req.thumb,
      customer: req.clientName,
      phone: req.clientPhone,
      email: "",
      stage: "accepted",
      issue: req.issueShort,
      photos: req.photoDataUrls?.length ?? 0,
      photoUrls: req.photoDataUrls?.slice(0, 16) ?? [],
      complexity: "medium",
      clientNotes: "",
      laborRub: 0,
      partsRub: 0,
      etaHours: 24,
      startedAt: nowLabel(),
      diagnosticsIssues: [],
      selectedPartIds: [],
    };
    st.repairs.unshift(newRepair);

    const threadId = ensureThreadForIncoming(s, req);
    const thread = st.threads.find((t) => t.id === threadId);
    if (thread) {
      thread.lastMessage = "Заявка принята в работу.";
      thread.updatedAt = nowLabel();
    }
    const hasAcceptanceMessage = (st.messagesByThread[threadId] ?? []).some((m) => m.text === "Здравствуйте! Заявка принята. Начинаем диагностику.");
    if (!hasAcceptanceMessage) {
      st.messagesByThread[threadId] = [
        ...(st.messagesByThread[threadId] ?? []),
        {
          id: crypto.randomUUID(),
          from: "tech",
          text: "Здравствуйте! Заявка принята. Начинаем диагностику.",
          at: nowLabel(),
          delivered_at: Date.now(),
        },
      ];
    }

    const uid = userIdForIncomingRequest(s, req);
    if (uid) {
      const inbox = s.inboxByUserId[uid];
      if (inbox) {
        inbox.messages.push({
          id: crypto.randomUUID(),
          order_id: newRepair.id,
          from: "service",
          text: "Мастер принял заявку. Статус: Принято.",
          at: Date.now(),
          read_by_user: false,
          service_sender_name: st.profile.name,
          service_sender_avatar_url: st.profile.avatar_url,
        });
      }
    }

    if (s.adminPanelMock) {
      const o = s.adminPanelMock.orders.find((x) => x.id === req.id);
      if (o) {
        o.status = "diagnostics";
        o.technician = st.profile.name;
      }
    }
    return newRepair.id;
  });
}
export async function declineIncoming(id: string): Promise<boolean> {
  return withStore((s) => {
    const st = ensureTechState(s);
    const req = st.incoming.find((x) => x.id === id);
    if (!req) return false;
    req.status = "declined";
    return true;
  });
}

export async function listTechTasks() {
  return withStore((s) => {
    hydrateIncomingClientAvatars(s);
    const st = ensureTechState(s);
    const incoming = st.incoming.filter((i) => i.status === "pending");
    return { incoming, repairs: st.repairs };
  });
}
export async function listTechCompleted() {
  return withStore((s) => ensureTechState(s).completed);
}
export async function getTechRepairById(id: string) {
  return withStore((s) => allRepairs(ensureTechState(s)).find((x) => x.id === id));
}
export async function saveTechDiagnostics(id: string, diagnosticsIssues: string[], photoDataUrls?: string[]) {
  return withStore((s) => {
    const st = ensureTechState(s);
    const repair = allRepairs(st).find((x) => x.id === id);
    if (!repair) return null;
    repair.diagnosticsIssues = diagnosticsIssues;
    if (photoDataUrls?.length) {
      const capped = photoDataUrls.filter((u) => u.length < 4_000_000).slice(0, 12);
      repair.photoUrls = [...repair.photoUrls, ...capped].slice(-16);
      repair.photos = repair.photoUrls.length;
    }
    if (repair.stage === "accepted") {
      repair.stage = "diagnostics";
    }
    return repair;
  });
}
export async function getTechPartsCatalog() {
  return withStore((s) => ensureTechState(s).partsCatalog);
}
export async function saveTechPricing(id: string, laborRub: number, selectedPartIds: string[]) {
  return withStore((s) => {
    const st = ensureTechState(s);
    const repair = allRepairs(st).find((x) => x.id === id);
    if (!repair) return null;
    repair.laborRub = laborRub;
    repair.selectedPartIds = selectedPartIds;
    repair.partsRub = st.partsCatalog.filter((p) => selectedPartIds.includes(p.id)).reduce((sum, p) => sum + p.priceRub, 0);
    // Базовый вариант сметы — чтобы клиент всегда видел хотя бы один актуальный вариант.
    const selectedParts = st.partsCatalog.filter((p) => selectedPartIds.includes(p.id));
    const hasInStock = selectedParts.some((p) => p.inStock);
    const hasOem = selectedParts.some((p) => p.oem);
    repair.quoteOptions = [
      {
        id: "base",
        title: "Базовый вариант",
        laborRub: repair.laborRub,
        selectedPartIds: [...selectedPartIds],
        availability: hasInStock ? "in_stock" : "on_order",
        orderLeadDays: hasInStock ? undefined : 2,
        isOriginal: hasOem,
        repairDaysLabel: hasInStock ? "1-2 дня" : "2-4 дня",
      },
    ];
    return repair;
  });
}

export async function saveTechQuoteOptions(
  id: string,
  options: Array<{
    id: string;
    title: string;
    laborRub: number;
    selectedPartIds: string[];
    availability: "in_stock" | "on_order";
    orderLeadDays?: number;
    isOriginal: boolean;
    repairDaysLabel?: string;
  }>
) {
  return withStore((s) => {
    const st = ensureTechState(s);
    const repair = allRepairs(st).find((x) => x.id === id);
    if (!repair) return null;
    const normalized = options
      .filter((o) => o.title.trim().length > 0)
      .map((o) => ({
        ...o,
        title: o.title.trim(),
        laborRub: Math.max(0, o.laborRub || 0),
        selectedPartIds: [...new Set(o.selectedPartIds)].slice(0, 12),
      }))
      .slice(0, 6);
    if (normalized.length === 0) {
      repair.quoteOptions = undefined;
      return repair;
    }
    repair.quoteOptions = normalized;
    const primary = normalized[0];
    repair.laborRub = primary.laborRub;
    repair.selectedPartIds = [...primary.selectedPartIds];
    repair.partsRub = st.partsCatalog.filter((p) => primary.selectedPartIds.includes(p.id)).reduce((sum, p) => sum + p.priceRub, 0);
    return repair;
  });
}
export async function sendTechApproval(id: string) {
  return withStore((s) => {
    const st = ensureTechState(s);
    const repair = allRepairs(st).find((x) => x.id === id);
    if (!repair) return null;
    repair.stage = "waiting_approval";
    broadcastClientApproval(s, repair.id, `${repair.device} — мастер отправил смету на согласование`);
    broadcastClientServiceMessage(
      s,
      repair.id,
      "Смета готова. Проверьте и подтвердите вариант ремонта в разделе сообщений.",
      undefined
    );
    return repair;
  });
}
export async function saveTechStage(id: string, stage: TechRepairStage) {
  return withStore((s) => {
    const st = ensureTechState(s);
    const repair = allRepairs(st).find((x) => x.id === id);
    if (!repair) return null;
    repair.stage = stage;
    const stageLabel: Record<TechRepairStage, string> = {
      accepted: "Принято",
      diagnostics: "Диагностика",
      waiting_approval: "Ожидает согласования",
      repair: "Ремонт",
      ready: "Готово к выдаче",
      completed: "Завершено",
    };
    broadcastClientServiceMessage(s, repair.id, `Статус заказа обновлён: ${stageLabel[stage]}.`, undefined);
    if (s.adminPanelMock) {
      const row = s.adminPanelMock.orders.find((o) => o.id === repair.id);
      if (row) row.status = techStageToAdminStatus(stage);
    }
    return repair;
  });
}
export async function saveTechPartsSelection(id: string, selectedPartIds: string[]) {
  return saveTechPricing(id, (await getTechRepairById(id))?.laborRub ?? 0, selectedPartIds);
}

export async function listTechThreads() {
  return withStore((s) => {
    hydrateThreadParticipants(s);
    const st = ensureTechState(s);
    for (const t of st.threads) {
      const list = st.messagesByThread[t.id] ?? [];
      t.unreadCount = unreadForTech(list);
    }
    return st.threads;
  });
}
export async function getTechThreadById(id: string) {
  return withStore((s) => {
    hydrateThreadParticipants(s);
    return ensureTechState(s).threads.find((t) => t.id === id);
  });
}
export async function listTechThreadMessages(id: string) {
  return withStore((s) => {
    hydrateThreadParticipants(s);
    const st = ensureTechState(s);
    const msgs = st.messagesByThread[id] ?? [];
    const thread = st.threads.find((t) => t.id === id);
    return msgs.map((m) => enrichTechMessage(m, thread, st.profile));
  });
}
export async function sendTechThreadMessage(
  threadId: string,
  text: string,
  opts?: { attachmentDataUrl?: string; attachmentName?: string }
): Promise<TechMessage> {
  return withStore((s) => {
    hydrateThreadParticipants(s);
    const st = ensureTechState(s);
    const display = text.trim() || (opts?.attachmentDataUrl ? "Вложение" : "");
    const msg: TechMessage = {
      id: crypto.randomUUID(),
      from: "tech",
      text: display,
      at: nowLabel(),
      attachment: opts?.attachmentDataUrl,
      delivered_at: Date.now(),
    };
    const list = st.messagesByThread[threadId] ?? [];
    list.push(msg);
    st.messagesByThread[threadId] = list;
    const thread = st.threads.find((t) => t.id === threadId);
    if (thread) {
      thread.unreadCount = unreadForTech(list);
      thread.lastMessage = display.slice(0, 120) || "Вложение";
      thread.updatedAt = msg.at;
      broadcastClientServiceMessage(s, thread.repairId, display, {
        attachment_data_url: opts?.attachmentDataUrl,
        attachment_name: opts?.attachmentName,
      });
    }
    return enrichTechMessage(msg, thread, st.profile);
  });
}
export async function getTechTemplates() {
  return withStore((s) => ensureTechState(s).templates);
}
export async function getTechProfile() {
  return withStore((s) => ensureTechState(s).profile);
}
export async function getTechSettings() {
  return withStore((s) => ensureTechState(s).settings);
}
export async function saveTechSettings(patch: Partial<TechPanelMockState["settings"]>) {
  return withStore((s) => {
    const st = ensureTechState(s);
    st.settings = { ...st.settings, ...patch };
    return st.settings;
  });
}

