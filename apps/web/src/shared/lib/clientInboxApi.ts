import { apiOrigin } from "@/shared/config/api";
import { clearAuthSession, readAuthSession, saveAuthSession, type AuthSession } from "./authSession";
import { getStreamToken } from "./authApi";
import { openSseStream, type StreamStatus } from "./realtime/openSseStream";

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

type RefreshResponse = {
  accessToken: string;
  refreshToken: string;
  user: AuthSession["user"];
};

async function parseError(res: Response): Promise<string> {
  const body = (await res.json().catch(() => ({}))) as { error?: string };
  return body.error ?? `Ошибка ${res.status}`;
}

async function refreshSessionOrThrow(): Promise<AuthSession> {
  const current = readAuthSession();
  if (!current) throw new Error("Требуется авторизация");
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
  if (!session) throw new Error("Требуется авторизация");
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

export async function createOrderApi(payload: CreateOrderPayload): Promise<{ incoming: { id: string; publicId: string } }> {
  const res = await authorizedFetch("/api/v1/client/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return (await res.json()) as { incoming: { id: string; publicId: string } };
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
  onStatus?: (status: StreamStatus) => void
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
    },
    onError,
    onStatus,
  });
}

