import * as React from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { techApi } from "@/shared/lib/techApi";
import { formatRub } from "@/shared/lib/formatMoney";
import { useStatusToast } from "@/shared/lib/useStatusToast";
import { Button } from "@/shared/ui/Button/Button";
import { StatusToast } from "@/shared/ui/StatusToast/StatusToast";
import { AdminInput } from "@/widgets/admin";
import { TechCard, TechPageHeader } from "@/widgets/technician";
import cls from "./techPages.module.css";

type QuoteOptionDraft = {
  id: string;
  title: string;
  laborRub: number;
  selectedPartIds: string[];
  availability: "in_stock" | "on_order";
  orderLeadDays?: number;
  isOriginal: boolean;
  repairDaysLabel?: string;
};

export const TechPricePage: React.FC = () => {
  const { repairId } = useParams();
  const [job, setJob] = React.useState<any | null>(null);
  const [partsCatalog, setPartsCatalog] = React.useState<any[]>([]);
  const [options, setOptions] = React.useState<QuoteOptionDraft[]>([]);
  const [saving, setSaving] = React.useState(false);
  const { toast, showToast, closeToast } = useStatusToast();

  React.useEffect(() => {
    if (!repairId) return;
    void (async () => {
      const [repairRes, partsRes] = await Promise.all([techApi.getRepairById(repairId), techApi.getParts()]);
      setJob(repairRes.repair);
      setPartsCatalog(partsRes.rows);
      const existing = Array.isArray(repairRes.repair.quoteOptions) ? repairRes.repair.quoteOptions : [];
      if (existing.length > 0) {
        setOptions(
          existing.map((o: any, i: number) => ({
            id: o.id || `opt-${i + 1}`,
            title: o.title || `Вариант ${i + 1}`,
            laborRub: o.laborRub ?? 0,
            selectedPartIds: o.selectedPartIds ?? [],
            availability: o.availability === "on_order" ? "on_order" : "in_stock",
            orderLeadDays: o.orderLeadDays,
            isOriginal: Boolean(o.isOriginal),
            repairDaysLabel: o.repairDaysLabel ?? (o.availability === "on_order" ? "2-4 дня" : "1-2 дня"),
          }))
        );
      } else {
        setOptions([
          {
            id: "base",
            title: "Вариант 1",
            laborRub: repairRes.repair.laborRub ?? 0,
            selectedPartIds: repairRes.repair.selectedPartIds ?? [],
            availability: "in_stock",
            isOriginal: false,
            repairDaysLabel: "1-2 дня",
          },
        ]);
      }
    })();
  }, [repairId]);
  if (!repairId) return <Navigate to="/tech/tasks" replace />;
  if (!job) return <TechPageHeader title="Смета" subtitle="Загрузка..." />;

  const updateOption = (idx: number, patch: Partial<QuoteOptionDraft>) => {
    setOptions((prev) => prev.map((o, i) => (i === idx ? { ...o, ...patch } : o)));
  };

  const togglePart = (idx: number, partId: string) => {
    setOptions((prev) =>
      prev.map((o, i) => {
        if (i !== idx) return o;
        const set = new Set(o.selectedPartIds);
        if (set.has(partId)) set.delete(partId);
        else set.add(partId);
        return { ...o, selectedPartIds: Array.from(set) };
      })
    );
  };

  const addOption = () => {
    setOptions((prev) => {
      const next: QuoteOptionDraft = {
        id: `opt-${crypto.randomUUID()}`,
        title: `Вариант ${prev.length + 1}`,
        laborRub: 0,
        selectedPartIds: [],
        availability: "in_stock",
        isOriginal: false,
        repairDaysLabel: "1-2 дня",
      };
      return [...prev, next].slice(0, 6);
    });
  };

  const removeOption = (idx: number) => {
    setOptions((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== idx)));
  };

  const save = async () => {
    setSaving(true);
    try {
      const payload = options.map((opt) => {
        const selectedParts = partsCatalog.filter((p: any) => opt.selectedPartIds.includes(p.id));
        const hasInStock = selectedParts.some((p: any) => p.inStock);
        const hasOem = selectedParts.some((p: any) => p.oem);
        return {
          ...opt,
          laborRub: Math.max(0, Number(opt.laborRub) || 0),
          selectedPartIds: opt.selectedPartIds,
          availability: opt.availability,
          orderLeadDays: opt.availability === "on_order" ? (opt.orderLeadDays ?? 2) : undefined,
          isOriginal: hasOem || opt.isOriginal,
          repairDaysLabel: opt.repairDaysLabel || (hasInStock ? "1-2 дня" : "2-4 дня"),
        };
      });
      const res = await techApi.saveQuoteOptions(job.id, payload);
      setJob(res.repair);
      showToast("success", "Смета сохранена");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Не удалось сохранить смету";
      showToast("error", msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <TechPageHeader title="Смета" subtitle="Работа и запчасти — итог для согласования с клиентом." />
      <div style={{ display: "grid", gap: 14, marginBottom: 14 }}>
        {options.map((opt, idx) => {
          const selectedParts = partsCatalog.filter((p: any) => opt.selectedPartIds.includes(p.id));
          const partsSum = selectedParts.reduce((s: number, p: any) => s + p.priceRub, 0);
          const total = (Number(opt.laborRub) || 0) + partsSum;
          return (
            <TechCard key={opt.id} style={{ padding: 0 }}>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--color-order-row-border)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                <AdminInput value={opt.title} onChange={(e) => updateOption(idx, { title: e.target.value })} />
                <Button type="button" variant="outline" onClick={() => removeOption(idx)} disabled={options.length <= 1}>
                  Удалить
                </Button>
              </div>
              <div style={{ padding: 16, display: "grid", gap: 10 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                  <label>
                    <span className={cls.muted}>Работа, ₽</span>
                    <AdminInput
                      inputMode="numeric"
                      value={String(opt.laborRub)}
                      onChange={(e) => updateOption(idx, { laborRub: Number(e.target.value.replace(/\D/g, "")) || 0 })}
                    />
                  </label>
                  <label>
                    <span className={cls.muted}>Срок</span>
                    <AdminInput value={opt.repairDaysLabel ?? ""} onChange={(e) => updateOption(idx, { repairDaysLabel: e.target.value })} />
                  </label>
                  <label>
                    <span className={cls.muted}>Под заказ (дней)</span>
                    <AdminInput
                      inputMode="numeric"
                      value={String(opt.orderLeadDays ?? "")}
                      onChange={(e) => updateOption(idx, { orderLeadDays: Number(e.target.value.replace(/\D/g, "")) || undefined })}
                    />
                  </label>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <label className={cls.muted}>
                    <input
                      type="checkbox"
                      checked={opt.availability === "in_stock"}
                      onChange={(e) => updateOption(idx, { availability: e.target.checked ? "in_stock" : "on_order" })}
                    />{" "}
                    В наличии
                  </label>
                </div>
              </div>
              <div style={{ padding: "0 0 8px" }}>
                {partsCatalog.map((p: any) => (
                  <label
                    key={p.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "10px 16px",
                      borderTop: "1px solid var(--color-order-row-border)",
                      cursor: "pointer",
                    }}
                  >
                    <input type="checkbox" checked={opt.selectedPartIds.includes(p.id)} onChange={() => togglePart(idx, p.id)} />
                    <div style={{ flex: 1 }}>
                      <span className={cls.p}>{p.name}</span>
                      <span className={cls.muted} style={{ display: "block" }}>
                        {p.oem ? "OEM" : "Аналог"} · {p.inStock ? "В наличии" : "Под заказ"} · {p.deviceHint}
                      </span>
                    </div>
                    <strong>{formatRub(p.priceRub)}</strong>
                  </label>
                ))}
              </div>
              <div style={{ padding: "10px 16px 16px", borderTop: "1px solid var(--color-order-row-border)" }}>
                <p className={cls.p}>
                  Итого варианта: <strong>{formatRub(total)}</strong>
                </p>
              </div>
            </TechCard>
          );
        })}
      </div>
      <TechCard style={{ padding: 16, marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <p className={cls.p}>
            Вариантов: <strong>{options.length}</strong>
          </p>
          <Button type="button" variant="outline" onClick={addOption} disabled={options.length >= 6}>
            + Добавить вариант
          </Button>
        </div>
      </TechCard>
      <Button type="button" onClick={() => void save()} disabled={saving}>
        {saving ? "Сохранение…" : "Сохранить смету"}
      </Button>
      <Link className={cls.link} to={`/tech/repairs/${job.id}/approval`} style={{ marginLeft: 16 }}>
        Далее: согласование →
      </Link>
      {toast ? <StatusToast tone={toast.tone} message={toast.message} onClose={closeToast} /> : null}
    </>
  );
};
