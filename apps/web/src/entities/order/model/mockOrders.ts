import type { ServiceOrder } from "./types";

/** Демо-заказы под трёх мастеров (синхрон с бэкендом: r-ff / r-alex / r-user). */
export const mockOrders: Record<string, ServiceOrder> = {
  "r-ff": {
    id: "r-ff",
    deviceLabel: "iPhone 13 mini",
    issueSummary: "Замена дисплея — мастер ff ddd (ff6690473@gmail.com)",
    step: "in_repair",
    createdAtLabel: "24 марта 2026",
    updatedAtLabel: "24 марта 2026",
    visitMode: "slot",
    visitSlotLabel: "25 марта 2026, 12:00–14:00",
    bringInPerson: true,
    needsConsultation: false,
    photoUrls: [],
    warrantyDays: 365,
    selectedQuoteId: "o1",
    finalPriceRub: 15490,
    diagnosisProblem: "Повреждён модуль дисплея.",
    diagnosisDetail: "Ремонт в процессе у мастера ff ddd.",
    diagnosticFeeRub: 0,
    quoteOptions: [
      {
        id: "o1",
        title: "Оригинальный модуль",
        subtitle: "OEM",
        priceRub: 15490,
        isOriginal: true,
        repairDaysLabel: "1 день",
        availability: "in_stock",
      },
    ],
  },
  "r-alex": {
    id: "r-alex",
    deviceLabel: "Samsung Galaxy S21",
    issueSummary: "Диагностика АКБ — мастер Алексей (+79789195542)",
    step: "diagnostics",
    createdAtLabel: "24 марта 2026",
    updatedAtLabel: "24 марта 2026",
    visitMode: "asap",
    bringInPerson: false,
    needsConsultation: true,
    photoUrls: [],
    warrantyDays: 180,
    diagnosisProblem: "Тест батареи — деградация ёмкости.",
    diagnosisDetail: "Мастер Алексей готовит смету на замену АКБ.",
    diagnosticFeeRub: 500,
    quoteOptions: [
      {
        id: "bat1",
        title: "Аккумулятор оригинал",
        priceRub: 5300,
        isOriginal: true,
        repairDaysLabel: "2–3 часа",
        availability: "in_stock",
      },
    ],
  },
  "r-user": {
    id: "r-user",
    deviceLabel: "MacBook Air M2",
    issueSummary: "Плата после залития — мастер Иван Петров (98y7tbnb97t@gmail.com)",
    step: "awaiting_approval",
    createdAtLabel: "23 марта 2026",
    updatedAtLabel: "24 марта 2026",
    visitMode: "asap",
    bringInPerson: true,
    needsConsultation: false,
    photoUrls: [],
    warrantyDays: 180,
    diagnosisProblem: "Коррозия платы, требуется согласование варианта.",
    diagnosisDetail: "Мастер Иван Петров подготовил варианты восстановления.",
    diagnosticFeeRub: 1500,
    quoteOptions: [
      {
        id: "mb1",
        title: "Восстановление платы (ультразвук + чистка)",
        subtitle: "Если целостность дорожек OK",
        priceRub: 18500,
        isOriginal: false,
        repairDaysLabel: "3–5 дней",
        availability: "in_stock",
      },
      {
        id: "mb2",
        title: "Замена платы (б/у проверенная)",
        subtitle: "Быстрее, дороже",
        priceRub: 42000,
        isOriginal: false,
        repairDaysLabel: "1–2 дня",
        availability: "on_order",
        orderLeadDays: 5,
      },
    ],
  },
};

const STEP_LABELS: Record<string, string> = {
  created: "Создана",
  awaiting_device: "Ожидает передачи",
  diagnostics: "Диагностика",
  awaiting_approval: "Нужно согласование",
  in_repair: "В работе",
  ready: "Готово к выдаче",
  completed: "Выдано",
};

/** Карточка «текущий заказ» на главной */
export function getActiveOrderPreview(): { id: string; deviceLabel: string; stepLabel: string } | null {
  const o = mockOrders["r-ff"];
  if (!o || o.step === "completed") return null;
  return { id: o.id, deviceLabel: o.deviceLabel, stepLabel: STEP_LABELS[o.step] ?? o.step };
}

export function getOrderById(id: string): ServiceOrder | undefined {
  return mockOrders[id];
}

/** Заказы на этапе согласования */
export function getOrdersNeedingApproval(): { id: string; label: string }[] {
  return Object.values(mockOrders)
    .filter((o) => o.step === "awaiting_approval")
    .map((o) => ({ id: o.id, label: `${o.deviceLabel} — выберите вариант ремонта` }));
}
