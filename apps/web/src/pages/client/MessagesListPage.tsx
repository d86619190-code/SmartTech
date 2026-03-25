import * as React from "react";
import { Link } from "react-router-dom";
import { getInboxSummaryApi, resolveApprovalApi } from "@/shared/lib/clientInboxApi";
import { streamUpdatesLabel } from "@/shared/lib/realtime/streamStatusLabel";
import { useInboxSummarySse } from "@/shared/lib/realtime/useSseStreams";
import { useStatusToast } from "@/shared/lib/useStatusToast";
import { StatusToast } from "@/shared/ui/StatusToast/StatusToast";
import { PageHeader } from "@/widgets/PageHeader";
import cls from "./clientPages.module.css";

export const MessagesListPage: React.FC = () => {
  const [loading, setLoading] = React.useState(true);
  const [approvals, setApprovals] = React.useState<Awaited<ReturnType<typeof getInboxSummaryApi>>["approvals"]>([]);
  const [threads, setThreads] = React.useState<Awaited<ReturnType<typeof getInboxSummaryApi>>["threads"]>([]);
  const [busyApprovalId, setBusyApprovalId] = React.useState<string | null>(null);
  const { toast, showToast, closeToast } = useStatusToast();

  const onInbox = React.useCallback((summary: Awaited<ReturnType<typeof getInboxSummaryApi>>) => {
    setApprovals(summary.approvals);
    setThreads(summary.threads);
    setLoading(false);
  }, []);

  const streamStatus = useInboxSummarySse(true, onInbox);

  const loadInbox = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await getInboxSummaryApi();
      setApprovals(data.approvals);
      setThreads(data.threads);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Не удалось загрузить сообщения";
      showToast("error", msg);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  React.useEffect(() => {
    void loadInbox();
  }, [loadInbox]);

  const onResolve = React.useCallback(
    async (approvalId: string, decision: "approved" | "declined") => {
      setBusyApprovalId(approvalId);
      try {
        await resolveApprovalApi(approvalId, decision);
        await loadInbox();
        showToast("success", decision === "approved" ? "Согласование подтверждено" : "Согласование отклонено");
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Не удалось обновить согласование";
        showToast("error", msg);
      } finally {
        setBusyApprovalId(null);
      }
    },
    [loadInbox, showToast]
  );

  return (
    <div className={cls.shell}>
      <PageHeader title="Сообщения" subtitle="Переписка с сервисом по вашим заказам." />
      <div className={cls.body}>
        <section className={cls.card}>
          <h2 className={cls.h2}>Нужно ваше решение</h2>
          <p className={cls.streamStatus}>{streamUpdatesLabel(streamStatus)}</p>
          {approvals.length === 0 ? (
            <p className={cls.lead}>Новых согласований сейчас нет. Когда понадобится ваш выбор, мы покажем его здесь.</p>
          ) : (
            <div className={cls.approvalsList}>
              {approvals.map((item) => (
                <article key={item.id} className={cls.approvalRow}>
                  <p className={cls.approvalLabel}>{item.label}</p>
                  <div className={cls.approvalActions}>
                    <Link className={cls.approvalLink} to={`/orders/${item.orderId}/approval`}>
                      Открыть
                    </Link>
                    <button
                      type="button"
                      className={cls.approvalGhost}
                      disabled={busyApprovalId === item.id}
                      onClick={() => void onResolve(item.id, "approved")}
                    >
                      Согласовать
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className={cls.card} style={{ padding: 0 }}>
          {loading ? (
            <p className={cls.lead} style={{ padding: 24 }}>
              Загрузка...
            </p>
          ) : threads.length === 0 ? (
            <p className={cls.lead} style={{ padding: 24 }}>
              Нет активных диалогов.
            </p>
          ) : (
            <div className={cls.threadList}>
              {threads.map((thread) => {
                return (
                  <Link key={thread.orderId} className={cls.threadRow} to={`/messages/${thread.orderId}`}>
                    <div className={cls.threadHead}>
                      <div className={cls.threadTitle}>{thread.title}</div>
                      {thread.unreadCount > 0 ? <span className={cls.threadUnread}>{thread.unreadCount}</span> : null}
                    </div>
                    <div className={cls.threadMeta}>{thread.preview}</div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>
      {toast ? <StatusToast tone={toast.tone} message={toast.message} onClose={closeToast} /> : null}
    </div>
  );
};
