import type { OrderFlowStepId } from "./orderFlow";

/** Вариант ремонта после диагностики */
export type RepairQuoteOption = {
  id: string;
  title: string;
  subtitle?: string;
  priceRub: number;
  isOriginal?: boolean;
  /** Срок ремонта, напр. «1–2 дня» */
  repairDaysLabel?: string;
  /** В наличии / под заказ */
  availability?: "in_stock" | "on_order";
  /** Если под заказ — сколько дней ожидания детали */
  orderLeadDays?: number;
};

export type ServiceOrder = {
  id: string;
  deviceLabel: string;
  issueSummary: string;
  step: OrderFlowStepId;
  createdAtLabel: string;
  updatedAtLabel: string;
  visitMode: "asap" | "slot";
  visitSlotLabel?: string;
  bringInPerson: boolean;
  needsConsultation: boolean;
  photoUrls: string[];
  warrantyDays: number;
  selectedQuoteId?: string;
  finalPriceRub?: number;
  diagnosisProblem?: string;
  quoteOptions?: RepairQuoteOption[];
  diagnosticFeeRub?: number;
  /** Развёрнутое описание для блока «Подробнее о ремонте» */
  diagnosisDetail?: string;
  /** Фактическая длительность ремонта для экрана выдачи */
  repairDurationLabel?: string;
};
