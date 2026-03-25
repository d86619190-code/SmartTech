import { apiOrigin } from "@/shared/config/api";
import { readAuthSession } from "./authSession";
import { refreshSessionOrNull } from "./authApi";

export type Role = "client" | "master" | "admin" | "boss";
export type AdminUserItem = {
  id: string;
  role: Role;
  name?: string;
  email?: string;
  phone?: string;
  createdAt: number;
};

async function parseError(res: Response): Promise<string> {
  const body = (await res.json().catch(() => ({}))) as { error?: string };
  return body.error ?? `Ошибка ${res.status}`;
}

async function authFetch(path: string, init?: RequestInit): Promise<Response> {
  let session = readAuthSession();
  if (!session) throw new Error("Требуется авторизация");
  let res = await fetch(`${apiOrigin}${path}`, {
    ...init,
    headers: { ...(init?.headers ?? {}), Authorization: `Bearer ${session.accessToken}` },
  });
  if (res.status !== 401) return res;
  session = await refreshSessionOrNull();
  if (!session) throw new Error("Сессия истекла");
  res = await fetch(`${apiOrigin}${path}`, {
    ...init,
    headers: { ...(init?.headers ?? {}), Authorization: `Bearer ${session.accessToken}` },
  });
  return res;
}

export async function listAdminUsersApi(): Promise<AdminUserItem[]> {
  const res = await authFetch("/api/v1/admin/users");
  if (!res.ok) throw new Error(await parseError(res));
  const body = (await res.json()) as { users: AdminUserItem[] };
  return body.users;
}

export async function setAdminUserRoleApi(userId: string, role: Role): Promise<AdminUserItem> {
  const res = await authFetch(`/api/v1/admin/users/${userId}/role`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  const body = (await res.json()) as { user: AdminUserItem };
  return body.user;
}

