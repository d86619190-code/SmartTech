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
        <AdminPageHeader title="Дашборд" subtitle="Загрузка данных…" />
        <SkeletonKpiGrid count={5} />
        <SkeletonCard rows={6} />
      </>
    );
  }
  return (
    <>
      <AdminPageHeader title="Дашборд" subtitle="Быстрый обзор сервиса и ключевые метрики." />
      <div className={cls.kpiGrid}>
        <KpiCard label="Выручка (мес.)" value={formatRub(data.kpi.revenueRub)} />
        <KpiCard label="Активные ремонты" value={String(data.kpi.activeRepairs)} />
        <KpiCard label="Завершено заказов" value={String(data.kpi.completedMonth)} hint="Текущий месяц" />
        <KpiCard label="Средний чек" value={formatRub(data.kpi.avgCheckRub)} />
        <KpiCard label="Ожидают согласования" value={String(data.kpi.pendingApprovals)} hint="Требуют действия" />
      </div>
      <div className={cls.twoCol}>
        <AdminCard>
          <ChartPlaceholder title="Динамика выручки (тыс. ₽)" data={data.revenueSeries} />
        </AdminCard>
        <AdminCard>
          <ActivityFeed title="События и уведомления" items={data.logs} />
        </AdminCard>
      </div>
      <div className={cls.section}>
        <h2 className={cls.h2}>Недавние заказы</h2>
        <AdminCard>
          <AdminTable>
            <thead>
              <tr>
                <AdminTh>№</AdminTh>
                <AdminTh>Устройство</AdminTh>
                <AdminTh>Клиент</AdminTh>
                <AdminTh>Статус</AdminTh>
                <AdminTh>Сумма</AdminTh>
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
                      Открыть
                    </Link>
                  </AdminTd>
                </tr>
              ))}
            </tbody>
          </AdminTable>
        </AdminCard>
      </div>
      <div className={cls.section}>
        <h2 className={cls.h2}>Загрузка мастеров</h2>
        <AdminCard>
          <div className={cls.techList}>
            {data.techActivity.map((t: any) => (
              <div key={t.name} className={cls.techRow}>
                <span className={cls.techName}>{t.name}</span>
                <span className={cls.techMeta}>
                  В работе: <strong>{t.inWork}</strong> · За неделю: <strong>{t.done}</strong>
                </span>
              </div>
            ))}
          </div>
        </AdminCard>
      </div>
    </>
  );
};
