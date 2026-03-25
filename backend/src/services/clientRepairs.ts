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

function progressFromStage(stage: TechRepairStage): number {
  const map: Record<TechRepairStage, number> = {
    accepted: 18,
    diagnostics: 32,
    waiting_approval: 48,
    repair: 72,
    ready: 92,
    completed: 100,
  };
  return map[stage] ?? 40;
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

function userHasOrder(s: AppState, userId: string, orderId: string): boolean {
  const inbox = ensureInboxByUser(s, userId);
  if (inbox.messages.some((m) => m.order_id === orderId)) return true;
  if (inbox.approvals.some((a) => a.order_id === orderId)) return true;
  return false;
}

function buildQuoteOptionsFromTech(s: AppState, tech: TechRepairJob) {
  const st = s.techPanelMock;
  const parts = st?.partsCatalog ?? [];
  if (tech.quoteOptions && tech.quoteOptions.length > 0) {
    return tech.quoteOptions.map((opt, idx) => {
      const selected = parts.filter((p) => opt.selectedPartIds.includes(p.id));
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
  const selected = parts.filter((p) => tech.selectedPartIds.includes(p.id));
  const partsSum = selected.reduce((sum, p) => sum + p.priceRub, 0);
  const labor = Math.max(0, tech.laborRub || 0);
  const basePrice = Math.max(0, labor + partsSum);
  if (basePrice <= 0) return undefined;
  const hasInStock = selected.some((p) => p.inStock);
  const hasOem = selected.some((p) => p.oem);
  return [
    {
      id: "opt-current",
      title: "Смета от мастера",
      subtitle: selected.length ? selected.map((p) => p.name).join(", ") : "Работы без деталей",
      availability: hasInStock ? ("in_stock" as const) : ("on_order" as const),
      orderLeadDays: hasInStock ? undefined : 2,
      isOriginal: hasOem,
      repairDaysLabel: hasInStock ? "1-2 дня" : "2-4 дня",
      priceRub: basePrice,
    },
  ];
}

export async function listClientRepairs(userId: string): Promise<ClientRepairDto[]> {
  return withStore((s) => {
    const inbox = ensureInboxByUser(s, userId);
    const ids = new Set<string>();
    for (const m of inbox.messages) ids.add(m.order_id);
    for (const a of inbox.approvals) ids.add(a.order_id);

    const techJobs = allTechRepairs(s);
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
        : techStageToClientStep(tech.stage);
      const quoteOptions = buildQuoteOptionsFromTech(s, tech);
      return {
        id: orderId,
        deviceLabel: tech.device,
        issueSummary: tech.issue.length > 160 ? `${tech.issue.slice(0, 157)}…` : tech.issue,
        needsApproval,
        clientStep,
        diagnosticFeeRub: 990,
        quoteOptions,
      };
    }
    return {
      id: orderId,
      deviceLabel: "Заказ",
      issueSummary: "Переписка по заказу",
      needsApproval,
      clientStep: needsApproval ? "awaiting_approval" : "diagnostics",
    };
  });
}
