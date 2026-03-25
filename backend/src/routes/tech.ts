import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";
import { verifyStreamToken } from "../services/jwt.js";
import {
  acceptIncoming,
  declineIncoming,
  getTechDashboard,
  getTechIncomingById,
  getTechPartsCatalog,
  getTechProfile,
  getTechRepairById,
  getTechSettings,
  getTechTemplates,
  getTechThreadById,
  listTechCompleted,
  listTechIncoming,
  listTechTasks,
  listTechThreadMessages,
  listTechThreads,
  markTechThreadRead,
  recordMasterTyping,
  saveTechDiagnostics,
  saveTechPartsSelection,
  saveTechPricing,
  saveTechQuoteOptions,
  saveTechSettings,
  saveTechStage,
  sendTechApproval,
  sendTechThreadMessage,
} from "../services/techMock.js";

const diagnosticsBody = z.object({
  diagnosticsIssues: z.array(z.string()),
  photoDataUrls: z.array(z.string().max(4_000_000)).max(12).optional(),
});
const pricingBody = z.object({ laborRub: z.number(), selectedPartIds: z.array(z.string()) });
const stageBody = z.object({ stage: z.enum(["accepted", "diagnostics", "waiting_approval", "repair", "ready", "completed"]) });
const partsBody = z.object({ selectedPartIds: z.array(z.string()) });
const quoteOptionsBody = z.object({
  options: z
    .array(
      z.object({
        id: z.string(),
        title: z.string().max(120),
        laborRub: z.number().min(0),
        selectedPartIds: z.array(z.string()),
        availability: z.enum(["in_stock", "on_order"]),
        orderLeadDays: z.number().min(0).max(30).optional(),
        isOriginal: z.boolean(),
        repairDaysLabel: z.string().max(40).optional(),
      })
    )
    .max(6),
  customParts: z
    .array(
      z.object({
        id: z.string(),
        name: z.string().max(200),
        priceRub: z.number().min(0),
      })
    )
    .max(24)
    .optional(),
});
const messageBody = z
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
    message: "Нужен текст или вложение",
  });
const settingsBody = z
  .object({
    available: z.boolean().optional(),
    notifyEmail: z.boolean().optional(),
    notifyPush: z.boolean().optional(),
    workFrom: z.string().optional(),
    workTo: z.string().optional(),
    phone: z.string().optional(),
    specialty: z.string().optional(),
  })
  .strict();

export const techRouter = Router();
techRouter.use(requireAuth, requireRole("master", "admin", "boss"));

techRouter.get("/dashboard", async (_req, res) => res.status(200).json(await getTechDashboard()));
techRouter.get("/incoming", async (_req, res) => res.status(200).json({ rows: await listTechIncoming() }));
techRouter.get("/incoming/:requestId", async (req, res) => {
  const row = await getTechIncomingById(req.params.requestId);
  if (!row) return res.status(404).json({ error: "Заявка не найдена" });
  return res.status(200).json({ row });
});
techRouter.post("/incoming/:requestId/accept", async (req, res) => {
  const repairId = await acceptIncoming(req.params.requestId);
  if (!repairId) return res.status(404).json({ error: "Заявка не найдена" });
  return res.status(200).json({ repairId });
});
techRouter.post("/incoming/:requestId/decline", async (req, res) => {
  const ok = await declineIncoming(req.params.requestId);
  if (!ok) return res.status(404).json({ error: "Заявка не найдена" });
  return res.status(200).json({ ok: true });
});

techRouter.get("/tasks", async (_req, res) => res.status(200).json(await listTechTasks()));
techRouter.get("/completed", async (_req, res) => res.status(200).json({ rows: await listTechCompleted() }));
techRouter.get("/repairs/:repairId", async (req, res) => {
  const repair = await getTechRepairById(req.params.repairId);
  if (!repair) return res.status(404).json({ error: "Ремонт не найден" });
  return res.status(200).json({ repair });
});
techRouter.patch("/repairs/:repairId/diagnostics", async (req, res) => {
  const parsed = diagnosticsBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Некорректные данные", details: parsed.error.flatten() });
  const repair = await saveTechDiagnostics(req.params.repairId, parsed.data.diagnosticsIssues, parsed.data.photoDataUrls);
  if (!repair) return res.status(404).json({ error: "Ремонт не найден" });
  return res.status(200).json({ repair });
});
techRouter.patch("/repairs/:repairId/pricing", async (req, res) => {
  const parsed = pricingBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Некорректные данные", details: parsed.error.flatten() });
  const repair = await saveTechPricing(req.params.repairId, parsed.data.laborRub, parsed.data.selectedPartIds);
  if (!repair) return res.status(404).json({ error: "Ремонт не найден" });
  return res.status(200).json({ repair });
});
techRouter.post("/repairs/:repairId/send-approval", async (req, res) => {
  const repair = await sendTechApproval(req.params.repairId);
  if (!repair) return res.status(404).json({ error: "Ремонт не найден" });
  return res.status(200).json({ repair });
});
techRouter.patch("/repairs/:repairId/stage", async (req, res) => {
  const parsed = stageBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Некорректные данные", details: parsed.error.flatten() });
  const repair = await saveTechStage(req.params.repairId, parsed.data.stage);
  if (!repair) return res.status(404).json({ error: "Ремонт не найден" });
  return res.status(200).json({ repair });
});
techRouter.patch("/repairs/:repairId/parts", async (req, res) => {
  const parsed = partsBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Некорректные данные", details: parsed.error.flatten() });
  const repair = await saveTechPartsSelection(req.params.repairId, parsed.data.selectedPartIds);
  if (!repair) return res.status(404).json({ error: "Ремонт не найден" });
  return res.status(200).json({ repair });
});
techRouter.patch("/repairs/:repairId/quote-options", async (req, res) => {
  const parsed = quoteOptionsBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Некорректные данные", details: parsed.error.flatten() });
  const repair = await saveTechQuoteOptions(req.params.repairId, parsed.data.options, parsed.data.customParts);
  if (!repair) return res.status(404).json({ error: "Ремонт не найден" });
  return res.status(200).json({ repair });
});
techRouter.get("/parts", async (_req, res) => res.status(200).json({ rows: await getTechPartsCatalog() }));

techRouter.post("/threads/:threadId/typing", async (req, res) => {
  const ok = await recordMasterTyping(req.params.threadId);
  if (!ok) return res.status(404).json({ error: "Диалог не найден" });
  return res.status(204).send();
});

techRouter.get("/threads", async (_req, res) => res.status(200).json({ rows: await listTechThreads() }));
techRouter.get("/threads/:threadId", async (req, res) => {
  const thread = await getTechThreadById(req.params.threadId);
  if (!thread) return res.status(404).json({ error: "Диалог не найден" });
  const messages = await listTechThreadMessages(req.params.threadId);
  return res.status(200).json({ thread, messages });
});
techRouter.get("/threads/:threadId/stream", async (req, res) => {
  const streamToken = String(req.query.streamToken ?? "");
  if (!streamToken) {
    res.status(401).json({ error: "Требуется токен" });
    return;
  }
  let role: string | undefined;
  try {
    const payload = verifyStreamToken(streamToken);
    role = payload.role;
  } catch {
    res.status(401).json({ error: "Недействительный токен" });
    return;
  }
  if (role !== "master" && role !== "admin" && role !== "boss") {
    res.status(403).json({ error: "Недостаточно прав" });
    return;
  }

  const threadId = req.params.threadId;
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  /** Как у клиента `/messages/:orderId/stream`: только длина и id последнего сообщения — без updatedAt треда (иначе ложные «нет изменений»). */
  let lastSig = "";
  const pushSnapshot = async () => {
    const thread = await getTechThreadById(threadId);
    const messages = await listTechThreadMessages(threadId);
    const last = messages[messages.length - 1];
    const clientTyping = Boolean(thread?.clientTyping);
    const sig = `${messages.length}|${last?.id ?? "none"}|${messages.filter((m) => m.from === "client" && !m.read_by_tech_at).length}|${messages.filter((m) => m.from === "tech" && !m.read_by_client_at).length}|${thread?.unreadCount ?? 0}|${clientTyping ? 1 : 0}`;
    if (sig === lastSig) return;
    lastSig = sig;
    res.write(`event: messages\n`);
    res.write(`data: ${JSON.stringify({ thread, messages })}\n\n`);
  };

  void pushSnapshot();
  const timer = setInterval(() => {
    void pushSnapshot();
  }, 1000);
  const ping = setInterval(() => {
    res.write(`event: ping\ndata: {}\n\n`);
  }, 15000);

  req.on("close", () => {
    clearInterval(timer);
    clearInterval(ping);
    res.end();
  });
});
techRouter.post("/threads/:threadId/read", async (req, res) => {
  await markTechThreadRead(req.params.threadId);
  return res.status(204).send();
});
techRouter.post("/threads/:threadId/messages", async (req, res) => {
  const parsed = messageBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Некорректные данные", details: parsed.error.flatten() });
  const message = await sendTechThreadMessage(req.params.threadId, parsed.data.text, {
    attachmentDataUrl: parsed.data.attachment?.dataUrl,
    attachmentName: parsed.data.attachment?.name,
  });
  return res.status(201).json({ message });
});
techRouter.get("/templates", async (_req, res) => res.status(200).json({ rows: await getTechTemplates() }));

techRouter.get("/profile", async (_req, res) => res.status(200).json({ profile: await getTechProfile() }));
techRouter.get("/settings", async (_req, res) => res.status(200).json({ settings: await getTechSettings() }));
techRouter.patch("/settings", async (req, res) => {
  const parsed = settingsBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Некорректные данные", details: parsed.error.flatten() });
  return res.status(200).json({ settings: await saveTechSettings(parsed.data) });
});

