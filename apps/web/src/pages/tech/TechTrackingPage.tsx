import * as React from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import type { TechRepairStage } from "@/entities/technician";
import { techApi } from "@/shared/lib/techApi";
import { useStatusToast } from "@/shared/lib/useStatusToast";
import { Button } from "@/shared/ui/Button/Button";
import { StatusToast } from "@/shared/ui/StatusToast/StatusToast";
import { AdminSelect } from "@/widgets/admin";
import { TechCard, TechPageHeader, TechTimeline } from "@/widgets/technician";
import cls from "./techPages.module.css";

export const TechTrackingPage: React.FC = () => {
  const { repairId } = useParams();
  const [baseJob, setBaseJob] = React.useState<any | null>(null);
  const [stage, setStage] = React.useState<TechRepairStage | null>(null);
  const [saving, setSaving] = React.useState(false);
  const { toast, showToast, closeToast } = useStatusToast();

  React.useEffect(() => {
    if (!repairId) return;
    void (async () => {
      const res = await techApi.getRepairById(repairId);
      setBaseJob(res.repair);
      setStage(null);
    })();
  }, [repairId]);

  if (!repairId) return <Navigate to="/tech/tasks" replace />;
  if (!baseJob) return <TechPageHeader title="Этапы ремонта" subtitle="Загрузка..." />;
  const current = stage ?? baseJob.stage;

  const save = async () => {
    setSaving(true);
    try {
      const res = await techApi.saveStage(baseJob.id, current);
      setBaseJob(res.repair);
      setStage(null);
      showToast("success", "Этап сохранён — клиент увидит обновление");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Не удалось сохранить этап";
      showToast("error", msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <TechPageHeader title="Этапы ремонта" subtitle="Обновление статуса для клиента и администрации." />
      <TechCard style={{ padding: 24, marginBottom: 20 }}>
        <TechTimeline stage={current} />
        <div style={{ marginTop: 24, maxWidth: 360 }}>
          <AdminSelect label="Текущий этап" value={current} onChange={(e) => setStage(e.target.value as TechRepairStage)}>
            <option value="accepted">Принято</option>
            <option value="diagnostics">Диагностика</option>
            <option value="waiting_approval">Согласование</option>
            <option value="repair">Ремонт</option>
            <option value="ready">Готово</option>
            <option value="completed">Выдано</option>
          </AdminSelect>
        </div>
      </TechCard>
      <Button type="button" onClick={() => void save()} disabled={saving}>
        {saving ? "Сохранение…" : "Сохранить этап"}
      </Button>
      <Link className={cls.link} to={`/tech/repairs/${baseJob.id}`} style={{ marginLeft: 16 }}>
        К карточке
      </Link>
      {toast ? <StatusToast tone={toast.tone} message={toast.message} onClose={closeToast} /> : null}
    </>
  );
};
