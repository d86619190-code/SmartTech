import * as React from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { getOrderById, type OrderFlowStepId } from "@/entities/order";
import { SITE } from "@/shared/config/siteContacts";
import { readAuthSession } from "@/shared/lib/authSession";
import { getClientOrderMetaApi } from "@/shared/lib/clientInboxApi";
import { useMediaQuery } from "@/shared/lib/useMediaQuery";
import { Button } from "@/shared/ui/Button/Button";
import { PageHeader } from "@/widgets/PageHeader";
import { OrderStagePanel } from "@/widgets/OrderStagePanel";
import { OrderTimeline } from "@/widgets/OrderTimeline";
import cls from "./TrackingDetailPage.module.css";

function formatRub(n: number | undefined): string {
  if (n == null) return "—";
  return new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(
    n
  );
}

export const TrackingDetailPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const auth = readAuthSession();
  const isNarrow = useMediaQuery("(max-width: 767px)");
  const [detailsOpen, setDetailsOpen] = React.useState(false);
  const mockOrder = orderId ? getOrderById(orderId) : undefined;
  const [meta, setMeta] = React.useState<Awaited<ReturnType<typeof getClientOrderMetaApi>> | null>(null);
  const [metaLoading, setMetaLoading] = React.useState(true);
  const [metaError, setMetaError] = React.useState(false);
  const lastMetaSigRef = React.useRef<string>("");

  React.useEffect(() => {
    if (!orderId || !auth?.accessToken) {
      setMeta(null);
      setMetaLoading(false);
      return;
    }
    let mounted = true;
    const loadMeta = async (initial = false) => {
      if (initial) {
        setMetaLoading(true);
        setMetaError(false);
      }
      try {
        const m = await getClientOrderMetaApi(orderId);
        if (!mounted) return;
        const sig = `${m.id}|${m.clientStep}|${m.needsApproval}|${m.deviceLabel}|${m.issueSummary}`;
        if (sig !== lastMetaSigRef.current) {
          lastMetaSigRef.current = sig;
          setMeta(m);
        }
        if (initial) setMetaError(false);
      } catch {
        if (mounted) {
          if (initial) {
            setMeta(null);
            setMetaError(true);
          }
        }
      } finally {
        if (mounted && initial) setMetaLoading(false);
      }
    };
    void loadMeta(true);
    const t = window.setInterval(() => {
      void loadMeta();
    }, 3000);
    return () => {
      mounted = false;
      window.clearInterval(t);
    };
  }, [orderId, auth?.accessToken]);

  const order = React.useMemo(() => {
    if (!mockOrder || !meta) return mockOrder;
    return { ...mockOrder, step: meta.clientStep as OrderFlowStepId };
  }, [mockOrder, meta]);

  const handleCancel = () => {
    if (!window.confirm("Отменить заявку? При необходимости уточним детали по телефону.")) return;
    navigate("/history");
  };

  if (!orderId) {
    return <Navigate to="/tracking" replace />;
  }

  if (!auth?.accessToken) {
    return (
      <div className={cls.shell}>
        <div className={cls.inner}>
          <h1 className={cls.pageTitle}>Отслеживание</h1>
          <p className={cls.loginHint}>
            Войдите в аккаунт, чтобы видеть статус ремонта.{" "}
            <Link className={cls.loginLink} to="/login">
              Вход
            </Link>
          </p>
        </div>
      </div>
    );
  }

  if (metaLoading) {
    return (
      <div className={cls.shell}>
        <PageHeader title="…" subtitle="Отслеживание заказа" />
        <div className={cls.body}>
          <p className={cls.mutedLead}>Загрузка…</p>
        </div>
      </div>
    );
  }

  if (metaError || !meta) {
    return (
      <div className={cls.shell}>
        <PageHeader title="Заказ" />
        <div className={cls.body}>
          <p className={cls.mutedLead}>Заказ не найден или нет доступа.</p>
          <Button type="button" variant="outline" onClick={() => navigate("/tracking")}>
            К отслеживанию
          </Button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className={cls.shell}>
        <PageHeader title={meta.deviceLabel} subtitle="Отслеживание заказа" />
        <div className={cls.body}>
          <section className={cls.card} aria-label="Устройство">
            <p className={cls.deviceIssue}>{meta.issueSummary}</p>
          </section>
          <section className={cls.card} aria-label="Этапы заказа">
            <h2 className={cls.cardHeading}>Статус</h2>
            <OrderTimeline currentStep={meta.clientStep} variant={isNarrow ? "horizontal" : "vertical"} />
          </section>
          {meta.needsApproval ? (
            <div className={cls.banner}>
              Требуется выбор варианта ремонта.{" "}
              <Link to={`/orders/${meta.id}/approval`}>Перейти к согласованию →</Link>
            </div>
          ) : null}
          <p className={cls.backRow}>
            <Link className={cls.inlineLink} to="/tracking">
              ← Все ремонты
            </Link>
          </p>
        </div>
      </div>
    );
  }

  const selected = order.quoteOptions?.find((q) => q.id === order.selectedQuoteId);

  return (
    <div className={cls.shell}>
      <PageHeader title={`${order.deviceLabel}`} subtitle="Отслеживание заказа" />
      <div className={cls.body}>
        <section className={cls.card} aria-label="Устройство">
          <div className={cls.deviceRow}>
            <div className={cls.devicePhoto} aria-hidden />
            <div>
              <p className={cls.deviceName}>{order.deviceLabel}</p>
              <p className={cls.deviceIssue}>{order.issueSummary}</p>
            </div>
          </div>
        </section>

        <section className={cls.card} aria-label="Этапы заказа">
          <h2 className={cls.cardHeading}>Статус</h2>
          <OrderTimeline currentStep={meta.clientStep} variant={isNarrow ? "horizontal" : "vertical"} />
        </section>

        {meta.needsApproval ? (
          <div className={cls.banner}>
            Требуется выбор варианта ремонта после диагностики.{" "}
            <Link to={`/orders/${order.id}/approval`}>Перейти к согласованию →</Link>
          </div>
        ) : null}

        {order.step === "ready" ? (
          <div className={cls.banner}>
            Устройство готово к выдаче.{" "}
            <Link to={`/orders/${order.id}/pickup`}>Инструкция и итог →</Link>
          </div>
        ) : null}

        <section className={cls.card}>
          <h2 className={cls.cardHeading}>Сейчас</h2>
          <OrderStagePanel order={order} selectedTitle={selected?.title} />
        </section>

        <section className={cls.card}>
          <h2 className={cls.cardHeading}>Краткое резюме</h2>
          <p className={cls.meta}>
            <strong>Создан:</strong> {order.createdAtLabel}
            <br />
            <strong>Обновлён:</strong> {order.updatedAtLabel}
            <br />
            <strong>Визит:</strong> {order.visitMode === "asap" ? "В ближайшее время" : order.visitSlotLabel ?? "—"}
            <br />
            <strong>Приём:</strong> {order.bringInPerson ? "Принесу лично" : "Доставка/другое"}
            {order.needsConsultation ? " · нужна консультация" : ""}
          </p>
          <p className={cls.meta}>
            <strong>Гарантия:</strong> {order.warrantyDays} дн.
          </p>
          {order.finalPriceRub != null ? (
            <p className={cls.meta}>
              <strong>Итог:</strong> {formatRub(order.finalPriceRub)}
              {selected ? ` · ${selected.title}` : ""}
            </p>
          ) : null}
          <div className={cls.actions}>
            <Button type="button" variant="outline" onClick={() => window.open(`tel:${SITE.phoneTel}`)}>
              Связаться с сервисом
            </Button>
            <Button type="button" variant="ghost" onClick={handleCancel}>
              Отменить заявку
            </Button>
          </div>
        </section>

        <section className={cls.card}>
          <button type="button" className={cls.detailsToggle} onClick={() => setDetailsOpen((v) => !v)}>
            Подробнее о ремонте {detailsOpen ? "▼" : "▶"}
          </button>
          {detailsOpen ? (
            <div className={cls.detailsBody}>
              <p>
                <strong>Поломка:</strong> {order.diagnosisDetail ?? order.diagnosisProblem ?? order.issueSummary}
              </p>
              {selected ? (
                <p>
                  <strong>Выбранный вариант:</strong> {selected.title}
                  {selected.subtitle ? ` — ${selected.subtitle}` : ""}
                </p>
              ) : null}
              {selected && !selected.isOriginal ? (
                <p className={cls.disclaimer}>
                  Деталь не является оригинальной. Возможны отличия в цветопередаче или яркости; на производительность
                  это не влияет.
                </p>
              ) : null}
              <p className={cls.mutedSmall}>Гарантия на работы и детали — согласно договору и выбранному варианту.</p>
            </div>
          ) : null}
        </section>

        <p className={cls.backRow}>
          <Link className={cls.inlineLink} to="/tracking">
            ← Все ремонты
          </Link>
        </p>
      </div>
    </div>
  );
};
