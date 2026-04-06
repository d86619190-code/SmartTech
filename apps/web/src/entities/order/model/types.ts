import type { OrderFlowStepId } from "./orderFlow";

/** Repair option after diagnostics */
export type RepairQuoteOption = {
  id: string;
  title: string;
  subtitle?: string;
  priceRub: number;
  isOriginal?: boolean;
  /** Repair period, e.g. “1–2 days” */
  repairDaysLabel?: string;
  /** In stock / on order */
  availability?: "in_stock" | "on_order";
  /** If made to order - how many days to wait for the part */
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
  /** Detailed description for the block “More details about repairs” */
  diagnosisDetail?: string;
  /** Actual repair duration for the issue screen */
  repairDurationLabel?: string;
};
