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
        <PageHeader title="Issue" subtitle={order.deviceLabel} />
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
        title={done ? "Repair completed" : "Ready for pickup"}
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
                ? "Thank you for choosing us. The warranty conditions are specified in the deed."
                : "The device can be picked up at the service center. Take your identification document."}
            </p>
          </div>
          <div className={cls.row}>
            <span className={cls.rowLabel}>Total cost</span>
            <span className={cls.rowVal}>{formatRub(order.finalPriceRub)}</span>
          </div>
          {order.repairDurationLabel ? (
            <div className={cls.row}>
              <span className={cls.rowLabel}>Repair duration</span>
              <span className={cls.rowVal}>{order.repairDurationLabel}</span>
            </div>
          ) : null}
          <div className={cls.row}>
            <span className={cls.rowLabel}>Work guarantee</span>
            <span className={cls.rowVal}>{order.warrantyDays} days.</span>
          </div>
          <div className={cls.row}>
            <span className={cls.rowLabel}>Address</span>
            <span className={cls.rowVal} style={{ maxWidth: "60%" }}>
              {SITE.address}
            </span>
          </div>
        </section>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          <Link to="/" style={{ textDecoration: "none" }}>
            <Button type="button">Home</Button>
          </Link>
          <Button type="button" variant="outline" onClick={() => window.open(`tel:${SITE.phoneTel}`)}>
            Contact the service
          </Button>
          <Link to={`/messages/${order.id}`} style={{ textDecoration: "none" }}>
            <Button type="button" variant="outline">
              Write to chat
            </Button>
          </Link>
        </div>
        <Link to={`/tracking/${order.id}`} style={{ color: "var(--color-link)", fontWeight: 700, fontSize: 14 }}>
          Full order card →
        </Link>
      </div>
    </div>
  );
};
