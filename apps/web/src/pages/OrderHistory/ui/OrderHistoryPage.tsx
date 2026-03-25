import * as React from "react";
import { Link } from "react-router-dom";
import type { RepairOrder } from "@/entities/repair-order";
import { getClientRepairsApi, type ClientRepairDto } from "@/shared/lib/clientInboxApi";
import { readAuthSession } from "@/shared/lib/authSession";
import { OrderHistoryList } from "@/widgets/OrderHistoryList";
import { PageHeader } from "@/widgets/PageHeader";
import cls from "./OrderHistoryPage.module.css";

function toSafeRub(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, n);
}

function mapApiToRepairOrder(r: ClientRepairDto): RepairOrder {
  return {
    id: r.orderId,
    deviceName: r.deviceName,
    serviceName: r.issueLabel,
    metaLine: r.estimateLabel,
    status: r.status === "completed" ? "completed" : r.status === "canceled" ? "canceled" : "in_progress",
    orderDateLabel: r.orderDateLabel || new Date().toLocaleDateString("ru-RU"),
    priceRub: toSafeRub(r.totalRub),
    imageUrl: r.imageUrl,
  };
}

export const OrderHistoryPage: React.FC = () => {
  const auth = readAuthSession();
  const [orders, setOrders] = React.useState<RepairOrder[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!auth?.accessToken) {
      setOrders([]);
      return;
    }
    let mounted = true;
    void (async () => {
      setLoading(true);
      try {
        const rows = await getClientRepairsApi();
        if (mounted) setOrders(rows.map(mapApiToRepairOrder));
      } catch {
        if (mounted) setOrders([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [auth?.accessToken]);

  return (
    <div className={cls.shell}>
      <PageHeader title="История заказов" subtitle="Заказы из вашего аккаунта (данные с сервера)." />
      <div className={cls.inner}>
        {!auth?.accessToken ? (
          <p className={cls.hint}>
            Войдите, чтобы видеть историю. <Link to="/login">Вход</Link>
          </p>
        ) : loading ? (
          <p className={cls.hint}>Загрузка…</p>
        ) : orders.length === 0 ? (
          <p className={cls.hint}>Пока нет заказов в истории.</p>
        ) : (
          <OrderHistoryList orders={orders} heading="Ремонты" />
        )}
      </div>
    </div>
  );
};
