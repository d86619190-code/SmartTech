import * as React from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { getAdminOrderByIdApi } from "@/shared/lib/adminPanelApi";
import { downloadDataUrl, mimeFromDataUrl } from "@/shared/lib/deviceFiles";
import { formatRub } from "@/shared/lib/formatMoney";
import { Button } from "@/shared/ui/Button/Button";
import { AdminCard, AdminPageHeader, AdminStatusBadge } from "@/widgets/admin";
import cls from "./adminPages.module.css";

export const AdminOrderDetailPage: React.FC = () => {
  const { orderId } = useParams();
  const [order, setOrder] = React.useState<any | null>(null);
  const [notFound, setNotFound] = React.useState(false);
  React.useEffect(() => {
    if (!orderId) return;
    void (async () => {
      try {
        const res = await getAdminOrderByIdApi(orderId);
        setOrder(res.order);
      } catch {
        setNotFound(true);
      }
    })();
  }, [orderId]);
  if (notFound) return <Navigate to="/admin/orders" replace />;
  if (!order) return <AdminPageHeader title="Карточка заказа" subtitle="Загрузка..." />;

  return (
    <>
      <AdminPageHeader
        title={`Заказ ${order.publicId}`}
        subtitle="Полная карточка заявки: устройство, клиент, статус и стоимость."
        actions={
          <>
            <Button variant="outline" type="button">
              Назначить мастера
            </Button>
            <Button type="button">Обновить статус</Button>
          </>
        }
      />
      <div className={cls.detailGrid}>
        <AdminCard>
          <p className={cls.blockTitle}>Устройство</p>
          <p className={cls.p}>
            <strong>{order.device}</strong>
            <br />
            Тип: {order.deviceType === "phone" ? "Телефон" : order.deviceType === "tablet" ? "Планшет" : "Ноутбук"}
          </p>
        </AdminCard>
        <AdminCard>
          <p className={cls.blockTitle}>Статус</p>
          <p className={cls.p}>
            <AdminStatusBadge status={order.status} />
          </p>
        </AdminCard>
        <AdminCard>
          <p className={cls.blockTitle}>Клиент</p>
          <p className={cls.p}>
            {order.customer}
            <br />
            {order.phone}
            <br />
            {order.email}
          </p>
        </AdminCard>
        <AdminCard>
          <p className={cls.blockTitle}>Мастер</p>
          <p className={cls.p}>{order.technician ?? "Не назначен"}</p>
        </AdminCard>
      </div>
      <AdminCard style={{ marginBottom: 20 }}>
        <p className={cls.blockTitle}>Описание проблемы</p>
        <p className={cls.p}>{order.issue}</p>
        <p className={cls.p} style={{ marginTop: 12 }}>
          Фото от клиента: <strong>{order.photos}</strong>
        </p>
        {Array.isArray(order.photoUrls) && order.photoUrls.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(112px, 1fr))", gap: 10, marginTop: 12 }}>
            {order.photoUrls.map((u: string, i: number) => (
              <button
                key={`${i}-${u.slice(0, 20)}`}
                type="button"
                style={{ border: "1px solid var(--color-order-row-border)", borderRadius: 12, padding: 6, background: "var(--color-card-bg)", cursor: "pointer" }}
                onClick={() => {
                  const ext = mimeFromDataUrl(u).includes("png") ? "png" : "jpg";
                  downloadDataUrl(u, `order-${order.publicId}-${i + 1}.${ext}`);
                }}
                title="Скачать фото"
              >
                <img src={u} alt="" style={{ width: "100%", height: 88, objectFit: "cover", borderRadius: 8, display: "block" }} />
              </button>
            ))}
          </div>
        ) : null}
      </AdminCard>
      <div className={cls.detailGrid}>
        <AdminCard>
          <p className={cls.blockTitle}>Выбранный вариант ремонта</p>
          <p className={cls.p}>{order.repairOption}</p>
        </AdminCard>
        <AdminCard>
          <p className={cls.blockTitle}>Стоимость</p>
          <p className={cls.p}>
            Работа: <strong>{formatRub(order.laborRub)}</strong>
            <br />
            Запчасти: <strong>{formatRub(order.partsRub)}</strong>
            <br />
            Итого: <strong>{formatRub(order.laborRub + order.partsRub)}</strong>
          </p>
        </AdminCard>
      </div>
      <div className={cls.twoCol}>
        <AdminCard>
          <p className={cls.blockTitle}>Хронология</p>
          <ul className={cls.noteList}>
            {order.timeline.map((t: { at: string; label: string }) => (
              <li key={t.at + t.label}>
                <strong>{t.at}</strong> — {t.label}
              </li>
            ))}
          </ul>
        </AdminCard>
        <AdminCard>
          <p className={cls.blockTitle}>Заметки и история</p>
          <ul className={cls.noteList}>
            {order.notes.map((n: string) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </AdminCard>
      </div>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Button variant="outline" type="button">
          Редактировать детали
        </Button>
        <Link to="/admin/orders" className={cls.link} style={{ alignSelf: "center" }}>
          ← К списку заказов
        </Link>
      </div>
    </>
  );
};
