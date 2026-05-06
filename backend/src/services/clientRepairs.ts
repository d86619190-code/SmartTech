import { withStore, type AppState, type TechRepairJob, type TechRepairStage } from "../store.js";
import { ensureInboxByUser } from "./inbox.js";

export type ClientOrderClientStep =
  | "created"
  | "awaiting_device"
  | "diagnostics"
  | "awaiting_approval"
  | "in_repair"
  | "ready"
  | "completed";

export type ClientRepairStatus = "in_progress" | "completed" | "canceled";

export type ClientRepairDto = {
  id: string;
  orderId: string;
  deviceName: string;
  issueLabel: string;
  imageUrl: string;
  progressPercent: number;
  estimateLabel: string;
  status: ClientRepairStatus;
  totalRub: number;
  orderDateLabel: string;
};

export type ClientOrderMeta = {
  id: string;
  deviceLabel: string;
  issueSummary: string;
  /** Есть незакрытое согласование в inbox */
  needsApproval: boolean;
  /** Этап для таймлайна; синхронизирован с тех. заявкой и согласованиями */
  clientStep: ClientOrderClientStep;
  /** Заказ выдан (completed) и клиент ещё не ставил оценку */
  canRateOrder?: boolean;
  /** Мастер завершил заказ, нужно подтверждение клиента */
  canConfirmCompletion?: boolean;
  /** Уже поставленная оценка 1–5 */
  myRating?: number;
  /** Уже сохранённый текст отзыва */
  myReviewText?: string;
  /** Мастер печатает (для строки статуса в чате) */
  serviceTyping?: boolean;
  /** Мастер «на связи» (для зелёного индикатора) */
  counterpartOnline?: boolean;
  diagnosticFeeRub?: number;
  quoteOptions?: Array<{
    id: string;
    title: string;
    subtitle?: string;
    availability: "in_stock" | "on_order";
    orderLeadDays?: number;
    isOriginal: boolean;
    repairDaysLabel?: string;
    priceRub: number;
  }>;
  timeline?: Array<{
    id: string;
    stage: TechRepairStage;
    kind: "stage" | "substep";
    title: string;
    description?: string;
    at: number;
    atLabel: string;
    photoDataUrls: string[];
  }>;
  pricing?: {
    totalRub: number;
    items: Array<{
      id: string;
      type: "service" | "part";
      name: string;
      description?: string;
      priceRub: number;
    }>;
  };
};

const DEFAULT_IMG: Record<"phone" | "tablet" | "laptop", string> = {
  phone: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&h=200&fit=crop&q=80",
  tablet: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=200&h=200&fit=crop&q=80",
  laptop: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=200&h=200&fit=crop&q=80",
};

function allTechRepairs(s: AppState): TechRepairJob[] {
  const st = s.techPanelMock;
  if (!st) return [];
  return [...st.repairs, ...st.completed];
}

/** Принят 0%, в работе 50%, готов/выдан 100% */
function progressFromStage(stage: TechRepairStage): number {
  if (stage === "accepted") return 0;
  if (stage === "diagnostics" || stage === "waiting_approval" || stage === "repair") return 50;
  if (stage === "ready" || stage === "completed") return 100;
  return 0;
}

function estimateFromStage(stage: TechRepairStage): string {
  const map: Record<TechRepairStage, string> = {
    accepted: "Принято в работу",
    diagnostics: "Диагностика",
    waiting_approval: "Ожидает согласования",
    repair: "Ремонт",
    ready: "Готово к выдаче",
    completed: "Завершён",
  };
  return map[stage] ?? "В работе";
}

function statusFromTech(stage: TechRepairStage): ClientRepairStatus {
  if (stage === "completed") return "completed";
  return "in_progress";
}

function techStageToClientStep(stage: TechRepairStage): ClientOrderClientStep {
  const m: Record<TechRepairStage, ClientOrderClientStep> = {
    accepted: "diagnostics",
    diagnostics: "diagnostics",
    waiting_approval: "awaiting_approval",
    repair: "in_repair",
    ready: "ready",
    completed: "completed",
  };
  return m[stage] ?? "diagnostics";
}

function hasPendingApproval(s: AppState, userId: string, orderId: string): boolean {
  const inbox = ensureInboxByUser(s, userId);
  return inbox.approvals.some((a) => a.order_id === orderId && a.status === "pending");
}

function repairToDto(job: TechRepairJob): ClientRepairDto {
  const img =
    job.photoUrls && job.photoUrls.length > 0
      ? job.photoUrls[0]
      : DEFAULT_IMG[job.deviceType] ?? DEFAULT_IMG.phone;
  const orderDateLabel =
    job.startedAt?.slice(0, 10) ||
    job.completedAt?.slice(0, 10) ||
    job.deadline?.slice(0, 10) ||
    new Date().toLocaleDateString("ru-RU");
  return {
    id: job.id,
    orderId: job.id,
    deviceName: job.device,
    issueLabel: job.issue.length > 120 ? `${job.issue.slice(0, 117)}…` : job.issue,
    imageUrl: img,
    progressPercent: progressFromStage(job.stage),
    estimateLabel: estimateFromStage(job.stage),
    status: statusFromTech(job.stage),
    totalRub: Math.max(0, (job.laborRub ?? 0) + (job.partsRub ?? 0)),
    orderDateLabel,
  };
}

const TYPING_MS = 6000;
const PEER_ONLINE_MS = 45000;

function userHasOrder(s: AppState, userId: string, orderId: string): boolean {
  const inbox = ensureInboxByUser(s, userId);
  if (inbox.messages.some((m) => m.order_id === orderId)) return true;
  if (inbox.approvals.some((a) => a.order_id === orderId)) return true;
  return allTechRepairs(s).some((j) => j.id === orderId && j.clientUserId === userId);
}

function resolvePartRows(s: AppState, tech: TechRepairJob, ids: string[]) {
  const cat = s.techPanelMock?.partsCatalog ?? [];
  const custom = tech.customParts ?? [];
  const rows: { name: string; priceRub: number; oem?: boolean; inStock?: boolean }[] = [];
  for (const id of ids) {
    const p = cat.find((x) => x.id === id) ?? custom.find((x) => x.id === id);
    if (p) rows.push({ name: p.name, priceRub: p.priceRub, oem: p.oem, inStock: p.inStock });
  }
  return rows;
}

function buildQuoteOptionsFromTech(s: AppState, tech: TechRepairJob) {
  const st = s.techPanelMock;
  if (tech.quoteOptions && tech.quoteOptions.length > 0) {
    return tech.quoteOptions.map((opt, idx) => {
      const selected = resolvePartRows(s, tech, opt.selectedPartIds);
      const partsSum = selected.reduce((sum, p) => sum + p.priceRub, 0);
      return {
        id: opt.id || `opt-${idx + 1}`,
        title: opt.title || `Вариант ${idx + 1}`,
        subtitle: selected.length ? selected.map((p) => p.name).join(", ") : "Работы без деталей",
        availability: opt.availability,
        orderLeadDays: opt.orderLeadDays,
        isOriginal: opt.isOriginal,
        repairDaysLabel: opt.repairDaysLabel,
        priceRub: Math.max(0, (opt.laborRub || 0) + partsSum),
      };
    });
  }
  const selected = resolvePartRows(s, tech, tech.selectedPartIds);
  const partsSum = selected.reduce((sum, p) => sum + p.priceRub, 0);
  const labor = Math.max(0, tech.laborRub || 0);
  const basePrice = Math.max(0, labor + partsSum);
  if (basePrice <= 0) return undefined;
  const hasInStock = selected.some((p) => p.inStock ?? true);
  const hasOem = selected.some((p) => p.oem);
  return [
    {
      id: "opt-current",
      title: "Стоимость от мастера",
      subtitle: selected.length ? selected.map((p) => p.name).join(", ") : "Работы без деталей",
      availability: hasInStock ? ("in_stock" as const) : ("on_order" as const),
      orderLeadDays: hasInStock ? undefined : 2,
      isOriginal: hasOem,
      repairDaysLabel: hasInStock ? "1-2 дня" : "2-4 дня",
      priceRub: basePrice,
    },
  ];
}

function buildPricingDetailsFromTech(s: AppState, tech: TechRepairJob) {
  const options = tech.quoteOptions ?? [];
  const primary = options[0];
  const selectedPartIds = primary?.selectedPartIds ?? tech.selectedPartIds;
  const parts = resolvePartRows(s, tech, selectedPartIds);
  const serviceName = primary?.title?.trim() || "Работы мастера";
  const serviceDescription =
    primary?.repairDaysLabel
      ? `Срок: ${primary.repairDaysLabel}`
      : primary?.availability === "on_order"
        ? "Детали под заказ"
        : "Детали в наличии";
  const items: Array<{ id: string; type: "service" | "part"; name: string; description?: string; priceRub: number }> = [
    {
      id: "svc-main",
      type: "service",
      name: serviceName,
      description: serviceDescription,
      priceRub: Math.max(0, Number(primary?.laborRub ?? tech.laborRub) || 0),
    },
    ...parts.map((p, idx) => ({
      id: `part-${idx + 1}`,
      type: "part" as const,
      name: p.name,
      description: `${p.oem ? "OEM" : "Аналог"} · ${p.inStock ? "В наличии" : "Под заказ"}`,
      priceRub: Math.max(0, Number(p.priceRub) || 0),
    })),
  ];
  const totalRub = items.reduce((sum, it) => sum + (Number(it.priceRub) || 0), 0);
  return { totalRub, items };
}

export async function listClientRepairs(userId: string): Promise<ClientRepairDto[]> {
  return withStore((s) => {
    const inbox = ensureInboxByUser(s, userId);
    const ids = new Set<string>();
    for (const m of inbox.messages) ids.add(m.order_id);
    for (const a of inbox.approvals) ids.add(a.order_id);

    const techJobs = allTechRepairs(s);
    for (const j of techJobs) {
      if (j.clientUserId === userId) ids.add(j.id);
    }
    const byTechId = new Map(techJobs.map((j) => [j.id, j]));

    const rows: ClientRepairDto[] = [];
    for (const oid of ids) {
      const tech = byTechId.get(oid);
      if (tech) {
        rows.push(repairToDto(tech));
        continue;
      }
      rows.push({
        id: oid,
        orderId: oid,
        deviceName: "Заказ",
        issueLabel: "Переписка по заказу",
        imageUrl: DEFAULT_IMG.phone,
        progressPercent: 40,
        estimateLabel: "См. сообщения",
        status: "in_progress",
        totalRub: 0,
        orderDateLabel: new Date().toLocaleDateString("ru-RU"),
      });
    }
    return rows.sort((a, b) => a.deviceName.localeCompare(b.deviceName, "ru"));
  });
}

export async function getClientOrderMeta(userId: string, orderId: string): Promise<ClientOrderMeta | null> {
  return withStore((s) => {
    if (!userHasOrder(s, userId, orderId)) return null;
    const needsApproval = hasPendingApproval(s, userId, orderId);
    const tech = allTechRepairs(s).find((j) => j.id === orderId);
    if (tech) {
      const clientStep: ClientOrderClientStep = needsApproval
        ? "awaiting_approval"
        : tech.stage === "completed" && !tech.completionConfirmedAt
          ? "ready"
          : techStageToClientStep(tech.stage);
      const quoteOptions = buildQuoteOptionsFromTech(s, tech);
      const thread = s.techPanelMock?.threads.find((t) => t.repairId === orderId);
      const serviceTyping = Boolean(thread && Date.now() - (thread.masterTypingAt ?? 0) < TYPING_MS);
      const inbox = ensureInboxByUser(s, userId);
      const lastSvc = [...inbox.messages].filter((m) => m.order_id === orderId && m.from === "service").pop();
      const counterpartOnline = Boolean(
        serviceTyping || (lastSvc && Date.now() - lastSvc.at < PEER_ONLINE_MS),
      );
      return {
        id: orderId,
        deviceLabel: tech.device,
        issueSummary: tech.issue.length > 160 ? `${tech.issue.slice(0, 157)}…` : tech.issue,
        needsApproval,
        clientStep,
        canRateOrder: tech.stage === "completed" && !tech.clientRatingStars,
        canConfirmCompletion: tech.stage === "completed" && !tech.completionConfirmedAt,
        myRating: tech.clientRatingStars,
        myReviewText: tech.clientReviewText,
        serviceTyping,
        counterpartOnline,
        diagnosticFeeRub: 990,
        quoteOptions,
        timeline: [...(tech.progressLog ?? [])].sort((a, b) => a.at - b.at),
        pricing: buildPricingDetailsFromTech(s, tech),
      };
    }
    const thread = s.techPanelMock?.threads.find((t) => t.repairId === orderId);
    const serviceTyping = Boolean(thread && Date.now() - (thread.masterTypingAt ?? 0) < TYPING_MS);
    const inbox = ensureInboxByUser(s, userId);
    const lastSvc = [...inbox.messages].filter((m) => m.order_id === orderId && m.from === "service").pop();
    const counterpartOnline = Boolean(
      serviceTyping || (lastSvc && Date.now() - lastSvc.at < PEER_ONLINE_MS),
    );
    return {
      id: orderId,
      deviceLabel: "Заказ",
      issueSummary: "Переписка по заказу",
      needsApproval,
      clientStep: needsApproval ? "awaiting_approval" : "diagnostics",
      serviceTyping,
      counterpartOnline,
    };
  });
}

export async function peekOrderServiceTyping(userId: string, orderId: string): Promise<boolean> {
  return withStore((s) => {
    if (!userHasOrder(s, userId, orderId)) return false;
    const thread = s.techPanelMock?.threads.find((t) => t.repairId === orderId);
    if (!thread) return false;
    return Date.now() - (thread.masterTypingAt ?? 0) < TYPING_MS;
  });
}

export async function recordClientTypingForOrder(userId: string, orderId: string): Promise<boolean> {
  return withStore((s) => {
    if (!userHasOrder(s, userId, orderId)) return false;
    const thread = s.techPanelMock?.threads.find((t) => t.repairId === orderId);
    if (!thread) return false;
    thread.clientTypingAt = Date.now();
    return true;
  });
}
