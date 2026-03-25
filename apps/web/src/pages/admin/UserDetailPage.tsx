import * as React from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { getAdminMockUserByIdApi } from "@/shared/lib/adminPanelApi";
import { Button } from "@/shared/ui/Button/Button";
import { AdminCard, AdminPageHeader, AdminTable, AdminTd, AdminTh } from "@/widgets/admin";
import cls from "./adminPages.module.css";

const ACTIVITY: Record<string, string[]> = {
  u1: ["24.03 — открыл карточку заказа EV-10421", "18.03 — оплатил ремонт онлайн", "10.02 — новая заявка"],
  u2: ["24.03 — согласовал смету по EV-10420"],
  u3: ["23.03 — корпоративный договор, счёт на оплату"],
};

const ORDERS_SUMMARY: Record<string, { id: string; label: string; status: string }[]> = {
  u1: [
    { id: "a1", label: "EV-10421 — iPhone 14 Pro", status: "В работе" },
    { id: "a5", label: "EV-10398 — Pixel 8", status: "Завершён" },
  ],
  u2: [{ id: "a2", label: "EV-10420 — Samsung Galaxy S23", status: "Согласование" }],
  u3: [
    { id: "a3", label: "EV-10418 — MacBook Air M2", status: "Диагностика" },
    { id: "a4", label: "EV-10410 — iPad Pro 11", status: "Готово" },
  ],
};

export const AdminUserDetailPage: React.FC = () => {
  const { userId } = useParams();
  const [user, setUser] = React.useState<any | null>(null);
  const [notFound, setNotFound] = React.useState(false);
  React.useEffect(() => {
    if (!userId) return;
    void (async () => {
      try {
        const res = await getAdminMockUserByIdApi(userId);
        setUser(res.user);
      } catch {
        setNotFound(true);
      }
    })();
  }, [userId]);
  if (notFound) return <Navigate to="/admin/users" replace />;
  if (!user) return <AdminPageHeader title="Карточка клиента" subtitle="Загрузка..." />;

  const activity = ACTIVITY[user.id] ?? ["Нет записей активности."];
  const orders = ORDERS_SUMMARY[user.id] ?? [];

  return (
    <>
      <AdminPageHeader
        title={user.name}
        subtitle="Карточка клиента: контакты, заказы и активность."
        actions={
          <Button type="button" variant="outline">
            Редактировать
          </Button>
        }
      />
      <div className={cls.detailGrid}>
        <AdminCard>
          <p className={cls.blockTitle}>Контакты</p>
          <p className={cls.p}>
            Телефон: <strong>{user.phone}</strong>
            <br />
            Email: <strong>{user.email}</strong>
            <br />
            Город: {user.city}
          </p>
        </AdminCard>
        <AdminCard>
          <p className={cls.blockTitle}>Сводка</p>
          <p className={cls.p}>
            Всего заказов: <strong>{user.ordersCount}</strong>
            <br />
            Последний визит: <strong>{user.lastVisit}</strong>
          </p>
        </AdminCard>
      </div>
      <div className={cls.section}>
        <h2 className={cls.h2}>Заказы</h2>
        <AdminCard>
          <AdminTable>
            <thead>
              <tr>
                <AdminTh>Заказ</AdminTh>
                <AdminTh>Статус</AdminTh>
                <AdminTh />
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <AdminTd>{o.label}</AdminTd>
                  <AdminTd>{o.status}</AdminTd>
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
      <AdminCard>
        <p className={cls.blockTitle}>История активности</p>
        <ul className={cls.noteList}>
          {activity.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </AdminCard>
      <Link to="/admin/users" className={cls.link} style={{ display: "inline-block", marginTop: 16 }}>
        ← К списку клиентов
      </Link>
    </>
  );
};
