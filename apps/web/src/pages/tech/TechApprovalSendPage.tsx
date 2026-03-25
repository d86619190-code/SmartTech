import * as React from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { techApi } from "@/shared/lib/techApi";
import { formatRub } from "@/shared/lib/formatMoney";
import { useStatusToast } from "@/shared/lib/useStatusToast";
import { SkeletonCard } from "@/shared/ui/Skeleton";
import { Button } from "@/shared/ui/Button/Button";
import { StatusToast } from "@/shared/ui/StatusToast/StatusToast";
import { TechCard, TechPageHeader } from "@/widgets/technician";
import cls from "./techPages.module.css";

export const TechApprovalSendPage: React.FC = () => {
  const { repairId } = useParams();
  const [job, setJob] = React.useState<any | null>(null);
  const [sending, setSending] = React.useState(false);
  const { toast, showToast, closeToast } = useStatusToast();

  React.useEffect(() => {
    if (!repairId) return;
    void (async () => {
      const res = await techApi.getRepairById(repairId);
      setJob(res.repair);
    })();
  }, [repairId]);
  if (!repairId) return <Navigate to="/tech/tasks" replace />;
  if (!job) {
    return (
      <>
        <TechPageHeader title="Отправить на согласование" subtitle="Загрузка…" />
        <SkeletonCard rows={4} />
      </>
    );
  }
  const total = job.laborRub + job.partsRub;
  const alreadySent = job.stage === "waiting_approval";

  const send = async () => {
    setSending(true);
    try {
      const res = await techApi.sendApproval(job.id);
      setJob(res.repair);
      showToast("success", "Смета отправлена клиенту на согласование");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Не удалось отправить";
      showToast("error", msg);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <TechPageHeader title="Отправить на согласование" subtitle="Клиент получит уведомление в приложении." />
      <TechCard style={{ padding: 24, marginBottom: 20 }}>
        <p className={cls.blockTitle}>Ремонт</p>
        <p className={cls.p}>
          {job.device} — {job.publicId}
        </p>
        <p className={cls.blockTitle} style={{ marginTop: 20 }}>
          Итоговая стоимость
        </p>
        <p className={cls.p} style={{ fontSize: 22 }}>
          <strong>{formatRub(total)}</strong>
        </p>
        <p className={cls.blockTitle} style={{ marginTop: 20 }}>
          Срок
        </p>
        <p className={cls.p}>Ориентир: ~{job.etaHours} ч после согласования и наличия запчастей.</p>
        {alreadySent ? (
          <p className={cls.p} style={{ marginTop: 16, color: "var(--badge-completed-fg)" }}>
            Запрос уже у клиента — дождитесь ответа в разделе согласований.
          </p>
        ) : null}
      </TechCard>
      <Button type="button" onClick={() => void send()} disabled={sending || alreadySent}>
        {alreadySent ? "Уже отправлено" : sending ? "Отправка…" : "Отправить клиенту"}
      </Button>
      <Link className={cls.link} to={`/tech/repairs/${job.id}/tracking`} style={{ marginLeft: 16 }}>
        К этапам
      </Link>
      {toast ? <StatusToast tone={toast.tone} message={toast.message} onClose={closeToast} /> : null}
    </>
  );
};
