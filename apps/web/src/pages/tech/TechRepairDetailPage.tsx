import * as React from "react";
import { Link, NavLink, Navigate, useParams } from "react-router-dom";
import { techApi } from "@/shared/lib/techApi";
import { downloadDataUrl, mimeFromDataUrl } from "@/shared/lib/deviceFiles";
import { formatRub } from "@/shared/lib/formatMoney";
import { SkeletonCard } from "@/shared/ui/Skeleton";
import { Button } from "@/shared/ui/Button/Button";
import { TechCard, TechPageHeader, TechStageBadge, TechTimeline } from "@/widgets/technician";
import cls from "./techPages.module.css";

export const TechRepairDetailPage: React.FC = () => {
  const { repairId } = useParams();
  const [job, setJob] = React.useState<any | null>(null);
  const [chatThreadId, setChatThreadId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!repairId) return;
    void (async () => {
      try {
        const res = await techApi.getRepairById(repairId);
        setJob(res.repair);
      } catch {
        setJob(null);
      }
    })();
  }, [repairId]);

  React.useEffect(() => {
    if (!job?.id) return;
    void (async () => {
      try {
        const { rows } = await techApi.getThreads();
        const t = rows.find((x: { repairId?: string }) => x.repairId === job.id);
        setChatThreadId(t?.id ?? null);
      } catch {
        setChatThreadId(null);
      }
    })();
  }, [job?.id]);

  if (!repairId) return <Navigate to="/tech/tasks" replace />;
  if (!job) {
    return (
      <>
        <TechPageHeader title="Repair card" subtitle="Loading…" />
        <SkeletonCard rows={6} />
      </>
    );
  }
  const base = `/tech/repairs/${job.id}`;
  const messagesHref = chatThreadId ? `/tech/messages/${chatThreadId}` : "/tech/messages";

  return (
    <>
      <TechPageHeader
        title={job.publicId}
        subtitle={`${job.device} · ${job.customer}`}
        actions={
          <Link to={messagesHref} style={{ textDecoration: "none" }}>
            <Button type="button" variant="outline">
              Write to the client
            </Button>
          </Link>
        }
      />
      <div className={cls.subNav}>
        <NavLink className={({ isActive }) => [cls.subLink, isActive && cls.subLinkActive].filter(Boolean).join(" ")} end to={base}>
          Review
        </NavLink>
        <NavLink className={({ isActive }) => [cls.subLink, isActive && cls.subLinkActive].filter(Boolean).join(" ")} to={`${base}/diagnostics`}>
          Diagnostics
        </NavLink>
        <NavLink className={({ isActive }) => [cls.subLink, isActive && cls.subLinkActive].filter(Boolean).join(" ")} to={`${base}/price`}>
          Price
        </NavLink>
        <NavLink className={({ isActive }) => [cls.subLink, isActive && cls.subLinkActive].filter(Boolean).join(" ")} to={`${base}/approval`}>
          Coordination
        </NavLink>
        <NavLink className={({ isActive }) => [cls.subLink, isActive && cls.subLinkActive].filter(Boolean).join(" ")} to={`${base}/tracking`}>
          Stages
        </NavLink>
        <NavLink className={({ isActive }) => [cls.subLink, isActive && cls.subLinkActive].filter(Boolean).join(" ")} to={`${base}/parts`}>
          Spare parts
        </NavLink>
      </div>
      <TechCard style={{ padding: 24, marginBottom: 20 }}>
        <div className={cls.rowFlex}>
          <div className={cls.thumb}>{job.thumb}</div>
          <div>
            <p className={cls.p}>
              <strong>{job.device}</strong>
            </p>
            <p className={cls.muted}>{job.issue}</p>
            <div style={{ marginTop: 10 }}>
              <TechStageBadge stage={job.stage} />
            </div>
          </div>
        </div>
        <TechTimeline stage={job.stage} />
        {Array.isArray(job.photoUrls) && job.photoUrls.length > 0 ? (
          <div style={{ marginTop: 20 }}>
            <p className={cls.blockTitle}>Photos from diagnostics</p>
            <div className={cls.photoGrid}>
              {job.photoUrls.map((url: string, i: number) => (
                <div key={`${i}-${url.slice(0, 24)}`} className={cls.photoCell}>
                  <img className={cls.photoThumb} src={url} alt="" />
                  <button
                    type="button"
                    className={cls.photoDownload}
                    onClick={() => {
                      const ext = mimeFromDataUrl(url).includes("png") ? "png" : "jpg";
                      downloadDataUrl(url, `repair-photo-${i + 1}.${ext}`);
                    }}
                  >
                    Save to device
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : null}
        <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12 }}>
          <div>
            <span className={cls.muted}>Job</span>
            <p className={cls.p}>
              <strong>{formatRub(job.laborRub)}</strong>
            </p>
          </div>
          <div>
            <span className={cls.muted}>Spare parts</span>
            <p className={cls.p}>
              <strong>{formatRub(job.partsRub)}</strong>
            </p>
          </div>
          <div>
            <span className={cls.muted}>Time reference</span>
            <p className={cls.p}>
              <strong>{job.etaHours} ч</strong>
            </p>
          </div>
        </div>
        {job.deadline ? (
          <p className={cls.muted} style={{ marginTop: 12 }}>
            Deadline: {job.deadline}
          </p>
        ) : null}
      </TechCard>
      <Link className={cls.link} to="/tech/tasks">
        ← All tasks
      </Link>
    </>
  );
};
