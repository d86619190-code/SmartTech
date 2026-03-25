import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/requireAuth.js";
import { verifyStreamToken } from "../services/jwt.js";
import { getClientOrderMeta, listClientRepairs } from "../services/clientRepairs.js";
import {
  getInboxSummary,
  getOrderMessages,
  markThreadRead,
  resolveApproval,
  sendUserMessage,
} from "../services/inbox.js";
import { createTechIncomingFromClient } from "../services/techMock.js";

const sendMessageBody = z
  .object({
    text: z.string().max(1000).default(""),
    attachment: z
      .object({
        name: z.string().max(200).optional(),
        dataUrl: z.string().max(3_500_000),
      })
      .optional(),
  })
  .refine((d) => d.text.trim().length > 0 || Boolean(d.attachment), {
    message: "Укажите текст или вложение",
  });

const resolveApprovalBody = z.object({
  decision: z.enum(["approved", "declined"]),
  optionId: z.string().min(1).max(100).optional(),
});
const createOrderBody = z.object({
  deviceType: z.enum(["phone", "tablet", "laptop"]),
  device: z.string().trim().min(2).max(100),
  issue: z.string().trim().min(5).max(2000),
  contactPhone: z.string().trim().min(3).max(40),
  photoDataUrls: z.array(z.string().max(6_000_000)).max(5).default([]),
  needsConsultation: z.boolean().optional(),
  bringInPerson: z.boolean().optional(),
});

export const clientRouter = Router();

clientRouter.get("/inbox/stream", async (req, res) => {
  const streamToken = String(req.query.streamToken ?? "");
  if (!streamToken) {
    res.status(401).json({ error: "Требуется токен" });
    return;
  }
  let userId: string;
  try {
    const payload = verifyStreamToken(streamToken);
    userId = payload.sub;
  } catch {
    res.status(401).json({ error: "Недействительный токен" });
    return;
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  let lastSig = "";
  const pushSnapshot = async () => {
    const summary = await getInboxSummary(userId);
    const sig = `${summary.badgeCount}|${summary.approvals.length}|${summary.threads[0]?.lastAt ?? 0}|${summary.threads[0]?.unreadCount ?? 0}`;
    if (sig === lastSig) return;
    lastSig = sig;
    res.write(`event: summary\n`);
    res.write(`data: ${JSON.stringify(summary)}\n\n`);
  };
  void pushSnapshot();
  const timer = setInterval(() => {
    void pushSnapshot();
  }, 2000);
  const ping = setInterval(() => {
    res.write(`event: ping\ndata: {}\n\n`);
  }, 15000);
  req.on("close", () => {
    clearInterval(timer);
    clearInterval(ping);
    res.end();
  });
});

clientRouter.get("/messages/:orderId/stream", async (req, res) => {
  const streamToken = String(req.query.streamToken ?? "");
  if (!streamToken) {
    res.status(401).json({ error: "Требуется токен" });
    return;
  }
  let userId: string;
  try {
    const payload = verifyStreamToken(streamToken);
    userId = payload.sub;
  } catch {
    res.status(401).json({ error: "Недействительный токен" });
    return;
  }
  const orderId = req.params.orderId;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  let lastSig = "";
  const pushSnapshot = async () => {
    const messages = await getOrderMessages(userId, orderId);
    const sig = `${messages.length}|${messages[messages.length - 1]?.id ?? "none"}|${messages.filter((m) => m.from === "user" && !m.readByService).length}`;
    if (sig === lastSig) return;
    lastSig = sig;
    res.write(`event: messages\n`);
    res.write(`data: ${JSON.stringify({ orderId, messages })}\n\n`);
  };
  void pushSnapshot();
  const timer = setInterval(() => {
    void pushSnapshot();
  }, 2000);
  const ping = setInterval(() => {
    res.write(`event: ping\ndata: {}\n\n`);
  }, 15000);
  req.on("close", () => {
    clearInterval(timer);
    clearInterval(ping);
    res.end();
  });
});

clientRouter.use(requireAuth);

clientRouter.get("/repairs", async (req, res) => {
  const userId = req.auth?.userId;
  if (!userId) {
    res.status(401).json({ error: "Требуется авторизация" });
    return;
  }
  const repairs = await listClientRepairs(userId);
  res.status(200).json({ repairs });
});

clientRouter.get("/orders/:orderId", async (req, res) => {
  const userId = req.auth?.userId;
  if (!userId) {
    res.status(401).json({ error: "Требуется авторизация" });
    return;
  }
  const order = await getClientOrderMeta(userId, req.params.orderId);
  if (!order) {
    res.status(404).json({ error: "Заказ не найден" });
    return;
  }
  res.status(200).json({ order });
});

clientRouter.post("/orders", async (req, res) => {
  const userId = req.auth?.userId;
  if (!userId) {
    res.status(401).json({ error: "Требуется авторизация" });
    return;
  }
  const parsed = createOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Некорректные данные", details: parsed.error.flatten() });
    return;
  }
  const incoming = await createTechIncomingFromClient(userId, parsed.data);
  res.status(201).json({ incoming });
});

clientRouter.get("/inbox", async (req, res) => {
  const userId = req.auth?.userId;
  if (!userId) {
    res.status(401).json({ error: "Требуется авторизация" });
    return;
  }
  const summary = await getInboxSummary(userId);
  res.status(200).json(summary);
});

clientRouter.get("/messages/:orderId", async (req, res) => {
  const userId = req.auth?.userId;
  if (!userId) {
    res.status(401).json({ error: "Требуется авторизация" });
    return;
  }
  const { orderId } = req.params;
  const messages = await getOrderMessages(userId, orderId);
  res.status(200).json({ orderId, messages });
});

clientRouter.post("/messages/:orderId/read", async (req, res) => {
  const userId = req.auth?.userId;
  if (!userId) {
    res.status(401).json({ error: "Требуется авторизация" });
    return;
  }
  const { orderId } = req.params;
  await markThreadRead(userId, orderId);
  res.status(204).send();
});

clientRouter.post("/messages/:orderId", async (req, res) => {
  const userId = req.auth?.userId;
  if (!userId) {
    res.status(401).json({ error: "Требуется авторизация" });
    return;
  }
  const parsed = sendMessageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Некорректные данные", details: parsed.error.flatten() });
    return;
  }
  const { orderId } = req.params;
  const message = await sendUserMessage(userId, orderId, parsed.data.text, parsed.data.attachment);
  res.status(201).json({ message });
});

clientRouter.post("/approvals/:approvalId/resolve", async (req, res) => {
  const userId = req.auth?.userId;
  if (!userId) {
    res.status(401).json({ error: "Требуется авторизация" });
    return;
  }
  const parsed = resolveApprovalBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Некорректные данные", details: parsed.error.flatten() });
    return;
  }
  const ok = await resolveApproval(userId, req.params.approvalId, parsed.data.decision, parsed.data.optionId);
  if (!ok) {
    res.status(404).json({ error: "Согласование не найдено" });
    return;
  }
  res.status(200).json({ ok: true });
});

