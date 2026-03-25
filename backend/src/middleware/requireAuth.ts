import type { RequestHandler } from "express";
import { verifyAccessToken } from "../services/jwt.js";

export const requireAuth: RequestHandler = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Требуется авторизация" });
    return;
  }
  const token = header.slice("Bearer ".length).trim();
  if (!token) {
    res.status(401).json({ error: "Требуется авторизация" });
    return;
  }
  try {
    const payload = verifyAccessToken(token);
    req.auth = { userId: payload.sub, role: payload.role, phone: payload.phone, email: payload.email };
    next();
  } catch {
    res.status(401).json({ error: "Недействительный или просроченный токен" });
  }
};
