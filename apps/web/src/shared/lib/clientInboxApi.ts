import { apiOrigin } from "@/shared/config/api";
import { clearAuthSession, readAuthSession, saveAuthSession, type AuthSession } from "./authSession";
import { getStreamToken } from "./authApi";
import { openSseStream, type StreamStatus } from "./realtime/openSseStream";
import { normalizeAuthRequiredMessage, redirectToLoginForAuthMissing, isAuthRequiredMessage } from "./authRedirect";

export type { StreamStatus } from "./realtime/openSseStream";

export type InboxApproval = {
  id: string;
  orderId: string;
  label: string;
  createdAt: number;
};

export type InboxThread = {
  orderId: string;
  title: string;
  preview: string;
  lastAt: number;
  unreadCount: number;
  counterpartOnline?: boolean;
  counterpartName?: string;
  counterpartAvatarUrl?: string;
  orderPublicId?: string;
  issueSummary?: string;
};

export type InboxSummary = {
  approvals: InboxApproval[];
  threads: InboxThread[];
  unreadMessages: number;
  badgeCount: number;
};

export type ChatMessage = {
  id: string;
  orderId: string;
  from: "user" | "service";
  text: string;
  at: number;
  senderName: string;
  senderAvatarUrl?: string;
  attachment?: { dataUrl: string; name?: string };
  readByService?: boolean;
};

export type ClientOrderMeta = {
  id: string;
  deviceLabel: string;
  issueSummary: string;
  needsApproval: boolean;
  clientStep:
    | "created"
    | "awaiting_device"
    | "diagnostics"
    | "awaiting_approval"
    | "in_repair"
    | "ready"
    | "completed";
  canRateOrder?: boolean;
  myRating?: number;
  /** Мастер набирает сообщение (когда бэкенд отдаёт) — показываем «Печатает» вместо «вы в сети» */
  serviceTyping?: boolean;
  /** Мастер недавно на связи — зелёный индикатор */
  counterpartOnline?: boolean;
  diagnosticFeeRub?: number;
  quoteOptions?: Array<{
    id: string;
    title: string;
    subtitle?: string;
    availability: "in_stock" | "on_order";
    orderLeadDays?: number;
    isOriginal: boolean;
    repairDaysLabel?: string;
    priceRub: number;
  }>;
  timeline?: Array<{
    id: string;
    stage: "accepted" | "diagnostics" | "waiting_approval" | "repair" | "ready" | "completed";
    kind: "stage" | "substep";
    title: string;
    description?: string;
    at: number;
    atLabel: string;
    photoDataUrls: string[];
  }>;
  pricing?: {
    totalRub: number;
    items: Array<{
      id: string;
      type: "service" | "part";
      name: string;
      description?: string;
      priceRub: number;
    }>;
  };
};

export type ClientRepairDto = {
  id: string;
  orderId: string;
  deviceName: string;
  issueLabel: string;
  imageUrl: string;
  progressPercent: number;
  estimateLabel: string;
  status: "in_progress" | "completed" | "canceled";
  totalRub: number;
  orderDateLabel: string;
};

export type CreateOrderPayload = {
  deviceType: "phone" | "tablet" | "laptop";
  device: string;
  issue: string;
  contactPhone: string;
  photoDataUrls: string[];
  needsConsultation?: boolean;
  bringInPerson?: boolean;
};

export type OrderDraftPayload = {
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

export type OrderDraftRow = {
  id: string;
  title: string;
  saved_at: number;
  payload: OrderDraftPayload;
};

type RefreshResponse = {
  accessToken: string;
  refreshToken: string;
  user: AuthSession["user"];
};

async function parseError(res: Response): Promise<string> {
  const body = (await res.json().catch(() => ({}))) as { error?: string };
  const base = body.error ?? `Ошибка ${res.status}`;
  if (isAuthRequiredMessage(base)) {
    redirectToLoginForAuthMissing();
    return normalizeAuthRequiredMessage(base);
  }
  return base;
}

async function refreshSessionOrThrow(): Promise<AuthSession> {
  const current = readAuthSession();
  if (!current) {
    redirectToLoginForAuthMissing();
    throw new Error("Нужна авторизация");
  }
  const res = await fetch(`${apiOrigin}/api/v1/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken: current.refreshToken }),
  });
  if (!res.ok) {
    clearAuthSession();
    throw new Error("Сессия истекла");
  }
  const body = (await res.json()) as RefreshResponse;
  const next: AuthSession = {
    accessToken: body.accessToken,
    refreshToken: body.refreshToken,
    user: body.user,
  };
  saveAuthSession(next);
  return next;
}

async function authorizedFetch(path: string, init?: RequestInit): Promise<Response> {
  let session = readAuthSession();
  if (!session) {
    redirectToLoginForAuthMissing();
    throw new Error("Нужна авторизация");
  }
  let res = await fetch(`${apiOrigin}${path}`, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      Authorization: `Bearer ${session.accessToken}`,
    },
  });
  if (res.status !== 401) return res;
  session = await refreshSessionOrThrow();
  res = await fetch(`${apiOrigin}${path}`, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      Authorization: `Bearer ${session.accessToken}`,
    },
  });
  return res;
}

export async function getInboxSummaryApi(): Promise<InboxSummary> {
  const res = await authorizedFetch("/api/v1/client/inbox");
  if (!res.ok) throw new Error(await parseError(res));
  return (await res.json()) as InboxSummary;
}

export async function getOrderMessagesApi(orderId: string): Promise<ChatMessage[]> {
  const res = await authorizedFetch(`/api/v1/client/messages/${orderId}`);
  if (!res.ok) throw new Error(await parseError(res));
  const body = (await res.json()) as { messages: ChatMessage[] };
  return body.messages;
}

export async function markOrderMessagesReadApi(orderId: string): Promise<void> {
  const res = await authorizedFetch(`/api/v1/client/messages/${orderId}/read`, { method: "POST" });
  if (!res.ok && res.status !== 204) throw new Error(await parseError(res));
}

export async function postOrderTyping(orderId: string): Promise<void> {
  const res = await authorizedFetch(`/api/v1/client/messages/${orderId}/typing`, { method: "POST" });
  if (!res.ok && res.status !== 204) throw new Error(await parseError(res));
}

export async function sendOrderMessageApi(
  orderId: string,
  text: string,
  attachment?: { name?: string; dataUrl: string }
): Promise<ChatMessage> {
  const res = await authorizedFetch(`/api/v1/client/messages/${orderId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, attachment }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  const body = (await res.json()) as { message: ChatMessage };
  return body.message;
}

export async function resolveApprovalApi(
  approvalId: string,
  decision: "approved" | "declined",
  optionId?: string
): Promise<void> {
  const res = await authorizedFetch(`/api/v1/client/approvals/${approvalId}/resolve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ decision, optionId }),
  });
  if (!res.ok) throw new Error(await parseError(res));
}

export async function getClientRepairsApi(): Promise<ClientRepairDto[]> {
  const res = await authorizedFetch("/api/v1/client/repairs");
  if (!res.ok) throw new Error(await parseError(res));
  const body = (await res.json()) as { repairs: ClientRepairDto[] };
  return body.repairs;
}

export async function getClientOrderMetaApi(orderId: string): Promise<ClientOrderMeta> {
  const res = await authorizedFetch(`/api/v1/client/orders/${orderId}`);
  if (!res.ok) throw new Error(await parseError(res));
  const body = (await res.json()) as { order: ClientOrderMeta };
  return body.order;
}

export async function rateClientOrderApi(orderId: string, stars: number): Promise<void> {
  const res = await authorizedFetch(`/api/v1/client/orders/${orderId}/rate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ stars }),
  });
  if (!res.ok) throw new Error(await parseError(res));
}

export async function createOrderApi(payload: CreateOrderPayload): Promise<{ incoming: { id: string; publicId: string } }> {
  const res = await authorizedFetch("/api/v1/client/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return (await res.json()) as { incoming: { id: string; publicId: string } };
}

export async function getOrderDraftsApi(): Promise<OrderDraftRow[]> {
  const res = await authorizedFetch("/api/v1/client/order-drafts");
  if (!res.ok) throw new Error(await parseError(res));
  const body = (await res.json()) as { rows: OrderDraftRow[] };
  return body.rows;
}

export async function saveOrderDraftApi(payload: OrderDraftPayload, draftId?: string): Promise<OrderDraftRow> {
  const res = await authorizedFetch("/api/v1/client/order-drafts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ draftId, payload }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  const body = (await res.json()) as { row: OrderDraftRow };
  return body.row;
}

export async function deleteOrderDraftApi(draftId: string): Promise<void> {
  const res = await authorizedFetch(`/api/v1/client/order-drafts/${encodeURIComponent(draftId)}`, { method: "DELETE" });
  if (!res.ok) throw new Error(await parseError(res));
}

export function openInboxSummaryStream(
  onSummary: (summary: InboxSummary) => void,
  onError?: (e: Event) => void,
  onStatus?: (status: StreamStatus) => void
): () => void {
  return openSseStream({
    getUrl: async () => {
      const streamToken = await getStreamToken();
      return `${apiOrigin}/api/v1/client/inbox/stream?streamToken=${encodeURIComponent(streamToken)}`;
    },
    eventHandlers: {
      summary: (raw) => {
        try {
          const payload = JSON.parse(raw) as InboxSummary;
          onSummary(payload);
        } catch {
          // noop
        }
      },
    },
    onError,
    onStatus,
  });
}

export function openOrderMessagesStream(
  orderId: string,
  onMessages: (messages: ChatMessage[]) => void,
  onError?: (e: Event) => void,
  onStatus?: (status: StreamStatus) => void,
  onChatMeta?: (meta: { serviceTyping: boolean }) => void
): () => void {
  return openSseStream({
    getUrl: async () => {
      const streamToken = await getStreamToken();
      return `${apiOrigin}/api/v1/client/messages/${orderId}/stream?streamToken=${encodeURIComponent(streamToken)}`;
    },
    eventHandlers: {
      messages: (raw) => {
        try {
          const payload = JSON.parse(raw) as { orderId: string; messages: ChatMessage[] };
          onMessages(payload.messages);
        } catch {
          // noop
        }
      },
      chatmeta: (raw) => {
        try {
          const meta = JSON.parse(raw) as { serviceTyping: boolean };
          onChatMeta?.(meta);
        } catch {
          // noop
        }
      },
    },
    onError,
    onStatus,
  });
}

