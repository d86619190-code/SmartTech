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
        <TechPageHeader title="Рабочий стол" subtitle="Загрузка данных…" />
        <SkeletonKpiGrid count={4} />
        <SkeletonCard rows={6} />
      </>
    );
  }
  const active = data.active;

  return (
    <>
      <TechPageHeader title="Рабочий стол" subtitle={`${data.profile.name} — активные заявки и быстрый доступ.`} />
      <div className={cls.grid2}>
        <TechCard style={{ padding: 20 }}>
          <div className={cls.kpiMini}>
            В работе
            <strong>{data.inProg}</strong>
          </div>
        </TechCard>
        <TechCard style={{ padding: 20 }}>
          <div className={cls.kpiMini}>
            Ожидают согласования
            <strong>{data.waiting}</strong>
          </div>
        </TechCard>
        <TechCard style={{ padding: 20 }}>
          <div className={cls.kpiMini}>
            Входящие
            <strong>{data.pendingIncomingCount}</strong>
          </div>
        </TechCard>
        <TechCard style={{ padding: 20 }}>
          <div className={cls.kpiMini}>
            Рейтинг
            <strong>{data.profile.rating.toFixed(1)}</strong>
          </div>
        </TechCard>
      </div>
      <div className={cls.twoCol}>
        <div>
          <h2 className={cls.sectionTitle}>Уведомления</h2>
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
          <h2 className={cls.sectionTitle}>Текущий ремонт</h2>
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
                    <Button type="button">Открыть карточку</Button>
                  </Link>
                </div>
              </>
            ) : (
              <p className={cls.emptyState}>Нет активных ремонтов в очереди.</p>
            )}
          </TechCard>
        </div>
      </div>
      <h2 className={cls.sectionTitle}>Назначенные задачи</h2>
      <TechCard style={{ padding: 0 }}>
        <AdminTable>
          <thead>
            <tr>
              <AdminTh>Заказ</AdminTh>
              <AdminTh>Устройство</AdminTh>
              <AdminTh>Статус</AdminTh>
              <AdminTh>Сумма</AdminTh>
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
                    Открыть
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
