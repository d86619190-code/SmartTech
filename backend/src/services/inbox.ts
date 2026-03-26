import crypto from "node:crypto";
import {
  withStore,
  type AppState,
  type ApprovalRow,
  type InboxMessageRow,
  type TechProfile,
  type UserInboxRow,
  type UserRow,
} from "../store.js";
import { markTechThreadReadByClient, mirrorUserMessageToTechThread } from "./techMock.js";

export type InboxApprovalItem = {
  id: string;
  orderId: string;
  label: string;
  createdAt: number;
};

export type InboxThreadItem = {
  orderId: string;
  title: string;
  preview: string;
  lastAt: number;
  unreadCount: number;
  /** Мастер недавно активен — зелёный индикатор в списке */
  counterpartOnline?: boolean;
};

export type InboxSummary = {
  approvals: InboxApprovalItem[];
  threads: InboxThreadItem[];
  unreadMessages: number;
  badgeCount: number;
};

export type InboxMessage = {
  id: string;
  orderId: string;
  from: "user" | "service";
  text: string;
  at: number;
  readByService?: boolean;
  senderName: string;
  senderAvatarUrl?: string;
  attachment?: { dataUrl: string; name?: string };
};

function dicebearAvatar(seed: string): string {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;
}

function mapInboxMessage(
  m: InboxMessageRow,
  user: UserRow | undefined,
  tech: TechProfile | undefined,
  dynamicMaster?: { name: string; avatarUrl?: string }
): InboxMessage {
  const att =
    m.attachment_data_url ?
      { dataUrl: m.attachment_data_url, name: m.attachment_name }
    : undefined;
  if (m.from === "user") {
    const name = user?.name?.trim() || "Вы";
    return {
      id: m.id,
      orderId: m.order_id,
      from: m.from,
      text: m.text,
      at: m.at,
      readByService: Boolean(m.read_by_service),
      senderName: name,
      senderAvatarUrl: user?.avatar_url ?? dicebearAvatar(name),
      attachment: att,
    };
  }
  const masterName = dynamicMaster?.name || m.service_sender_name?.trim() || tech?.name?.trim() || "Мастер";
  const masterAvatar = dynamicMaster?.avatarUrl || m.service_sender_avatar_url?.trim() || tech?.avatar_url;
  return {
    id: m.id,
    orderId: m.order_id,
    from: m.from,
    text: m.text,
    at: m.at,
    senderName: masterName,
    senderAvatarUrl: masterAvatar ?? dicebearAvatar(masterName),
    attachment: att,
  };
}

function serviceSenderForOrder(s: AppState, orderId: string): { name: string; avatarUrl?: string } | undefined {
  const thread = s.techPanelMock?.threads.find((t) => t.repairId === orderId);
  if (thread?.masterName) {
    return { name: thread.masterName, avatarUrl: thread.masterAvatarUrl };
  }
  return undefined;
}

export function ensureInboxByUser(s: { inboxByUserId: Record<string, UserInboxRow> }, userId: string): UserInboxRow {
  if (!s.inboxByUserId[userId]) {
    s.inboxByUserId[userId] = { approvals: [], messages: [] };
  }
  const inbox = s.inboxByUserId[userId];
  const isLegacyMockOrder = (orderId: string) =>
    ["r-ff", "r-alex", "r-user", "r-done-1"].includes(orderId) || /^r-(ff|alex|user)-/i.test(orderId);
  inbox.messages = inbox.messages.filter((m) => !isLegacyMockOrder(m.order_id));
  inbox.approvals = inbox.approvals.filter((a) => !isLegacyMockOrder(a.order_id));
  return inbox;
}

function mapApproval(a: ApprovalRow): InboxApprovalItem {
  return { id: a.id, orderId: a.order_id, label: a.label, createdAt: a.created_at };
}

function toThreadTitle(s: AppState, orderId: string): string {
  const techJobs = [...(s.techPanelMock?.repairs ?? []), ...(s.techPanelMock?.completed ?? [])];
  const job = techJobs.find((j) => j.id === orderId);
  if (job) return job.device;
  return "Заказ";
}

const MASTER_TTL_MS = 6000;
const MASTER_MSG_RECENT_MS = 45000;

function masterLooksOnlineForOrder(s: AppState, orderId: string, orderMessages: InboxMessageRow[]): boolean {
  const thread = s.techPanelMock?.threads.find((t) => t.repairId === orderId);
  const typing = Boolean(thread && Date.now() - (thread.masterTypingAt ?? 0) < MASTER_TTL_MS);
  const lastSvc = [...orderMessages].filter((m) => m.from === "service").pop();
  const recentMsg = Boolean(lastSvc && Date.now() - lastSvc.at < MASTER_MSG_RECENT_MS);
  return typing || recentMsg;
}

export async function getInboxSummary(userId: string): Promise<InboxSummary> {
  return withStore((s) => {
    const inbox = ensureInboxByUser(s, userId);
    const approvals = inbox.approvals.filter((a) => a.status === "pending").map(mapApproval);

    const byOrder = new Map<string, InboxMessageRow[]>();
    for (const m of inbox.messages) {
      const list = byOrder.get(m.order_id) ?? [];
      list.push(m);
      byOrder.set(m.order_id, list);
    }

    const threads = Array.from(byOrder.entries())
      .map(([orderId, list]) => {
        const sorted = [...list].sort((a, b) => a.at - b.at);
        const last = sorted[sorted.length - 1];
        const unreadCount = sorted.filter((m) => !m.read_by_user && m.from === "service").length;
        return {
          orderId,
          title: toThreadTitle(s, orderId),
          preview: last?.text ?? "",
          lastAt: last?.at ?? 0,
          unreadCount,
          counterpartOnline: masterLooksOnlineForOrder(s, orderId, sorted),
        };
      })
      .sort((a, b) => b.lastAt - a.lastAt);

    const unreadMessages = threads.reduce((acc, t) => acc + t.unreadCount, 0);
    return {
      approvals,
      threads,
      unreadMessages,
      badgeCount: approvals.length + unreadMessages,
    };
  });
}

export async function getOrderMessages(userId: string, orderId: string): Promise<InboxMessage[]> {
  return withStore((s) => {
    const inbox = ensureInboxByUser(s, userId);
    const user = s.usersById[userId];
    const tech = s.techPanelMock?.profile;
    return inbox.messages
      .filter((m) => m.order_id === orderId)
      .sort((a, b) => a.at - b.at)
      .map((m) => mapInboxMessage(m, user, tech, serviceSenderForOrder(s, m.order_id)));
  });
}

export async function markThreadRead(userId: string, orderId: string): Promise<void> {
  await withStore((s) => {
    const inbox = ensureInboxByUser(s, userId);
    for (const m of inbox.messages) {
      if (m.order_id === orderId && m.from === "service") {
        m.read_by_user = true;
      }
    }
    markTechThreadReadByClient(s, orderId);
  });
}

export async function sendUserMessage(
  userId: string,
  orderId: string,
  text: string,
  attachment?: { name?: string; dataUrl: string }
): Promise<InboxMessage> {
  return withStore((s) => {
    const inbox = ensureInboxByUser(s, userId);
    const now = Date.now();
    const displayText = text.trim() || (attachment ? "Вложение" : "");
    const row: InboxMessageRow = {
      id: crypto.randomUUID(),
      order_id: orderId,
      from: "user",
      text: displayText,
      at: now,
      read_by_user: true,
      read_by_service: false,
      attachment_data_url: attachment?.dataUrl,
      attachment_name: attachment?.name,
    };
    inbox.messages.push(row);
    mirrorUserMessageToTechThread(s, row);
    return mapInboxMessage(row, s.usersById[userId], s.techPanelMock?.profile);
  });
}

export async function resolveApproval(
  userId: string,
  approvalId: string,
  decision: "approved" | "declined",
  optionId?: string
): Promise<boolean> {
  return withStore((s) => {
    const inbox = ensureInboxByUser(s, userId);
    const target = inbox.approvals.find((a) => a.id === approvalId && a.status === "pending");
    if (!target) return false;
    target.status = decision;
    target.resolved_at = Date.now();

    const tech = s.techPanelMock?.repairs.find((r) => r.id === target.order_id);
    if (tech) {
      if (decision === "approved") {
        const options = tech.quoteOptions ?? [];
        const selected = (optionId ? options.find((o) => o.id === optionId) : undefined) ?? options[0];
        if (selected) {
          const partsCatalog = s.techPanelMock?.partsCatalog ?? [];
          const customParts = tech.customParts ?? [];
          const uniqPartIds = [...new Set(selected.selectedPartIds)];
          const partsSum = uniqPartIds.reduce((sum, id) => {
            const p = partsCatalog.find((x) => x.id === id) ?? customParts.find((x) => x.id === id);
            return sum + (p ? Math.max(0, p.priceRub || 0) : 0);
          }, 0);
          tech.selectedPartIds = uniqPartIds;
          tech.laborRub = Math.max(0, selected.laborRub || 0);
          tech.partsRub = Math.max(0, partsSum);
          // Keep only the chosen variant after customer confirmation.
          tech.quoteOptions = [{ ...selected, selectedPartIds: uniqPartIds }];
        }
      }
      if (tech.stage === "waiting_approval") {
        tech.stage = decision === "approved" ? "repair" : "ready";
      }
    }

    const extra = serviceSenderForOrder(s, target.order_id);
    const serviceMessage: InboxMessageRow = {
      id: crypto.randomUUID(),
      order_id: target.order_id,
      from: "service",
      text:
        decision === "approved"
          ? "Ваш выбор варианта ремонта подтверждён. Приступаем к работе."
          : "Вы отказались от ремонта. Мы подготовим устройство к выдаче после оплаты диагностики.",
      at: Date.now(),
      read_by_user: false,
      service_sender_name: extra?.name,
      service_sender_avatar_url: extra?.avatarUrl,
    };
    inbox.messages.push(serviceMessage);
    return true;
  });
}

