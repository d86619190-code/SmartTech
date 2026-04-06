import * as React from "react";
import { Link } from "react-router-dom";
import { getInboxSummaryApi, resolveApprovalApi } from "@/shared/lib/clientInboxApi";
import { streamUpdatesLabel } from "@/shared/lib/realtime/streamStatusLabel";
import { useInboxSummarySse } from "@/shared/lib/realtime/useSseStreams";
import { useStatusToast } from "@/shared/lib/useStatusToast";
import { StatusToast } from "@/shared/ui/StatusToast/StatusToast";
import { PageHeader } from "@/widgets/PageHeader";
import cls from "./clientPages.module.css";

function formatThreadLastTime(ts: number): string {
  if (!ts) return "";
  const d = new Date(ts);
  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startMsg = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diffDays = Math.round((startToday - startMsg) / 86400000);
  const pad = (n: number) => String(n).padStart(2, "0");
  const hm = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  if (diffDays === 0) return hm;
  if (diffDays === 1) return `yesterday ${hm}`;
  if (diffDays < 7) {
    const w = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return `${w[d.getDay()]} ${hm}`;
  }
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}`;
}

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
      const msg = e instanceof Error ? e.message : "Failed to load messages";
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
        showToast("success", decision === "approved" ? "Agreement confirmed" : "Agreement rejected");
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to update reconciliation";
        showToast("error", msg);
      } finally {
        setBusyApprovalId(null);
      }
    },
    [loadInbox, showToast]
  );

  return (
    <div className={cls.shell}>
      <PageHeader title="Messages" subtitle="Correspondence with the service regarding your orders." />
      <div className={cls.body}>
        {approvals.length > 0 ? (
          <section className={cls.card}>
            <h2 className={cls.h2}>We need your solution</h2>
            <p className={cls.streamStatus}>{streamUpdatesLabel(streamStatus)}</p>
            <div className={cls.approvalsList}>
              {approvals.map((item) => (
                <article key={item.id} className={cls.approvalRow}>
                  <p className={cls.approvalLabel}>{item.label}</p>
                  <div className={cls.approvalActions}>
                    <Link className={cls.approvalLink} to={`/orders/${item.orderId}/approval`}>
                      Open
                    </Link>
                    <button
                      type="button"
                      className={cls.approvalGhost}
                      disabled={busyApprovalId === item.id}
                      onClick={() => void onResolve(item.id, "approved")}
                    >
                      Approve
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        <section className={cls.card} style={{ padding: 0 }}>
          {loading ? (
            <p className={cls.lead} style={{ padding: 24 }}>
              Loading dialogues...
            </p>
          ) : threads.length === 0 ? (
            <p className={cls.emptyState} style={{ padding: 24 }}>
              There are no active dialogs.
            </p>
          ) : (
            <div className={cls.threadList}>
              {threads.map((thread) => {
                const name = thread.counterpartName?.trim() || "Master";
                const avatar = thread.counterpartAvatarUrl?.trim();
                const timeLabel = formatThreadLastTime(thread.lastAt);
                return (
                  <Link key={thread.orderId} className={cls.threadRow} to={`/messages/${thread.orderId}`}>
                    <div className={cls.threadAvatarWrap} aria-hidden>
                      {avatar ? (
                        <img className={cls.threadAvatar} src={avatar} alt="" decoding="async" />
                      ) : (
                        <div className={cls.threadAvatarFallback}>{name.slice(0, 1).toUpperCase()}</div>
                      )}
                      <span
                        className={cls.threadOnlineOnAvatar}
                        data-visible={thread.counterpartOnline ? "true" : "false"}
                      />
                    </div>
                    <div className={cls.threadRowMain}>
                      <div className={cls.threadHead}>
                        <div className={cls.threadTitleCol}>
                          <div className={cls.threadCounterpartRow}>
                            <span className={cls.threadCounterpartName}>{name}</span>
                            <span className={cls.threadDeviceName}>{thread.title}</span>
                          </div>
                          {thread.orderPublicId || thread.issueSummary ? (
                            <div className={cls.threadSubMeta}>
                              {thread.orderPublicId ? (
                                <span className={cls.threadOrderId}>№ {thread.orderPublicId}</span>
                              ) : null}
                              {thread.orderPublicId && thread.issueSummary ? (
                                <span className={cls.threadSubMetaSep} aria-hidden>
                                  ·
                                </span>
                              ) : null}
                              {thread.issueSummary ? (
                                <span className={cls.threadIssue} title={thread.issueSummary}>
                                  {thread.issueSummary}
                                </span>
                              ) : null}
                            </div>
                          ) : null}
                        </div>
                        <div className={cls.threadHeadRight}>
                          {timeLabel ? <span className={cls.threadTime}>{timeLabel}</span> : null}
                          {thread.unreadCount > 0 ? <span className={cls.threadUnread}>{thread.unreadCount}</span> : null}
                        </div>
                      </div>
                      <div className={cls.threadPreviewLine}>{thread.preview || "No messages"}</div>
                    </div>
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
