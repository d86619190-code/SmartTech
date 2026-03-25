import * as React from "react";
import { Link } from "react-router-dom";
import { techApi } from "@/shared/lib/techApi";
import { formatRub } from "@/shared/lib/formatMoney";
import { AdminInput, AdminTable, AdminTd, AdminTh, FilterBar } from "@/widgets/admin";
import { TechCard, TechPageHeader } from "@/widgets/technician";
import cls from "./techPages.module.css";

export const TechCompletedPage: React.FC = () => {
  const [q, setQ] = React.useState("");
  const [completed, setCompleted] = React.useState<any[]>([]);
  React.useEffect(() => {
    void (async () => {
      const res = await techApi.getCompleted();
      setCompleted(res.rows);
    })();
  }, []);
  const rows = React.useMemo(() => {
    const qq = q.trim().toLowerCase();
    return completed.filter((j) => !qq || `${j.publicId} ${j.device} ${j.customer}`.toLowerCase().includes(qq));
  }, [q, completed]);

  return (
    <>
      <TechPageHeader title="Завершённые работы" subtitle="История, выплаты и оценки клиентов." />
      <FilterBar>
        <AdminInput placeholder="Поиск по заказу или устройству…" value={q} onChange={(e) => setQ(e.target.value)} />
      </FilterBar>
      <TechCard style={{ padding: 0 }}>
        <AdminTable>
          <thead>
            <tr>
              <AdminTh>Заказ</AdminTh>
              <AdminTh>Устройство</AdminTh>
              <AdminTh>Клиент</AdminTh>
              <AdminTh>Завершён</AdminTh>
              <AdminTh>Оценка</AdminTh>
              <AdminTh>Доход</AdminTh>
              <AdminTh />
            </tr>
          </thead>
          <tbody>
            {rows.map((j) => (
              <tr key={j.id}>
                <AdminTd>
                  <strong>{j.publicId}</strong>
                </AdminTd>
                <AdminTd>{j.device}</AdminTd>
                <AdminTd>{j.customer}</AdminTd>
                <AdminTd>{j.completedAt ?? "—"}</AdminTd>
                <AdminTd>{j.rating != null ? `${j.rating.toFixed(1)} ★` : "—"}</AdminTd>
                <AdminTd>{j.earningsRub != null ? formatRub(j.earningsRub) : "—"}</AdminTd>
                <AdminTd>
                  <Link className={cls.link} to={`/tech/repairs/${j.id}`}>
                    Карточка
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
