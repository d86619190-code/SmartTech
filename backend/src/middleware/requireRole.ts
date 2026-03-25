import type { RequestHandler } from "express";

type UserRole = "client" | "master" | "admin" | "boss";

export function requireRole(...allowed: UserRole[]): RequestHandler {
  return (req, res, next) => {
    const role = req.auth?.role;
    if (!role || !allowed.includes(role)) {
      res.status(403).json({ error: "Недостаточно прав" });
      return;
    }
    next();
  };
}

