import crypto from "node:crypto";
import { config } from "../config.js";
import { withStore, type UserRow } from "../store.js";

export type { UserRow };

export async function findUserByPhone(phone: string): Promise<UserRow | undefined> {
  return withStore((s) => {
    const id = s.userIdByPhone[phone];
    if (!id) return undefined;
    return s.usersById[id];
  });
}

export async function findUserById(id: string): Promise<UserRow | undefined> {
  return withStore((s) => s.usersById[id]);
}

export async function getOrCreateUserByPhone(phone: string): Promise<UserRow> {
  return withStore((s) => {
    const existingId = s.userIdByPhone[phone];
    if (existingId) {
      const u = s.usersById[existingId];
      if (u) return u;
    }
    const id = crypto.randomUUID();
    const createdAt = Date.now();
    const row: UserRow = { id, role: "client", phone, name: "Пользователь", created_at: createdAt };
    s.usersById[id] = row;
    s.userIdByPhone[phone] = id;
    return row;
  });
}

export async function getOrCreateUserByGoogle(
  googleSub: string,
  email: string,
  name?: string,
  avatarUrl?: string
): Promise<UserRow> {
  return withStore((s) => {
    const existingId = s.userIdByGoogleSub[googleSub];
    if (existingId) {
      const u = s.usersById[existingId];
      if (u) {
        if (u.email !== email) u.email = email;
        if (config.bossEmails.includes(email.toLowerCase())) u.role = "boss";
        if (!u.name && name) u.name = name;
        if (!u.avatar_url && avatarUrl) u.avatar_url = avatarUrl;
        return u;
      }
    }
    const id = crypto.randomUUID();
    const createdAt = Date.now();
    const role: UserRow["role"] = config.bossEmails.includes(email.toLowerCase()) ? "boss" : "client";
    const row: UserRow = {
      id,
      role,
      google_sub: googleSub,
      email,
      name: name ?? "Пользователь",
      avatar_url: avatarUrl,
      created_at: createdAt,
    };
    s.usersById[id] = row;
    s.userIdByGoogleSub[googleSub] = id;
    return row;
  });
}

export async function updateUserProfile(
  id: string,
  patch: { name?: string; avatarUrl?: string }
): Promise<UserRow | undefined> {
  return withStore((s) => {
    const user = s.usersById[id];
    if (!user) return undefined;
    if (patch.name !== undefined) {
      user.name = patch.name;
    }
    if (patch.avatarUrl !== undefined) {
      user.avatar_url = patch.avatarUrl;
    }
    return user;
  });
}

export async function listUsers(): Promise<UserRow[]> {
  return withStore((s) => Object.values(s.usersById).sort((a, b) => b.created_at - a.created_at));
}

export async function setUserRole(id: string, role: UserRow["role"]): Promise<UserRow | undefined> {
  return withStore((s) => {
    const user = s.usersById[id];
    if (!user) return undefined;
    user.role = role;
    return user;
  });
}
