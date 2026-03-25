import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";
import {
  getAdminAnalytics,
  getAdminCategories,
  getAdminDashboard,
  getAdminLogs,
  getAdminOrderById,
  getAdminOrders,
  getAdminPricing,
  getAdminSettings,
  getAdminTechnicianById,
  getAdminTechnicians,
  getAdminUserById,
  getAdminUsersMock,
  updateAdminAvgRevenueSeries,
  updateAdminCategories,
  updateAdminKpi,
  updateAdminPricing,
  updateAdminSettings,
} from "../services/adminMock.js";
import { findUserById, listUsers, setUserRole } from "../services/user.js";
import type { UserRow } from "../store.js";

const patchRoleBody = z.object({
  role: z.enum(["client", "master", "admin", "boss"]),
});
const pricingBody = z.object({
  rows: z.array(
    z.object({
      id: z.string(),
      category: z.string(),
      deviceGroup: z.string(),
      service: z.string(),
      laborRub: z.number(),
      partsFromRub: z.number(),
    })
  ),
});
const categoriesBody = z.object({
  rows: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      children: z.array(z.object({ id: z.string(), name: z.string() })),
    })
  ),
});
const settingsBody = z
  .object({
    defaultAdminRole: z.string().optional(),
    notifyEmail: z.boolean().optional(),
    notifyPush: z.boolean().optional(),
    legalName: z.string().optional(),
    inn: z.string().optional(),
    supportPhone: z.string().optional(),
    supportEmail: z.string().optional(),
  })
  .strict();

const avgRevenueBody = z.object({
  series: z.array(z.object({ label: z.string(), value: z.number() })),
});

const kpiPatchBody = z
  .object({
    revenueRub: z.number().optional(),
    activeRepairs: z.number().optional(),
    completedMonth: z.number().optional(),
    avgCheckRub: z.number().optional(),
    pendingApprovals: z.number().optional(),
  })
  .strict();

function userPublic(user: UserRow) {
  return {
    id: user.id,
    createdAt: user.created_at,
    role: user.role,
    ...(user.name ? { name: user.name } : {}),
    ...(user.avatar_url ? { avatarUrl: user.avatar_url } : {}),
    ...(user.phone ? { phone: user.phone } : {}),
    ...(user.email ? { email: user.email } : {}),
  };
}

function canChangeRole(actor: UserRow, target: UserRow, nextRole: UserRow["role"]): boolean {
  if (target.role === "boss" && actor.id !== target.id) return false;
  if (actor.role === "boss") return true;
  if (actor.role !== "admin") return false;
  if (target.role === "boss") return false;
  if (target.role === "admin" && nextRole !== "admin") return false;
  if (nextRole === "boss") return false;
  return true;
}

export const adminRouter = Router();
adminRouter.use(requireAuth, requireRole("admin", "boss"));

adminRouter.get("/dashboard", async (_req, res) => {
  const data = await getAdminDashboard();
  res.status(200).json(data);
});

adminRouter.get("/orders", async (_req, res) => {
  const orders = await getAdminOrders();
  res.status(200).json({ orders });
});

adminRouter.get("/orders/:orderId", async (req, res) => {
  const order = await getAdminOrderById(req.params.orderId);
  if (!order) {
    res.status(404).json({ error: "Заказ не найден" });
    return;
  }
  res.status(200).json({ order });
});

adminRouter.get("/mock-users", async (_req, res) => {
  const users = await getAdminUsersMock();
  res.status(200).json({ users });
});

adminRouter.get("/mock-users/:userId", async (req, res) => {
  const user = await getAdminUserById(req.params.userId);
  if (!user) {
    res.status(404).json({ error: "Пользователь не найден" });
    return;
  }
  res.status(200).json({ user });
});

adminRouter.get("/technicians", async (_req, res) => {
  const technicians = await getAdminTechnicians();
  res.status(200).json({ technicians });
});

adminRouter.get("/technicians/:techId", async (req, res) => {
  const technician = await getAdminTechnicianById(req.params.techId);
  if (!technician) {
    res.status(404).json({ error: "Мастер не найден" });
    return;
  }
  res.status(200).json({ technician });
});

adminRouter.get("/pricing", async (_req, res) => {
  const rows = await getAdminPricing();
  res.status(200).json({ rows });
});

adminRouter.patch("/pricing", async (req, res) => {
  const parsed = pricingBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Некорректные данные", details: parsed.error.flatten() });
    return;
  }
  const rows = await updateAdminPricing(parsed.data.rows);
  res.status(200).json({ rows });
});

adminRouter.get("/categories", async (_req, res) => {
  const rows = await getAdminCategories();
  res.status(200).json({ rows });
});

adminRouter.patch("/categories", async (req, res) => {
  const parsed = categoriesBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Некорректные данные", details: parsed.error.flatten() });
    return;
  }
  const rows = await updateAdminCategories(parsed.data.rows);
  res.status(200).json({ rows });
});

adminRouter.get("/analytics", async (_req, res) => {
  const data = await getAdminAnalytics();
  res.status(200).json(data);
});

adminRouter.patch("/analytics/avg-revenue", async (req, res) => {
  const parsed = avgRevenueBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Некорректные данные", details: parsed.error.flatten() });
    return;
  }
  const avgRevenueSeries = await updateAdminAvgRevenueSeries(parsed.data.series);
  res.status(200).json({ avgRevenueSeries });
});

adminRouter.patch("/kpi", async (req, res) => {
  const parsed = kpiPatchBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Некорректные данные", details: parsed.error.flatten() });
    return;
  }
  const kpi = await updateAdminKpi(parsed.data);
  res.status(200).json({ kpi });
});

adminRouter.get("/logs", async (_req, res) => {
  const logs = await getAdminLogs();
  res.status(200).json({ logs });
});

adminRouter.get("/settings", async (_req, res) => {
  const settings = await getAdminSettings();
  res.status(200).json({ settings });
});

adminRouter.patch("/settings", async (req, res) => {
  const parsed = settingsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Некорректные данные", details: parsed.error.flatten() });
    return;
  }
  const settings = await updateAdminSettings(parsed.data);
  res.status(200).json({ settings });
});

adminRouter.get("/users", async (_req, res) => {
  const users = await listUsers();
  res.status(200).json({ users: users.map(userPublic) });
});

adminRouter.patch("/users/:userId/role", async (req, res) => {
  const actorId = req.auth?.userId;
  if (!actorId) {
    res.status(401).json({ error: "Требуется авторизация" });
    return;
  }
  const parsed = patchRoleBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Некорректные данные", details: parsed.error.flatten() });
    return;
  }
  const actor = await findUserById(actorId);
  const target = await findUserById(req.params.userId);
  if (!actor || !target) {
    res.status(404).json({ error: "Пользователь не найден" });
    return;
  }
  if (!canChangeRole(actor, target, parsed.data.role)) {
    res.status(403).json({ error: "Недостаточно прав для изменения этой роли" });
    return;
  }
  const updated = await setUserRole(target.id, parsed.data.role);
  if (!updated) {
    res.status(404).json({ error: "Пользователь не найден" });
    return;
  }
  res.status(200).json({ user: userPublic(updated) });
});

