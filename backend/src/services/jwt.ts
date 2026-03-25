import jwt from "jsonwebtoken";
import { config } from "../config.js";

export type AccessPayload = { sub: string; role: "client" | "master" | "admin" | "boss"; phone?: string; email?: string };
export type StreamPayload = { sub: string; role: "client" | "master" | "admin" | "boss"; kind: "sse" };

export function signAccessToken(payload: AccessPayload): string {
  const body: Record<string, unknown> = { sub: payload.sub, role: payload.role };
  if (payload.phone) body.phone = payload.phone;
  if (payload.email) body.email = payload.email;
  return jwt.sign(body, config.jwtSecret, { expiresIn: config.jwtAccessTtlSec, algorithm: "HS256" });
}

export function verifyAccessToken(token: string): AccessPayload {
  const decoded = jwt.verify(token, config.jwtSecret, { algorithms: ["HS256"] });
  if (typeof decoded !== "object" || decoded === null) throw new Error("Invalid token");
  const sub = (decoded as { sub?: unknown }).sub;
  if (typeof sub !== "string") throw new Error("Invalid token payload");
  const role = (decoded as { role?: unknown }).role;
  if (role !== "client" && role !== "master" && role !== "admin" && role !== "boss") {
    throw new Error("Invalid token payload");
  }
  const phone = (decoded as { phone?: unknown }).phone;
  const email = (decoded as { email?: unknown }).email;
  return {
    sub,
    role,
    phone: typeof phone === "string" ? phone : undefined,
    email: typeof email === "string" ? email : undefined,
  };
}

export function signStreamToken(payload: StreamPayload): string {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: 120, algorithm: "HS256" });
}

export function verifyStreamToken(token: string): StreamPayload {
  const decoded = jwt.verify(token, config.jwtSecret, { algorithms: ["HS256"] });
  if (typeof decoded !== "object" || decoded === null) throw new Error("Invalid token");
  const sub = (decoded as { sub?: unknown }).sub;
  const role = (decoded as { role?: unknown }).role;
  const kind = (decoded as { kind?: unknown }).kind;
  if (typeof sub !== "string") throw new Error("Invalid token payload");
  if (role !== "client" && role !== "master" && role !== "admin" && role !== "boss") throw new Error("Invalid token payload");
  if (kind !== "sse") throw new Error("Invalid token payload");
  return { sub, role, kind };
}
