import * as React from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { getOrderById } from "@/entities/order";
import { readAuthSession } from "@/shared/lib/authSession";
import { getClientOrderMetaApi } from "@/shared/lib/clientInboxApi";
import { Button } from "@/shared/ui/Button/Button";
import { SITE } from "@/shared/config/siteContacts";
import { SkeletonCard } from "@/shared/ui/Skeleton";
import { PageHeader } from "@/widgets/PageHeader";
import cls from "./clientPages.module.css";

function formatRub(n: number | undefined): string {
  if (n == null) return "—";
  return new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(n);
}

export const OrderPickupPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const order = orderId ? getOrderById(orderId) : undefined;
  const auth = readAuthSession();
  const [meta, setMeta] = React.useState<Awaited<ReturnType<typeof getClientOrderMetaApi>> | null>(null);
  const [metaLoading, setMetaLoading] = React.useState(Boolean(auth?.accessToken && orderId));

  React.useEffect(() => {
    if (!orderId || !auth?.accessToken) {
      setMeta(null);
      setMetaLoading(false);
      return;
    }
    let mounted = true;
    void (async () => {
      setMetaLoading(true);
      try {
        const m = await getClientOrderMetaApi(orderId);
        if (mounted) setMeta(m);
      } catch {
        if (mounted) setMeta(null);
      } finally {
        if (mounted) setMetaLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [orderId, auth?.accessToken]);

  if (!orderId || !order) {
    return <Navigate to="/history" replace />;
  }

  if (metaLoading) {
    return (
      <div className={cls.shell}>
        <PageHeader title="Выдача" subtitle={order.deviceLabel} />
        <div className={cls.body}>
          <SkeletonCard rows={5} />
        </div>
      </div>
    );
  }

  const stepOk = meta
    ? meta.clientStep === "ready" || meta.clientStep === "completed"
    : order.step === "ready" || order.step === "completed";

  if (!stepOk) {
    return <Navigate to={`/tracking/${orderId}`} replace />;
  }

  const done = meta ? meta.clientStep === "completed" : order.step === "completed";

  return (
    <div className={cls.shell}>
      <PageHeader
        title={done ? "Ремонт завершён" : "Готово к выдаче"}
        subtitle={order.deviceLabel}
      />
      <div className={cls.body}>
        <section className={cls.card}>
          <div className={cls.pickupHero}>
            <div className={cls.pickupIcon} aria-hidden>
              {done ? "✓" : "📦"}
            </div>
            <p className={cls.lead}>
              {done
                ? "Спасибо, что выбрали нас. Гарантийные условия указаны в акте."
                : "Устройство можно забрать в сервисе. Возьмите документ, удостоверяющий личность."}
            </p>
          </div>
          <div className={cls.row}>
            <span className={cls.rowLabel}>Итоговая стоимость</span>
            <span className={cls.rowVal}>{formatRub(order.finalPriceRub)}</span>
          </div>
          {order.repairDurationLabel ? (
            <div className={cls.row}>
              <span className={cls.rowLabel}>Длительность ремонта</span>
              <span className={cls.rowVal}>{order.repairDurationLabel}</span>
            </div>
          ) : null}
          <div className={cls.row}>
            <span className={cls.rowLabel}>Гарантия на работы</span>
            <span className={cls.rowVal}>{order.warrantyDays} дн.</span>
          </div>
          <div className={cls.row}>
            <span className={cls.rowLabel}>Адрес</span>
            <span className={cls.rowVal} style={{ maxWidth: "60%" }}>
              {SITE.address}
            </span>
          </div>
        </section>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          <Link to="/" style={{ textDecoration: "none" }}>
            <Button type="button">На главную</Button>
          </Link>
          <Button type="button" variant="outline" onClick={() => window.open(`tel:${SITE.phoneTel}`)}>
            Связаться с сервисом
          </Button>
          <Link to={`/messages/${order.id}`} style={{ textDecoration: "none" }}>
            <Button type="button" variant="outline">
              Написать в чат
            </Button>
          </Link>
        </div>
        <Link to={`/tracking/${order.id}`} style={{ color: "var(--color-link)", fontWeight: 700, fontSize: 14 }}>
          Полная карточка заказа →
        </Link>
      </div>
    </div>
  );
};
