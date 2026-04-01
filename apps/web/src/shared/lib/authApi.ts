import { apiOrigin } from "@/shared/config/api";
import { clearAuthSession, readAuthSession, saveAuthSession, type AuthSession } from "./authSession";
import { normalizeAuthRequiredMessage, redirectToLoginForAuthMissing, isAuthRequiredMessage } from "./authRedirect";

type ApiUser = {
  id: string;
  role: "client" | "master" | "admin" | "boss";
  name?: string;
  avatarUrl?: string;
  email?: string;
  phone?: string;
};
type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: ApiUser;
};

function toSession(data: AuthResponse): AuthSession {
  return {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    user: data.user,
  };
}

async function parseError(res: Response): Promise<string> {
  const body = (await res.json().catch(() => ({}))) as { error?: string };
  const base = body.error ?? `Ошибка ${res.status}`;
  if (/unexpected socket close|connection closed|socket disconnected|tls|network/i.test(base)) {
    return "Что-то не так с сетью. Если у вас включен VPN, попробуйте отключить его и повторить.";
  }
  if (isAuthRequiredMessage(base)) {
    redirectToLoginForAuthMissing();
    return normalizeAuthRequiredMessage(base);
  }
  if (res.status === 400 && /google|oauth|origin|credential/i.test(base)) {
    return `${base}. Попробуйте открыть сайт в обычном Chrome/Safari (не во встроенном браузере), затем повторите вход.`;
  }
  return base;
}

export async function loginWithGoogleCredential(credential: string): Promise<AuthSession> {
  const res = await fetch(`${apiOrigin}/api/v1/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ credential }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  const data = (await res.json()) as AuthResponse;
  const session = toSession(data);
  saveAuthSession(session);
  return session;
}

export async function sendPhoneCode(phone: string): Promise<void> {
  const res = await fetch(`${apiOrigin}/api/v1/auth/phone/send-code`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone }),
  });
  if (!res.ok) throw new Error(await parseError(res));
}

export async function sendEmailCode(email: string): Promise<void> {
  const res = await fetch(`${apiOrigin}/api/v1/auth/email/send-code`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) throw new Error(await parseError(res));
}

export async function verifyPhoneCode(phone: string, code: string, name?: string): Promise<AuthSession> {
  const res = await fetch(`${apiOrigin}/api/v1/auth/phone/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, code, name: name?.trim() || undefined }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  const data = (await res.json()) as AuthResponse;
  const session = toSession(data);
  saveAuthSession(session);
  return session;
}

export async function verifyEmailCode(email: string, code: string, name?: string): Promise<AuthSession> {
  const res = await fetch(`${apiOrigin}/api/v1/auth/email/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code, name: name?.trim() || undefined }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  const data = (await res.json()) as AuthResponse;
  const session = toSession(data);
  saveAuthSession(session);
  return session;
}

export async function refreshSessionOrNull(): Promise<AuthSession | null> {
  const current = readAuthSession();
  if (!current) return null;
  const res = await fetch(`${apiOrigin}/api/v1/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken: current.refreshToken }),
  });
  if (!res.ok) {
    clearAuthSession();
    return null;
  }
  const data = (await res.json()) as AuthResponse;
  const next = toSession(data);
  saveAuthSession(next);
  return next;
}

export async function getMe(): Promise<ApiUser> {
  let session = readAuthSession();
  if (!session) {
    redirectToLoginForAuthMissing();
    throw new Error("Нужна авторизация");
  }

  let res = await fetch(`${apiOrigin}/api/v1/auth/me`, {
    headers: { Authorization: `Bearer ${session.accessToken}` },
  });
  if (res.status === 401) {
    session = await refreshSessionOrNull();
    if (!session) throw new Error("Сессия истекла");
    res = await fetch(`${apiOrigin}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${session.accessToken}` },
    });
  }
  if (!res.ok) throw new Error(await parseError(res));
  const body = (await res.json()) as { user: ApiUser };
  const merged: AuthSession = { ...session, user: body.user };
  saveAuthSession(merged);
  return body.user;
}

export async function updateMe(name: string, avatarUrl?: string, phone?: string): Promise<ApiUser> {
  let session = readAuthSession();
  if (!session) {
    redirectToLoginForAuthMissing();
    throw new Error("Нужна авторизация");
  }
  let res = await fetch(`${apiOrigin}/api/v1/auth/me`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.accessToken}`,
    },
    body: JSON.stringify({ name, phone: phone?.trim() || undefined, avatarUrl: avatarUrl?.trim() || undefined }),
  });
  if (res.status === 401) {
    session = await refreshSessionOrNull();
    if (!session) throw new Error("Сессия истекла");
    res = await fetch(`${apiOrigin}/api/v1/auth/me`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.accessToken}`,
      },
      body: JSON.stringify({ name, phone: phone?.trim() || undefined, avatarUrl: avatarUrl?.trim() || undefined }),
    });
  }
  if (!res.ok) throw new Error(await parseError(res));
  const body = (await res.json()) as { user: ApiUser };
  saveAuthSession({ ...session, user: body.user });
  return body.user;
}

export async function logoutCurrentSession(): Promise<void> {
  const session = readAuthSession();
  if (!session) return;
  try {
    await fetch(`${apiOrigin}/api/v1/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: session.refreshToken }),
    });
  } finally {
    clearAuthSession();
  }
}

export async function getStreamToken(): Promise<string> {
  let session = readAuthSession();
  if (!session) {
    redirectToLoginForAuthMissing();
    throw new Error("Нужна авторизация");
  }
  let res = await fetch(`${apiOrigin}/api/v1/auth/stream-token`, {
    method: "POST",
    headers: { Authorization: `Bearer ${session.accessToken}` },
  });
  if (res.status === 401) {
    session = await refreshSessionOrNull();
    if (!session) throw new Error("Сессия истекла");
    res = await fetch(`${apiOrigin}/api/v1/auth/stream-token`, {
      method: "POST",
      headers: { Authorization: `Bearer ${session.accessToken}` },
    });
  }
  if (!res.ok) throw new Error(await parseError(res));
  const body = (await res.json()) as { streamToken: string };
  return body.streamToken;
}
