import * as React from "react";
import { Link } from "react-router-dom";
import { techApi } from "@/shared/lib/techApi";
import { Button } from "@/shared/ui/Button/Button";
import { AdminInput, FilterBar } from "@/widgets/admin";
import { TechCard, TechPageHeader } from "@/widgets/technician";
import cls from "./techPages.module.css";

export const TechIncomingPage: React.FC = () => {
  const [q, setQ] = React.useState("");
  const [incoming, setIncoming] = React.useState<any[]>([]);
  const loadIncoming = React.useCallback(async () => {
    const res = await techApi.getIncoming();
    setIncoming(res.rows);
  }, []);
  React.useEffect(() => {
    void loadIncoming();
    const timer = window.setInterval(() => {
      void loadIncoming();
    }, 3000);
    return () => window.clearInterval(timer);
  }, [loadIncoming]);
  const rows = React.useMemo(() => {
    const qq = q.trim().toLowerCase();
    return incoming.filter((i) => {
      if (!qq) return true;
      return `${i.publicId} ${i.device} ${i.clientName} ${i.issueShort}`.toLowerCase().includes(qq);
    });
  }, [q, incoming]);

  return (
    <>
      <TechPageHeader title="Incoming applications" subtitle="New requests: review and decide to accept or reject." />
      <FilterBar>
        <AdminInput placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} />
      </FilterBar>
      <div className={cls.grid2}>
        {rows.map((req) => (
          <TechCard key={req.id} style={{ padding: 20 }}>
            <div className={cls.rowFlex}>
              {req.photoDataUrls?.[0] ? (
                <img className={cls.incomingAvatar} src={req.photoDataUrls[0]} alt="" />
              ) : req.clientAvatarUrl ? (
                <img className={cls.incomingAvatar} src={req.clientAvatarUrl} alt="" />
              ) : (
                <div className={cls.thumb}>{req.thumb}</div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p className={cls.p}>
                  <strong>{req.publicId}</strong> · {req.device}
                </p>
                {req.priority === "high" ? (
                  <p className={cls.muted} style={{ color: "var(--badge-progress-fg)" }}>
                    High priority
                  </p>
                ) : null}
                <p className={cls.p} style={{ marginTop: 8 }}>
                  {req.issueShort}
                </p>
                <p className={cls.muted}>
                  {req.clientName} · {req.clientPhone}
                </p>
                <p className={cls.muted}>{req.createdAt}</p>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
              <Link to={`/tech/incoming/${req.id}`}>
                <Button type="button" variant="outline">
                  More details
                </Button>
              </Link>
            </div>
          </TechCard>
        ))}
      </div>
    </>
  );
};
