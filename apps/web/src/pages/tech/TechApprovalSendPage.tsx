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
        <TechPageHeader title="Send for approval" subtitle="Loading…" />
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
      showToast("success", "The cost has been sent to the client for approval.");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to send";
      showToast("error", msg);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <TechPageHeader title="Send for approval" subtitle="The client will receive a notification in the application." />
      <TechCard style={{ padding: 24, marginBottom: 20 }}>
        <p className={cls.blockTitle}>Repair</p>
        <p className={cls.p}>
          {job.device} — {job.publicId}
        </p>
        <p className={cls.blockTitle} style={{ marginTop: 20 }}>
          Total cost
        </p>
        <p className={cls.p} style={{ fontSize: 22 }}>
          <strong>{formatRub(total)}</strong>
        </p>
        <p className={cls.blockTitle} style={{ marginTop: 20 }}>
          Term
        </p>
        <p className={cls.p}>Reference: ~{job.etaHours} hours after approval and availability of spare parts.</p>
        {alreadySent ? (
          <p className={cls.p} style={{ marginTop: 16, color: "var(--badge-completed-fg)" }}>
            The client has already received a request - wait for a response in the approvals section.
          </p>
        ) : null}
      </TechCard>
      <Button type="button" onClick={() => void send()} disabled={sending || alreadySent}>
        {alreadySent ? "Already sent" : sending ? "Dispatch..." : "Send to client"}
      </Button>
      <Link className={cls.link} to={`/tech/repairs/${job.id}/tracking`} style={{ marginLeft: 16 }}>
        To the stages
      </Link>
      {toast ? <StatusToast tone={toast.tone} message={toast.message} onClose={closeToast} /> : null}
    </>
  );
};
