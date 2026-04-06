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
          Description of the breakdown
        </h2>
        <p className={cls.problem}>{order.diagnosisProblem}</p>
        {order.diagnosisDetail ? (
          <p className={cls.problemMuted}>{order.diagnosisDetail}</p>
        ) : null}
      </section>

      <section className={cls.section} aria-labelledby="repair-options">
        <h2 id="repair-options" className={cls.sectionTitle}>
          Selecting a repair option
        </h2>
        <p className={cls.hintTop}>The period depends on the availability of the part</p>
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
                        {opt.isOriginal ? <span className={cls.badge}>Original</span> : null}
                        <span className={cls.stock}>
                          {opt.availability === "in_stock"
                            ? "In stock"
                            : opt.orderLeadDays != null
                              ? `To order (${opt.orderLeadDays} days)`
                              : "To order"}
                        </span>
                      </div>
                      {opt.repairDaysLabel ? (
                        <span className={cls.leadTime}>Repair time: {opt.repairDaysLabel}</span>
                      ) : null}
                      {!opt.isOriginal ? (
                        <p className={cls.disclaimer}>
                          The part is not original. There may be differences in color or brightness; on
                          This does not affect performance.
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
          Confirm selection
        </Button>
      </section>

      <div className={cls.decline}>
        <Button type="button" variant="outline" fullWidth onClick={onDeclinePayDiagnostic}>
          Refuse repair (pay for diagnostics {formatRub(fee)})
        </Button>
        <p className={cls.hint}>After paying for the diagnostics, you will pick up the device without repair.</p>
      </div>
    </div>
  );
};
