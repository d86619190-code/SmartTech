import crypto from "node:crypto";
import { config } from "../config.js";
import { withStore } from "../store.js";
import { randomToken, sha256Hex } from "./crypto.js";

function hashRefresh(raw: string): string {
  return sha256Hex(raw);
}

export async function issueRefreshToken(userId: string): Promise<{ token: string; expiresAt: number }> {
  return withStore((s) => {
    const raw = randomToken(48);
    const tokenHash = hashRefresh(raw);
    const id = crypto.randomUUID();
    const now = Date.now();
    const expiresAt = now + config.refreshTtlDays * 24 * 60 * 60 * 1000;

    s.refreshById[id] = {
      user_id: userId,
      token_hash: tokenHash,
      expires_at: expiresAt,
      created_at: now,
    };

    return { token: `${id}.${raw}`, expiresAt };
  });
}

export async function rotateRefreshToken(
  oldRawToken: string
): Promise<{ userId: string; token: string; expiresAt: number } | null> {
  const parsed = parseRefreshToken(oldRawToken);
  if (!parsed) return null;

  return withStore((s) => {
    const row = s.refreshById[parsed.id];
    if (!row) return null;
    if (Date.now() > row.expires_at) {
      delete s.refreshById[parsed.id];
      return null;
    }
    if (row.token_hash !== hashRefresh(parsed.secret)) return null;

    delete s.refreshById[parsed.id];

    const raw = randomToken(48);
    const tokenHash = hashRefresh(raw);
    const id = crypto.randomUUID();
    const now = Date.now();
    const expiresAt = now + config.refreshTtlDays * 24 * 60 * 60 * 1000;

    s.refreshById[id] = {
      user_id: row.user_id,
      token_hash: tokenHash,
      expires_at: expiresAt,
      created_at: now,
    };

    return { userId: row.user_id, token: `${id}.${raw}`, expiresAt };
  });
}

export async function revokeRefreshToken(rawToken: string): Promise<void> {
  const parsed = parseRefreshToken(rawToken);
  if (!parsed) return;
  await withStore((s) => {
    delete s.refreshById[parsed.id];
  });
}

function parseRefreshToken(raw: string): { id: string; secret: string } | null {
  const i = raw.indexOf(".");
  if (i <= 0) return null;
  const id = raw.slice(0, i);
  const secret = raw.slice(i + 1);
  if (!id || !secret) return null;
  return { id, secret };
}
