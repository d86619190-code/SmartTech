export type SessionUser = {
  id: string;
  role: "client" | "master" | "admin" | "boss";
  name?: string;
  avatarUrl?: string;
  email?: string;
  phone?: string;
};

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  user: SessionUser;
};

const SESSION_KEY = "auth.session.v1";

export function saveAuthSession(session: AuthSession): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function readAuthSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as Partial<AuthSession>;
    if (!data?.accessToken || !data?.refreshToken || !data?.user?.id || !data?.user?.role) return null;
    return {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      user: {
        id: data.user.id,
        role: data.user.role,
        name: data.user.name,
        avatarUrl: data.user.avatarUrl,
        email: data.user.email,
        phone: data.user.phone,
      },
    };
  } catch {
    return null;
  }
}

export function clearAuthSession(): void {
  localStorage.removeItem(SESSION_KEY);
}
