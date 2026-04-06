import * as React from "react";
import { Link } from "react-router-dom";
import {
  ActivityFeed,
  AdminCard,
  AdminPageHeader,
  AdminStatusBadge,
  AdminTable,
  AdminTd,
  AdminTh,
  ChartPlaceholder,
  KpiCard,
} from "@/widgets/admin";
import { SkeletonCard, SkeletonKpiGrid } from "@/shared/ui/Skeleton";
import { getAdminDashboardApi } from "@/shared/lib/adminPanelApi";
import { formatRub } from "@/shared/lib/formatMoney";
import cls from "./adminPages.module.css";

export const AdminDashboardPage: React.FC = () => {
  const [data, setData] = React.useState<any | null>(null);
  React.useEffect(() => {
    void (async () => {
      const next = await getAdminDashboardApi();
      setData(next);
    })();
  }, []);
  if (!data) {
    return (
      <>
        <AdminPageHeader title="Dashboard" subtitle="Loading data..." />
        <SkeletonKpiGrid count={5} />
        <SkeletonCard rows={6} />
      </>
    );
  }
  return (
    <>
      <AdminPageHeader title="Dashboard" subtitle="Quick overview of the service and key metrics." />
      <div className={cls.kpiGrid}>
        <KpiCard label="Revenue (month)" value={formatRub(data.kpi.revenueRub)} />
        <KpiCard label="Active repairs" value={String(data.kpi.activeRepairs)} />
        <KpiCard label="Completed orders" value={String(data.kpi.completedMonth)} hint="Current month" />
        <KpiCard label="Average bill" value={formatRub(data.kpi.avgCheckRub)} />
        <KpiCard label="Awaiting approval" value={String(data.kpi.pendingApprovals)} hint="Requires action" />
      </div>
      <div className={cls.twoCol}>
        <AdminCard>
          <ChartPlaceholder title="Revenue dynamics (RUB thousand)" data={data.revenueSeries} />
        </AdminCard>
        <AdminCard>
          <ActivityFeed title="Events and notifications" items={data.logs} />
        </AdminCard>
      </div>
      <div className={cls.section}>
        <h2 className={cls.h2}>Recent orders</h2>
        <AdminCard>
          <AdminTable>
            <thead>
              <tr>
                <AdminTh>№</AdminTh>
                <AdminTh>Device</AdminTh>
                <AdminTh>Client</AdminTh>
                <AdminTh>Status</AdminTh>
                <AdminTh>Sum</AdminTh>
                <AdminTh />
              </tr>
            </thead>
            <tbody>
              {data.recentOrders.map((o: any) => (
                <tr key={o.id}>
                  <AdminTd>
                    <strong>{o.publicId}</strong>
                  </AdminTd>
                  <AdminTd>{o.device}</AdminTd>
                  <AdminTd>{o.customer}</AdminTd>
                  <AdminTd>
                    <AdminStatusBadge status={o.status} />
                  </AdminTd>
                  <AdminTd>{formatRub(o.totalRub)}</AdminTd>
                  <AdminTd>
                    <Link className={cls.link} to={`/admin/orders/${o.id}`}>
                      Open
                    </Link>
                  </AdminTd>
                </tr>
              ))}
            </tbody>
          </AdminTable>
        </AdminCard>
      </div>
      <div className={cls.section}>
        <h2 className={cls.h2}>Loading masters</h2>
        <AdminCard>
          <div className={cls.techList}>
            {data.techActivity.map((t: any) => (
              <div key={t.name} className={cls.techRow}>
                <span className={cls.techName}>{t.name}</span>
                <span className={cls.techMeta}>
                  In work: <strong>{t.inWork}</strong> · For the week: <strong>{t.done}</strong>
                </span>
              </div>
            ))}
          </div>
        </AdminCard>
      </div>
    </>
  );
};
