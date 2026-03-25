import * as React from "react";
import type { RepairQuoteOption, ServiceOrder } from "@/entities/order";
import { Button } from "@/shared/ui/Button/Button";
import cls from "./RepairApproval.module.css";

export type RepairApprovalProps = {
  order: ServiceOrder;
  onConfirmOption: (optionId: string) => void;
  onDeclinePayDiagnostic: () => void;
};

function formatRub(n: number): string {
  return new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(
    n
  );
}

export const RepairApproval: React.FC<RepairApprovalProps> = ({
  order,
  onConfirmOption,
  onDeclinePayDiagnostic,
}) => {
  const options = order.quoteOptions ?? [];
  const fee = order.diagnosticFeeRub ?? 0;
  const [selectedId, setSelectedId] = React.useState<string | null>(options[0]?.id ?? null);

  return (
    <div className={cls.root}>
      <section className={cls.section} aria-labelledby="diag-problem">
        <h2 id="diag-problem" className={cls.sectionTitle}>
          Описание поломки
        </h2>
        <p className={cls.problem}>{order.diagnosisProblem}</p>
        {order.diagnosisDetail ? (
          <p className={cls.problemMuted}>{order.diagnosisDetail}</p>
        ) : null}
      </section>

      <section className={cls.section} aria-labelledby="repair-options">
        <h2 id="repair-options" className={cls.sectionTitle}>
          Выбор варианта ремонта
        </h2>
        <p className={cls.hintTop}>Срок зависит от наличия детали</p>
        <ul className={cls.options}>
          {options.map((opt: RepairQuoteOption) => {
            const selected = opt.id === selectedId;
            return (
              <li key={opt.id}>
                <button
                  type="button"
                  className={[cls.optionCard, selected && cls.optionCardSelected].filter(Boolean).join(" ")}
                  onClick={() => setSelectedId(opt.id)}
                  aria-pressed={selected}
                >
                  <div className={cls.optionTop}>
                    <div className={cls.optionMain}>
                      <span className={cls.optionTitle}>{opt.title}</span>
                      {opt.subtitle ? <span className={cls.optionSub}>{opt.subtitle}</span> : null}
                      <div className={cls.metaRow}>
                        {opt.isOriginal ? <span className={cls.badge}>Оригинал</span> : null}
                        <span className={cls.stock}>
                          {opt.availability === "in_stock"
                            ? "В наличии"
                            : opt.orderLeadDays != null
                              ? `Под заказ (${opt.orderLeadDays} дн.)`
                              : "Под заказ"}
                        </span>
                      </div>
                      {opt.repairDaysLabel ? (
                        <span className={cls.leadTime}>Срок ремонта: {opt.repairDaysLabel}</span>
                      ) : null}
                      {!opt.isOriginal ? (
                        <p className={cls.disclaimer}>
                          Деталь не является оригинальной. Возможны отличия в цветопередаче или яркости; на
                          производительность это не влияет.
                        </p>
                      ) : null}
                    </div>
                    <div className={cls.optionPrice}>{formatRub(opt.priceRub)}</div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
        <Button
          type="button"
          fullWidth
          disabled={!selectedId}
          onClick={() => selectedId && onConfirmOption(selectedId)}
        >
          Подтвердить выбор
        </Button>
      </section>

      <div className={cls.decline}>
        <Button type="button" variant="outline" fullWidth onClick={onDeclinePayDiagnostic}>
          Отказаться от ремонта (оплатить диагностику {formatRub(fee)})
        </Button>
        <p className={cls.hint}>После оплаты диагностики заберёте устройство без ремонта.</p>
      </div>
    </div>
  );
};
