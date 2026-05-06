import * as React from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { getOrderById, type OrderFlowStepId } from "@/entities/order";
import { SITE } from "@/shared/config/siteContacts";
import { readAuthSession } from "@/shared/lib/authSession";
import { confirmClientOrderCompletionApi, getClientOrderMetaApi } from "@/shared/lib/clientInboxApi";
import { useMediaQuery } from "@/shared/lib/useMediaQuery";
import { useStatusToast } from "@/shared/lib/useStatusToast";
import { SkeletonCard } from "@/shared/ui/Skeleton";
import { Button } from "@/shared/ui/Button/Button";
import { StatusToast } from "@/shared/ui/StatusToast/StatusToast";
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
  const [pricingOpen, setPricingOpen] = React.useState(false);
  const mockOrder = orderId ? getOrderById(orderId) : undefined;
  const [meta, setMeta] = React.useState<Awaited<ReturnType<typeof getClientOrderMetaApi>> | null>(null);
  const [metaLoading, setMetaLoading] = React.useState(true);
  const [metaError, setMetaError] = React.useState(false);
  const [confirmPopupOpen, setConfirmPopupOpen] = React.useState(false);
  const [confirmStars, setConfirmStars] = React.useState(5);
  const [confirmReviewText, setConfirmReviewText] = React.useState("");
  const [confirmSaving, setConfirmSaving] = React.useState(false);
  const { toast, showToast, closeToast } = useStatusToast();
  const lastMetaSigRef = React.useRef<string>("");
  const autoPopupShownRef = React.useRef<string>("");

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

  React.useEffect(() => {
    if (!meta?.canConfirmCompletion) return;
    if (autoPopupShownRef.current === meta.id) return;
    autoPopupShownRef.current = meta.id;
    setConfirmStars(Math.max(1, Math.min(5, meta.myRating ?? 5)));
    setConfirmReviewText(meta.myReviewText ?? "");
    setConfirmPopupOpen(true);
  }, [meta]);

  const order = React.useMemo(() => {
    if (!mockOrder || !meta) return mockOrder;
    return { ...mockOrder, step: meta.clientStep as OrderFlowStepId };
  }, [mockOrder, meta]);

  const handleCancel = () => {
    if (!window.confirm("Cancel application? If necessary, we will clarify the details by phone.")) return;
    navigate("/history");
  };

  const downloadAct = () => {
    if (!meta) return;
    const lines = [
      "Certificate of completed work",
      `Order: ${meta.id}`,
      `Device: ${meta.deviceLabel}`,
      `Issue: ${meta.issueSummary}`,
      "",
      "Price:",
      ...(meta.pricing?.items?.map((it) => `- ${it.type === "service" ? "Service" : "Detail"}: ${it.name} — ${formatRub(it.priceRub)}${it.description ? ` (${it.description})` : ""}`) ?? []),
      `Total: ${formatRub(meta.pricing?.totalRub)}`,
      "",
      "Chronology:",
      ...(meta.timeline?.map((t) => `- ${t.atLabel}: ${t.title}${t.description ? ` — ${t.description}` : ""}`) ?? []),
    ].join("\n");
    const blob = new Blob([lines], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `act-${meta.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!orderId) {
    return <Navigate to="/tracking" replace />;
  }

  if (!auth?.accessToken) {
    return <Navigate to={`/login?next=${encodeURIComponent(`/tracking/${orderId}`)}`} replace />;
  }

  if (metaLoading) {
    return (
      <div className={cls.shell}>
        <PageHeader maxWidth="narrow" title="Order" subtitle="Tracking" />
        <div className={cls.body}>
          <SkeletonCard rows={3} />
          <SkeletonCard rows={4} />
        </div>
      </div>
    );
  }

  if (metaError || !meta) {
    return (
      <div className={cls.shell}>
        <PageHeader maxWidth="narrow" title="Order" />
        <div className={cls.body}>
          <p className={cls.emptyState}>Order not found or access not available.</p>
          <Button type="button" variant="outline" onClick={() => navigate("/tracking")}>
            Go to tracking
          </Button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className={cls.shell}>
        <PageHeader maxWidth="narrow" title={meta.deviceLabel} subtitle="Order tracking" />
        <div className={cls.body}>
          <section className={cls.card} aria-label="Device">
            <p className={cls.deviceIssue}>{meta.issueSummary}</p>
          </section>
          <section className={cls.card} aria-label="Order stages">
            <h2 className={cls.cardHeading}>Status</h2>
            <OrderTimeline currentStep={meta.clientStep} variant={isNarrow ? "horizontal" : "vertical"} />
          </section>
          {meta.needsApproval ? (
            <div className={cls.banner}>
              Requires selection of repair option.{" "}
              <Link to={`/orders/${meta.id}/approval`}>Go to approval →</Link>
            </div>
          ) : null}
          <p className={cls.backRow}>
            <Link className={cls.inlineLink} to="/tracking">
              ← All repairs
            </Link>
          </p>
        </div>
      </div>
    );
  }

  const selected = order.quoteOptions?.find((q) => q.id === order.selectedQuoteId);
  const openConfirmPopup = () => {
    setConfirmStars(Math.max(1, Math.min(5, meta.myRating ?? 5)));
    setConfirmReviewText(meta.myReviewText ?? "");
    setConfirmPopupOpen(true);
  };
  const submitCompletionConfirm = async () => {
    try {
      setConfirmSaving(true);
      await confirmClientOrderCompletionApi(order.id, {
        stars: confirmStars,
        reviewText: confirmReviewText.trim() || undefined,
      });
      const nextMeta = await getClientOrderMetaApi(order.id);
      setMeta(nextMeta);
      setConfirmPopupOpen(false);
      showToast("success", "Завершение подтверждено. Спасибо за отзыв!");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Не удалось подтвердить завершение";
      showToast("error", msg);
    } finally {
      setConfirmSaving(false);
    }
  };

  return (
    <div className={cls.shell}>
      <PageHeader maxWidth="narrow" title={`${order.deviceLabel}`} subtitle="Order tracking" />
      <div className={cls.body}>
        <section className={cls.card} aria-label="Device">
          <div className={cls.deviceRow}>
            <div className={cls.devicePhoto} aria-hidden />
            <div>
              <p className={cls.deviceName}>{order.deviceLabel}</p>
              <p className={cls.deviceIssue}>{order.issueSummary}</p>
            </div>
          </div>
        </section>

        <section className={cls.card} aria-label="Order stages">
          <h2 className={cls.cardHeading}>Status</h2>
          <OrderTimeline currentStep={meta.clientStep} variant="horizontal" />
        </section>

        {meta.needsApproval ? (
          <div className={cls.banner}>
            It is necessary to select a repair option after diagnostics.{" "}
            <Link to={`/orders/${order.id}/approval`}>Go to approval →</Link>
          </div>
        ) : null}

        {order.step === "ready" ? (
          <div className={cls.banner}>
            The device is ready for pickup.{" "}
            <Link to={`/orders/${order.id}/pickup`}>Instructions and summary →</Link>
          </div>
        ) : null}
        {meta.canConfirmCompletion ? (
          <div className={cls.banner}>
            Мастер завершил ремонт. Подтвердите завершение и оставьте оценку, чтобы закрыть заказ.{" "}
            <button type="button" className={cls.bannerBtn} onClick={openConfirmPopup}>
              Подтвердить завершение
            </button>
          </div>
        ) : null}

        <section className={cls.card}>
          <h2 className={cls.cardHeading}>Now</h2>
          <OrderStagePanel order={order} selectedTitle={selected?.title} />
        </section>

        <section className={cls.card}>
          <button type="button" className={cls.detailsToggle} onClick={() => setPricingOpen((v) => !v)}>
            Cost {pricingOpen ?"▼" : "▶"}
          </button>
          <p className={cls.meta} style={{ marginTop: 10 }}>
            <strong>Total:</strong>{formatRub(meta.pricing?.totalRub)}
          </p>
          {pricingOpen ? (
            <div className={cls.detailsBody}>
              {meta.pricing?.items?.length ? (
                meta.pricing.items.map((it) => (
                  <p key={it.id}>
                    <strong>{it.type === "service" ? "Service" : "Detail"}:</strong> {it.name}
                    {it.description ? ` · ${it.description}` : ""} ·{" "}
                    <strong>{it.priceRub === 0 ? "For free" : formatRub(it.priceRub)}</strong>
                  </p>
                ))
              ) : (
                <p className={cls.mutedSmall}>The cost has not yet been added by the master.</p>
              )}
            </div>
          ) : null}
        </section>

        <section className={cls.card}>
          <h2 className={cls.cardHeading}>History of work</h2>
          {meta.timeline?.length ? (
            <div style={{ display: "grid", gap: 16 }}>
              {(["diagnostics", "repair"] as const).map((stageKey) => {
                const items = meta.timeline?.filter((t) => t.stage === stageKey) ?? [];
                if (!items.length) return null;
                const title = stageKey === "diagnostics" ? "Diagnostics - sub-items" : "Work/repair - sub-items";
                return (
                  <details key={stageKey} className={cls.detailsGroup} open>
                    <summary className={cls.detailsSummary}>{title}</summary>
                    <div className={cls.detailsBody}>
                      <div style={{ display: "grid", gap: 10 }}>
                        {[...items].reverse().map((item) => (
                          <article
                            key={item.id}
                            style={{ border: "1px solid var(--color-order-row-border)", borderRadius: 10, padding: 12 }}
                          >
                            <p className={cls.meta} style={{ margin: 0 }}>
                              <strong>{item.title}</strong> · {item.atLabel}
                            </p>
                            <p className={cls.mutedSmall}>
                              {item.kind === "stage" ? "Stage" : "Sub-clause"} · {item.stage}
                            </p>
                            {item.description ? <p className={cls.meta} style={{ marginTop: 6 }}>{item.description}</p> : null}
                            {item.photoDataUrls?.length ? (
                              <div
                                style={{
                                  marginTop: 8,
                                  display: "grid",
                                  gridTemplateColumns: "repeat(auto-fill,minmax(84px,1fr))",
                                  gap: 8,
                                }}
                              >
                                {item.photoDataUrls.map((src, idx) => (
                                  <img
                                    key={`${item.id}-${idx}`}
                                    src={src}
                                    alt=""
                                    style={{
                                      width: "100%",
                                      aspectRatio: "1 / 1",
                                      objectFit: "cover",
                                      borderRadius: 8,
                                    }}
                                  />
                                ))}
                              </div>
                            ) : null}
                          </article>
                        ))}
                      </div>
                    </div>
                  </details>
                );
              })}
              {meta.timeline.some((t) => t.stage !== "diagnostics" && t.stage !== "repair") ? (
                <details className={cls.detailsGroup}>
                  <summary className={cls.detailsSummary}>Other stages</summary>
                  <div className={cls.detailsBody}>
                    <div style={{ display: "grid", gap: 10 }}>
                      {[...meta.timeline]
                        .filter((t) => t.stage !== "diagnostics" && t.stage !== "repair")
                        .reverse()
                        .map((item) => (
                          <article
                            key={item.id}
                            style={{ border: "1px solid var(--color-order-row-border)", borderRadius: 10, padding: 12 }}
                          >
                            <p className={cls.meta} style={{ margin: 0 }}>
                              <strong>{item.title}</strong> · {item.atLabel}
                            </p>
                            <p className={cls.mutedSmall}>
                              {item.kind === "stage" ? "Stage" : "Sub-clause"} · {item.stage}
                            </p>
                            {item.description ? <p className={cls.meta} style={{ marginTop: 6 }}>{item.description}</p> : null}
                            {item.photoDataUrls?.length ? (
                              <div
                                style={{
                                  marginTop: 8,
                                  display: "grid",
                                  gridTemplateColumns: "repeat(auto-fill,minmax(84px,1fr))",
                                  gap: 8,
                                }}
                              >
                                {item.photoDataUrls.map((src, idx) => (
                                  <img
                                    key={`${item.id}-${idx}`}
                                    src={src}
                                    alt=""
                                    style={{
                                      width: "100%",
                                      aspectRatio: "1 / 1",
                                      objectFit: "cover",
                                      borderRadius: 8,
                                    }}
                                  />
                                ))}
                              </div>
                            ) : null}
                          </article>
                        ))}
                    </div>
                  </div>
                </details>
              ) : null}
            </div>
          ) : (
            <p className={cls.emptyState}>The master has not yet added a detailed chronology.</p>
          )}
        </section>

        <section className={cls.card}>
          <h2 className={cls.cardHeading}>Brief summary</h2>
          <p className={cls.meta}>
            <strong>Created:</strong>{order.createdAtLabel}
            <br />
            <strong>Updated:</strong>{order.updatedAtLabel}
            <br />
            <strong>Visit:</strong>{order.visitMode ==="asap" ? "Coming soon" : order.visitSlotLabel ?? "—"}
            <br />
            <strong>Reception:</strong> {order.bringInPerson ?"I'll bring it personally" : "Delivery/other"}
            {order.needsConsultation ? " · need advice" : ""}
          </p>
          <p className={cls.meta}>
            <strong>Warranty:</strong>{order.warrantyDays} days.
          </p>
          {order.finalPriceRub != null ? (
            <p className={cls.meta}>
              <strong>Result:</strong>{formatRub(order.finalPriceRub)}
              {selected ? ` · ${selected.title}` : ""}
            </p>
          ) : null}
          <div className={cls.actions}>
            <Button type="button" variant="outline" onClick={() => window.open(`tel:${SITE.phoneTel}`)}>
              Contact the service
            </Button>
            <Button type="button" variant="outline" onClick={downloadAct} disabled={meta.clientStep !== "completed"}>
              Download the act
            </Button>
            <Button type="button" variant="ghost" onClick={handleCancel}>
              Cancel application
            </Button>
          </div>
        </section>

        <section className={cls.card}>
          <button type="button" className={cls.detailsToggle} onClick={() => setDetailsOpen((v) => !v)}>
            More details about the repair {detailsOpen ?"▼" : "▶"}
          </button>
          {detailsOpen ? (
            <div className={cls.detailsBody}>
              <p>
                <strong>Breakdown:</strong>{order.diagnosisDetail ?? order.diagnosisProblem ?? order.issueSummary}
              </p>
              {selected ? (
                <p>
                  <strong>Selected option:</strong>{selected.title}
                  {selected.subtitle ? ` — ${selected.subtitle}` : ""}
                </p>
              ) : null}
              {selected && !selected.isOriginal ? (
                <p className={cls.disclaimer}>
                  The part is not original. There may be differences in color or brightness; for productivity
                  it has no effect.
                </p>
              ) : null}
              <p className={cls.mutedSmall}>Warranty for work and parts - according to the contract and the selected option.</p>
            </div>
          ) : null}
        </section>

        <p className={cls.backRow}>
          <Link className={cls.inlineLink} to="/tracking">
            ← All repairs
          </Link>
        </p>
      </div>
      {confirmPopupOpen ? (
        <div className={cls.overlay} onClick={() => !confirmSaving && setConfirmPopupOpen(false)}>
          <div className={cls.popup} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <h3 className={cls.popupTitle}>Подтверждение завершения</h3>
            <p className={cls.popupText}>Оцените качество ремонта и при желании оставьте отзыв.</p>
            <label className={cls.popupField}>
              <span>Оценка</span>
              <select
                value={confirmStars}
                onChange={(e) => setConfirmStars(Number(e.target.value))}
                className={cls.popupInput}
              >
                <option value={5}>5 ⭐</option>
                <option value={4}>4 ⭐</option>
                <option value={3}>3 ⭐</option>
                <option value={2}>2 ⭐</option>
                <option value={1}>1 ⭐</option>
              </select>
            </label>
            <label className={cls.popupField}>
              <span>Отзыв (необязательно)</span>
              <textarea
                value={confirmReviewText}
                onChange={(e) => setConfirmReviewText(e.target.value)}
                rows={4}
                className={cls.popupInput}
                maxLength={1200}
                placeholder="Например: сделали быстро, всё работает отлично"
              />
            </label>
            <div className={cls.popupActions}>
              <Button type="button" variant="outline" onClick={() => setConfirmPopupOpen(false)} disabled={confirmSaving}>
                Позже
              </Button>
              <Button type="button" onClick={() => void submitCompletionConfirm()} disabled={confirmSaving}>
                {confirmSaving ? "Сохраняем..." : "Подтвердить"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
      {toast ? <StatusToast tone={toast.tone} message={toast.message} onClose={closeToast} /> : null}
    </div>
  );
};
