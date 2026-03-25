import * as React from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { getAdminTechnicianByIdApi } from "@/shared/lib/adminPanelApi";
import { formatRub } from "@/shared/lib/formatMoney";
import { Button } from "@/shared/ui/Button/Button";
import { AdminCard, AdminPageHeader } from "@/widgets/admin";
import cls from "./adminPages.module.css";

export const AdminTechnicianDetailPage: React.FC = () => {
  const { techId } = useParams();
  const [tech, setTech] = React.useState<any | null>(null);
  const [notFound, setNotFound] = React.useState(false);
  React.useEffect(() => {
    if (!techId) return;
    void (async () => {
      try {
        const res = await getAdminTechnicianByIdApi(techId);
        setTech(res.technician);
      } catch {
        setNotFound(true);
      }
    })();
  }, [techId]);
  if (notFound) return <Navigate to="/admin/technicians" replace />;
  if (!tech) return <AdminPageHeader title="Карточка мастера" subtitle="Загрузка..." />;

  return (
    <>
      <AdminPageHeader
        title={tech.name}
        subtitle="Детализация нагрузки и назначений (демо-данные)."
        actions={
          <>
            <Button type="button" variant="outline">
              Снять с заказов
            </Button>
            <Button type="button">Назначить на заказ</Button>
          </>
        }
      />
      <div className={cls.detailGrid}>
        <AdminCard>
          <p className={cls.blockTitle}>Показатели</p>
          <p className={cls.p}>
            Активных заказов: <strong>{tech.activeOrders}</strong>
            <br />
            Рейтинг: <strong>{tech.rating.toFixed(1)}</strong>
            <br />
            Завершено работ: <strong>{tech.completed}</strong>
          </p>
        </AdminCard>
        <AdminCard>
          <p className={cls.blockTitle}>Финансы</p>
          <p className={cls.p}>
            Накопленная выручка (оценка): <strong>{formatRub(tech.revenueRub)}</strong>
          </p>
        </AdminCard>
        <AdminCard>
          <p className={cls.blockTitle}>Специализация</p>
          <p className={cls.p}>{tech.specialty}</p>
        </AdminCard>
      </div>
      <AdminCard>
        <p className={cls.blockTitle}>Текущие назначения</p>
        <p className={cls.p}>
          В демо-режиме назначения можно связать с заказами по полю «Мастер» в разделе «Заказы». Подключите API для живых данных.
        </p>
      </AdminCard>
      <Link to="/admin/technicians" className={cls.link} style={{ display: "inline-block", marginTop: 16 }}>
        ← К списку мастеров
      </Link>
    </>
  );
};
