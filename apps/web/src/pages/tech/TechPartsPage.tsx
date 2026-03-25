import * as React from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { techApi } from "@/shared/lib/techApi";
import { formatRub } from "@/shared/lib/formatMoney";
import { useStatusToast } from "@/shared/lib/useStatusToast";
import { Button } from "@/shared/ui/Button/Button";
import { StatusToast } from "@/shared/ui/StatusToast/StatusToast";
import { TechCard, TechPageHeader } from "@/widgets/technician";
import cls from "./techPages.module.css";

export const TechPartsPage: React.FC = () => {
  const { repairId } = useParams();
  const [job, setJob] = React.useState<any | null>(null);
  const [partsCatalog, setPartsCatalog] = React.useState<any[]>([]);
  const [picked, setPicked] = React.useState<Set<string>>(new Set());
  const [saving, setSaving] = React.useState(false);
  const { toast, showToast, closeToast } = useStatusToast();

  React.useEffect(() => {
    if (!repairId) return;
    void (async () => {
      const [repairRes, partsRes] = await Promise.all([techApi.getRepairById(repairId), techApi.getParts()]);
      setJob(repairRes.repair);
      setPicked(new Set(repairRes.repair.selectedPartIds ?? []));
      setPartsCatalog(partsRes.rows);
    })();
  }, [repairId]);
  if (!repairId) return <Navigate to="/tech/tasks" replace />;
  if (!job) return <TechPageHeader title="Запчасти" subtitle="Загрузка..." />;

  const toggle = (id: string) => {
    setPicked((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  const save = async () => {
    setSaving(true);
    try {
      const res = await techApi.savePartsSelection(job.id, Array.from(picked));
      setJob(res.repair);
      showToast("success", "Выбор запчастей сохранён");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Не удалось сохранить";
      showToast("error", msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <TechPageHeader title="Запчасти" subtitle="Подбор деталей с учётом OEM и наличия." />
      <TechCard style={{ padding: 0, marginBottom: 16 }}>
        {partsCatalog.map((p: any) => (
          <div
            key={p.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "16px 20px",
              borderBottom: "1px solid var(--color-order-row-border)",
            }}
          >
            <input type="checkbox" checked={picked.has(p.id)} onChange={() => toggle(p.id)} />
            <div style={{ flex: 1 }}>
              <p className={cls.p} style={{ margin: 0 }}>
                <strong>{p.name}</strong>
              </p>
              <span className={cls.muted}>
                {p.oem ? "OEM" : "Не оригинал"} · {p.inStock ? "В наличии" : "Нет в наличии"}
              </span>
            </div>
            <div style={{ textAlign: "right" }}>
              <strong>{formatRub(p.priceRub)}</strong>
            </div>
          </div>
        ))}
      </TechCard>
      <Button type="button" onClick={() => void save()} disabled={saving}>
        {saving ? "Сохранение…" : "Зафиксировать выбор"}
      </Button>
      <Link className={cls.link} to={`/tech/repairs/${job.id}/price`} style={{ marginLeft: 16 }}>
        К смете
      </Link>
      {toast ? <StatusToast tone={toast.tone} message={toast.message} onClose={closeToast} /> : null}
    </>
  );
};
