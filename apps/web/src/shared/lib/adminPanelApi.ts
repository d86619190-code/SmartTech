import { apiOrigin } from "@/shared/config/api";
import { readAuthSession } from "./authSession";
import { refreshSessionOrNull } from "./authApi";
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
  let res = await fetch(`${apiOrigin}${path}`, {
    ...init,
    headers: { ...(init?.headers ?? {}), Authorization: `Bearer ${session.accessToken}` },
  });
  if (res.status !== 401) return res;
  session = await refreshSessionOrNull();
  if (!session) throw new Error("Session expired");
  res = await fetch(`${apiOrigin}${path}`, {
    ...init,
    headers: { ...(init?.headers ?? {}), Authorization: `Bearer ${session.accessToken}` },
  });
  return res;
}

export async function getAdminDashboardApi() {
  const res = await authFetch("/api/v1/admin/dashboard");
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
  
}

export async function getAdminOrdersApi() {
  const res = await authFetch("/api/v1/admin/orders");
  if (!res.ok) throw new Error(await parseError(res));
  return (await res.json()) as { orders: any[] };
}

export async function getAdminOrderByIdApi(id: string) {
  const res = await authFetch(`/api/v1/admin/orders/${id}`);
  if (!res.ok) throw new Error(await parseError(res));
  return (await res.json()) as { order: any };
}

export async function getAdminMockUsersApi() {
  const res = await authFetch("/api/v1/admin/mock-users");
  if (!res.ok) throw new Error(await parseError(res));
  return (await res.json()) as { users: any[] };
}

export async function getAdminMockUserByIdApi(id: string) {
  const res = await authFetch(`/api/v1/admin/mock-users/${id}`);
  if (!res.ok) throw new Error(await parseError(res));
  return (await res.json()) as { user: any };
}

export async function getAdminTechniciansApi() {
  const res = await authFetch("/api/v1/admin/technicians");
  if (!res.ok) throw new Error(await parseError(res));
  return (await res.json()) as { technicians: any[] };
}

export async function getAdminTechnicianByIdApi(id: string) {
  const res = await authFetch(`/api/v1/admin/technicians/${id}`);
  if (!res.ok) throw new Error(await parseError(res));
  return (await res.json()) as { technician: any };
}

export async function getAdminPricingApi() {
  const res = await authFetch("/api/v1/admin/pricing");
  if (!res.ok) throw new Error(await parseError(res));
  return (await res.json()) as { rows: any[] };
}

export async function updateAdminPricingApi(rows: any[]) {
  const res = await authFetch("/api/v1/admin/pricing", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rows }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return (await res.json()) as { rows: any[] };
}

export async function getAdminCategoriesApi() {
  const res = await authFetch("/api/v1/admin/categories");
  if (!res.ok) throw new Error(await parseError(res));
  return (await res.json()) as { rows: any[] };
}

export async function updateAdminCategoriesApi(rows: any[]) {
  const res = await authFetch("/api/v1/admin/categories", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rows }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return (await res.json()) as { rows: any[] };
}

export async function getAdminAnalyticsApi() {
  const res = await authFetch("/api/v1/admin/analytics");
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function patchAdminAvgRevenueSeriesApi(series: { label: string; value: number }[]) {
  const res = await authFetch("/api/v1/admin/analytics/avg-revenue", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ series }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return (await res.json()) as { avgRevenueSeries: { label: string; value: number }[] };
}

export async function patchAdminKpiApi(patch: {
  revenueRub?: number;
  activeRepairs?: number;
  completedMonth?: number;
  avgCheckRub?: number;
  pendingApprovals?: number;
}) {
  const res = await authFetch("/api/v1/admin/kpi", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return (await res.json()) as { kpi: Record<string, number> };
}

export async function getAdminLogsApi() {
  const res = await authFetch("/api/v1/admin/logs");
  if (!res.ok) throw new Error(await parseError(res));
  return (await res.json()) as { logs: any[] };
}

export async function getAdminSettingsApi() {
  const res = await authFetch("/api/v1/admin/settings");
  if (!res.ok) throw new Error(await parseError(res));
  return (await res.json()) as { settings: any };
}

export async function updateAdminSettingsApi(patch: any) {
  const res = await authFetch("/api/v1/admin/settings", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return (await res.json()) as { settings: any };
}

