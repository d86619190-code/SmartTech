import { apiOrigin } from "@/shared/config/api";
import { readAuthSession, type AuthSession } from "./authSession";
import { refreshSessionOrNull } from "./authApi";
import { getStreamToken } from "./authApi";
import { openSseStream, type StreamStatus } from "./realtime/openSseStream";
import { normalizeAuthRequiredMessage, redirectToLoginForAuthMissing, isAuthRequiredMessage } from "./authRedirect";

async function parseError(res: Response): Promise<string> {
  const body = (await res.json().catch(() => ({}))) as { error?: string };
  const base = body.error ?? `Error ${res.status}`;
  if (isAuthRequiredMessage(base)) {
    redirectToLoginForAuthMissing();
    return normalizeAuthRequiredMessage(base);
  }
  return base;
}
async function authFetch(path: string, init?: RequestInit): Promise<Response> {
  let session = readAuthSession();
  if (!session) {
    redirectToLoginForAuthMissing();
    throw new Error("Authorization required");
  }
  let res = await fetch(`${apiOrigin}${path}`, { ...init, headers: { ...(init?.headers ?? {}), Authorization: `Bearer ${session.accessToken}` } });
  if (res.status !== 401) return res;
  session = await refreshSessionOrNull();
  if (!session) throw new Error("Session expired");
  res = await fetch(`${apiOrigin}${path}`, { ...init, headers: { ...(init?.headers ?? {}), Authorization: `Bearer ${session.accessToken}` } });
  return res;
}
async function getJson<T>(path: string): Promise<T> {
  const res = await authFetch(path);
  if (!res.ok) throw new Error(await parseError(res));
  return (await res.json()) as T;
}
async function patchJson<T>(path: string, body: unknown): Promise<T> {
  const res = await authFetch(path, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!res.ok) throw new Error(await parseError(res));
  return (await res.json()) as T;
}
async function postJson<T>(path: string, body?: unknown): Promise<T> {
  const res = await authFetch(path, { method: "POST", headers: body ? { "Content-Type": "application/json" } : undefined, body: body ? JSON.stringify(body) : undefined });
  if (!res.ok) throw new Error(await parseError(res));
  return (await res.json()) as T;
}

export const techApi = {
  getDashboard: () => getJson<any>("/api/v1/tech/dashboard"),
  getIncoming: () => getJson<{ rows: any[] }>("/api/v1/tech/incoming"),
  getIncomingById: (id: string) => getJson<{ row: any }>(`/api/v1/tech/incoming/${id}`),
  acceptIncoming: (id: string) => postJson<{ repairId: string | null }>(`/api/v1/tech/incoming/${id}/accept`),
  declineIncoming: (id: string) => postJson<{ ok: boolean }>(`/api/v1/tech/incoming/${id}/decline`),
  getTasks: () => getJson<{ incoming: any[]; repairs: any[] }>("/api/v1/tech/tasks"),
  getCompleted: () => getJson<{ rows: any[] }>("/api/v1/tech/completed"),
  getRepairById: (id: string) => getJson<{ repair: any }>(`/api/v1/tech/repairs/${id}`),
  saveDiagnostics: (id: string, diagnosticsIssues: string[], photoDataUrls?: string[]) =>
    patchJson<{ repair: any }>(`/api/v1/tech/repairs/${id}/diagnostics`, { diagnosticsIssues, photoDataUrls }),
  getParts: () => getJson<{ rows: any[] }>("/api/v1/tech/parts"),
  savePricing: (id: string, laborRub: number, selectedPartIds: string[]) =>
    patchJson<{ repair: any }>(`/api/v1/tech/repairs/${id}/pricing`, { laborRub, selectedPartIds }),
  sendApproval: (id: string) => postJson<{ repair: any }>(`/api/v1/tech/repairs/${id}/send-approval`),
  saveStage: (id: string, stage: string) => patchJson<{ repair: any }>(`/api/v1/tech/repairs/${id}/stage`, { stage }),
  addProgressEntry: (
    id: string,
    payload: {
      stage: "accepted" | "diagnostics" | "waiting_approval" | "repair" | "ready" | "completed";
      kind: "stage" | "substep";
      title: string;
      description?: string;
      photoDataUrls?: string[];
      at?: number;
    }
  ) => postJson<{ repair: any }>(`/api/v1/tech/repairs/${id}/progress`, payload),
  savePartsSelection: (id: string, selectedPartIds: string[]) => patchJson<{ repair: any }>(`/api/v1/tech/repairs/${id}/parts`, { selectedPartIds }),
  saveQuoteOptions: (
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
    }>,
    customParts?: Array<{ id: string; name: string; priceRub: number }>
  ) => patchJson<{ repair: any }>(`/api/v1/tech/repairs/${id}/quote-options`, { options, customParts }),
  postThreadTyping: async (threadId: string): Promise<void> => {
    const res = await authFetch(`/api/v1/tech/threads/${threadId}/typing`, { method: "POST" });
    if (!res.ok && res.status !== 204) throw new Error(await parseError(res));
  },
  getThreads: () => getJson<{ rows: any[] }>("/api/v1/tech/threads"),
  getThreadById: (id: string) => getJson<{ thread: any; messages: any[] }>(`/api/v1/tech/threads/${id}`),
  markThreadRead: (id: string) => authFetch(`/api/v1/tech/threads/${id}/read`, { method: "POST" }),
  sendThreadMessage: (id: string, text: string, attachment?: { name?: string; dataUrl: string }) =>
    postJson<{ message: any }>(`/api/v1/tech/threads/${id}/messages`, { text, attachment }),
  openThreadStream: (
    threadId: string,
    onSnapshot: (payload: { thread: any; messages: any[] }) => void,
    onError?: (e: Event) => void,
    onStatus?: (status: StreamStatus) => void
  ): (() => void) => {
    return openSseStream({
      getUrl: async () => {
        const streamToken = await getStreamToken();
        return `${apiOrigin}/api/v1/tech/threads/${threadId}/stream?streamToken=${encodeURIComponent(streamToken)}`;
      },
      eventHandlers: {
        messages: (raw) => {
          try {
            const payload = JSON.parse(raw) as { thread: any; messages: any[] };
            onSnapshot(payload);
          } catch {
            // noop
          }
        },
      },
      onError,
      onStatus,
    });
  },
  getTemplates: () => getJson<{ rows: string[] }>("/api/v1/tech/templates"),
  getProfile: () => getJson<{ profile: any }>("/api/v1/tech/profile"),
  getSettings: () => getJson<{ settings: any }>("/api/v1/tech/settings"),
  saveSettings: (patch: any) => patchJson<{ settings: any }>("/api/v1/tech/settings", patch),
};

