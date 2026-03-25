import * as React from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import type { ServiceOrder } from "@/entities/order";
import { getClientOrderMetaApi, getInboxSummaryApi, resolveApprovalApi } from "@/shared/lib/clientInboxApi";
import { useStatusToast } from "@/shared/lib/useStatusToast";
import { StatusToast } from "@/shared/ui/StatusToast/StatusToast";
import { SkeletonCard } from "@/shared/ui/Skeleton";
import { PageHeader } from "@/widgets/PageHeader";
import { RepairApproval } from "@/widgets/RepairApproval";
import cls from "./OrderRepairApprovalPage.module.css";

export const OrderRepairApprovalPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [approvalId, setApprovalId] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [meta, setMeta] = React.useState<Awaited<ReturnType<typeof getClientOrderMetaApi>> | null>(null);
  const [metaLoading, setMetaLoading] = React.useState(true);
  const { toast, showToast, closeToast } = useStatusToast();

  React.useEffect(() => {
    if (!orderId) return;
    let mounted = true;
    void (async () => {
      setMetaLoading(true);
      try {
        const [m, inbox] = await Promise.all([getClientOrderMetaApi(orderId), getInboxSummaryApi()]);
        if (!mounted) return;
        setMeta(m);
        const hit = inbox.approvals.find((a) => a.orderId === orderId);
        setApprovalId(hit?.id ?? null);
      } catch {
        if (mounted) {
          setMeta(null);
          setApprovalId(null);
        }
      } finally {
        if (mounted) setMetaLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [orderId]);

  if (!orderId) {
    return <Navigate to="/tracking" replace />;
  }
  if (metaLoading) {
    return (
      <div className={cls.shell}>
        <PageHeader title="Согласование ремонта" />
        <div className={cls.body}>
          <SkeletonCard rows={3} />
          <SkeletonCard rows={4} />
        </div>
      </div>
    );
  }

  if (!meta) {
    return <Navigate to="/tracking" replace />;
  }

  if (!meta.needsApproval) {
    return <Navigate to={`/tracking/${orderId}`} replace />;
  }

  const order: ServiceOrder = {
    id: orderId,
    deviceLabel: meta.deviceLabel,
    issueSummary: meta.issueSummary,
    step: "awaiting_approval",
    createdAtLabel: "",
    updatedAtLabel: "",
    visitMode: "asap",
    bringInPerson: true,
    needsConsultation: false,
    photoUrls: [],
    warrantyDays: 90,
    diagnosisProblem: meta.issueSummary,
    diagnosisDetail: "Мастер отправил смету и ждёт ваше решение.",
    diagnosticFeeRub: 990,
    quoteOptions:
      meta.quoteOptions && meta.quoteOptions.length > 0
        ? meta.quoteOptions
        : [
            {
              id: "opt-fast",
              title: "Ремонт с доступной деталью",
              subtitle: "Быстрее, при наличии на складе",
              availability: "in_stock",
              isOriginal: false,
              repairDaysLabel: "1-2 дня",
              priceRub: 6900,
            },
            {
              id: "opt-oem",
              title: "Ремонт с оригинальной деталью",
              subtitle: "Надежнее, может потребоваться ожидание",
              availability: "on_order",
              orderLeadDays: 2,
              isOriginal: true,
              repairDaysLabel: "2-4 дня",
              priceRub: 9900,
            },
          ],
  };

  return (
    <div className={cls.shell}>
      <PageHeader title="Согласование ремонта" />
      <div className={cls.body}>
        <div className={cls.contentCard}>
          <RepairApproval
            order={order}
            onConfirmOption={(optionId) => {
              void optionId;
              if (!approvalId) {
                navigate(`/tracking/${order.id}`);
                return;
              }
              void (async () => {
                setBusy(true);
                try {
                  await resolveApprovalApi(approvalId, "approved", optionId);
                  showToast("success", "Согласование подтверждено");
                  navigate(`/tracking/${order.id}`);
                } catch (e) {
                  const msg = e instanceof Error ? e.message : "Не удалось отправить согласование";
                  showToast("error", msg);
                } finally {
                  setBusy(false);
                }
              })();
            }}
            onDeclinePayDiagnostic={() => {
              if (!approvalId) {
                navigate(`/tracking/${order.id}`);
                return;
              }
              void (async () => {
                setBusy(true);
                try {
                  await resolveApprovalApi(approvalId, "declined");
                  showToast("info", "Отказ отправлен");
                  navigate(`/tracking/${order.id}`);
                } catch (e) {
                  const msg = e instanceof Error ? e.message : "Не удалось отправить отказ";
                  showToast("error", msg);
                } finally {
                  setBusy(false);
                }
              })();
            }}
          />
          {busy ? <p className={cls.lead}>Отправляем решение...</p> : null}
        </div>
      </div>
      {toast ? <StatusToast tone={toast.tone} message={toast.message} onClose={closeToast} /> : null}
    </div>
  );
};
