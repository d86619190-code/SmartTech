import type { ServiceOrder } from "./types";

/** Demo orders for three masters (synchronized with backend: r-ff / r-alex / r-user). */
export const mockOrders: Record<string, ServiceOrder> = {
  "r-ff": {
    id: "r-ff",
    deviceLabel: "iPhone 13 mini",
    issueSummary: "Replacing the display - ff ddd wizard (ff6690473@gmail.com)",
    step: "in_repair",
    createdAtLabel: "24 March 2026",
    updatedAtLabel: "24 March 2026",
    visitMode: "slot",
    visitSlotLabel: "25 March 2026, 12:00–14:00",
    bringInPerson: true,
    needsConsultation: false,
    photoUrls: [],
    warrantyDays: 365,
    selectedQuoteId: "o1",
    finalPriceRub: 15490,
    diagnosisProblem: "The display module is damaged.",
    diagnosisDetail: "Repair in progress by the master ff ddd.",
    diagnosticFeeRub: 0,
    quoteOptions: [
      {
        id: "o1",
        title: "Original module",
        subtitle: "OEM",
        priceRub: 15490,
        isOriginal: true,
        repairDaysLabel: "1 day",
        availability: "in_stock",
      },
    ],
  },
  "r-alex": {
    id: "r-alex",
    deviceLabel: "Samsung Galaxy S21",
    issueSummary: "Battery diagnostics - master Alexey (+79789195542)",
    step: "diagnostics",
    createdAtLabel: "24 March 2026",
    updatedAtLabel: "24 March 2026",
    visitMode: "asap",
    bringInPerson: false,
    needsConsultation: true,
    photoUrls: [],
    warrantyDays: 180,
    diagnosisProblem: "Battery test - capacity degradation.",
    diagnosisDetail: "Master Alexey is preparing an estimate for replacing the battery.",
    diagnosticFeeRub: 500,
    quoteOptions: [
      {
        id: "bat1",
        title: "Battery original",
        priceRub: 5300,
        isOriginal: true,
        repairDaysLabel: "2–3 hours",
        availability: "in_stock",
      },
    ],
  },
  "r-user": {
    id: "r-user",
    deviceLabel: "MacBook Air M2",
    issueSummary: "Board after pouring - master Ivan Petrov (98y7tbnb97t@gmail.com)",
    step: "awaiting_approval",
    createdAtLabel: "23 March 2026",
    updatedAtLabel: "24 March 2026",
    visitMode: "asap",
    bringInPerson: true,
    needsConsultation: false,
    photoUrls: [],
    warrantyDays: 180,
    diagnosisProblem: "Board corrosion, variant approval required.",
    diagnosisDetail: "Master Ivan Petrov prepared restoration options.",
    diagnosticFeeRub: 1500,
    quoteOptions: [
      {
        id: "mb1",
        title: "Board restoration (ultrasound + cleaning)",
        subtitle: "If track integrity is OK",
        priceRub: 18500,
        isOriginal: false,
        repairDaysLabel: "3–5 days",
        availability: "in_stock",
      },
      {
        id: "mb2",
        title: "Board replacement (used, tested)",
        subtitle: "Faster, more expensive",
        priceRub: 42000,
        isOriginal: false,
        repairDaysLabel: "1–2 day",
        availability: "on_order",
        orderLeadDays: 5,
      },
    ],
  },
};

const STEP_LABELS: Record<string, string> = {
  created: "Created",
  awaiting_device: "Awaiting transmission",
  diagnostics: "Diagnostics",
  awaiting_approval: "Approval required",
  in_repair: "In progress",
  ready: "Ready for pickup",
  completed: "Issued",
};

/** “Current order” card on the main page */
export function getActiveOrderPreview(): { id: string; deviceLabel: string; stepLabel: string } | null {
  const o = mockOrders["r-ff"];
  if (!o || o.step === "completed") return null;
  return { id: o.id, deviceLabel: o.deviceLabel, stepLabel: STEP_LABELS[o.step] ?? o.step };
}

export function getOrderById(id: string): ServiceOrder | undefined {
  return mockOrders[id];
}

/** Orders at the approval stage */
export function getOrdersNeedingApproval(): { id: string; label: string }[] {
  return Object.values(mockOrders)
    .filter((o) => o.step === "awaiting_approval")
    .map((o) => ({ id: o.id, label: `${o.deviceLabel} — select repair option` }));
}
