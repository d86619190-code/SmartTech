import * as React from "react";
import { Link } from "react-router-dom";
import { SkeletonCard, SkeletonKpiGrid } from "@/shared/ui/Skeleton";
import { techApi } from "@/shared/lib/techApi";
import { formatRub } from "@/shared/lib/formatMoney";
import { Button } from "@/shared/ui/Button/Button";
import { AdminTable, AdminTd, AdminTh } from "@/widgets/admin";
import { TechCard, TechPageHeader, TechStageBadge } from "@/widgets/technician";
import cls from "./techPages.module.css";

export const TechDashboardPage: React.FC = () => {
  const [data, setData] = React.useState<any | null>(null);
  React.useEffect(() => {
    void (async () => setData(await techApi.getDashboard()))();
  }, []);
  if (!data) {
    return (
      <>
        <TechPageHeader title="Desk" subtitle="Loading data..." />
        <SkeletonKpiGrid count={4} />
        <SkeletonCard rows={6} />
      </>
    );
  }
  const active = data.active;

  return (
    <>
      <TechPageHeader title="Desk" subtitle={`${data.profile.name} — active applications and quick access.`} />
      <div className={cls.grid2}>
        <TechCard style={{ padding: 20 }}>
          <div className={cls.kpiMini}>
            In progress
            <strong>{data.inProg}</strong>
          </div>
        </TechCard>
        <TechCard style={{ padding: 20 }}>
          <div className={cls.kpiMini}>
            Awaiting approval
            <strong>{data.waiting}</strong>
          </div>
        </TechCard>
        <TechCard style={{ padding: 20 }}>
          <div className={cls.kpiMini}>
            Inbox
            <strong>{data.pendingIncomingCount}</strong>
          </div>
        </TechCard>
        <TechCard style={{ padding: 20 }}>
          <div className={cls.kpiMini}>
            Rating
            <strong>{data.profile.rating.toFixed(1)}</strong>
          </div>
        </TechCard>
      </div>
      <div className={cls.twoCol}>
        <div>
          <h2 className={cls.sectionTitle}>Notifications</h2>
          <TechCard style={{ padding: 0 }}>
            <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
              {data.alerts.map((a: any) => (
                <li
                  key={a.id}
                  style={{
                    padding: "14px 20px",
                    borderBottom: "1px solid var(--color-order-row-border)",
                    fontSize: 14,
                    color: "var(--color-text-secondary)",
                  }}
                >
                  <span style={{ fontSize: 12, color: "var(--color-text-muted)", marginRight: 8 }}>{a.at}</span>
                  {a.message}
                </li>
              ))}
            </ul>
          </TechCard>
        </div>
        <div>
          <h2 className={cls.sectionTitle}>Current repair</h2>
          <TechCard style={{ padding: 20 }}>
            {active[0] ? (
              <>
                <div className={cls.rowFlex}>
                  <div className={cls.thumb}>{active[0].thumb}</div>
                  <div>
                    <p className={cls.p}>
                      <strong>{active[0].publicId}</strong> · {active[0].device}
                    </p>
                    <p className={cls.muted}>{active[0].customer}</p>
                    <TechStageBadge stage={active[0].stage} />
                  </div>
                </div>
                <div style={{ marginTop: 16 }}>
                  <Link to={`/tech/repairs/${active[0].id}`}>
                    <Button type="button">Open card</Button>
                  </Link>
                </div>
              </>
            ) : (
              <p className={cls.emptyState}>There are no active repairs in the queue.</p>
            )}
          </TechCard>
        </div>
      </div>
      <h2 className={cls.sectionTitle}>Assigned tasks</h2>
      <TechCard style={{ padding: 0 }}>
        <AdminTable>
          <thead>
            <tr>
              <AdminTh>Order</AdminTh>
              <AdminTh>Device</AdminTh>
              <AdminTh>Status</AdminTh>
              <AdminTh>Sum</AdminTh>
              <AdminTh />
            </tr>
          </thead>
          <tbody>
            {active.map((r: any) => (
              <tr key={r.id}>
                <AdminTd>
                  <strong>{r.publicId}</strong>
                </AdminTd>
                <AdminTd>{r.device}</AdminTd>
                <AdminTd>
                  <TechStageBadge stage={r.stage} />
                </AdminTd>
                <AdminTd>{formatRub(r.laborRub + r.partsRub)}</AdminTd>
                <AdminTd>
                  <Link className={cls.link} to={`/tech/repairs/${r.id}`}>
                    Open
                  </Link>
                </AdminTd>
              </tr>
            ))}
          </tbody>
        </AdminTable>
      </TechCard>
    </>
  );
};
