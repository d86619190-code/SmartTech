import * as React from "react";
import { useNavigate } from "react-router-dom";
import { readAuthSession } from "@/shared/lib/authSession";
import { getInboxSummaryApi, type InboxApproval } from "@/shared/lib/clientInboxApi";
import { SkeletonBone } from "@/shared/ui/Skeleton";
import { Button } from "@/shared/ui/Button/Button";
import { PageHeader } from "@/widgets/PageHeader";
import cls from "./NotificationsPage.module.css";

export const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const auth = readAuthSession();
  const [approvals, setApprovals] = React.useState<InboxApproval[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!auth?.accessToken) {
      setApprovals([]);
      setLoading(false);
      return;
    }
    let mounted = true;
    void (async () => {
      setLoading(true);
      try {
        const summary = await getInboxSummaryApi();
        if (mounted) setApprovals(summary.approvals);
      } catch {
        if (mounted) setApprovals([]);
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
      <div className={cls.inner}>
        <PageHeader embedded title="Уведомления" subtitle="Согласования и напоминания по заказам." />

        {loading || !auth?.accessToken || approvals.length > 0 ? (
          <section className={cls.card} aria-labelledby="approvals-heading">
            <h2 id="approvals-heading" className={cls.cardTitle}>
              Нужно ваше решение
            </h2>

            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingTop: 4 }} aria-hidden>
                <SkeletonBone style={{ height: 18, width: "72%", borderRadius: 8 }} />
                <SkeletonBone style={{ height: 14, width: "100%", borderRadius: 8 }} />
                <SkeletonBone style={{ height: 14, width: "55%", borderRadius: 8 }} />
                <SkeletonBone style={{ height: 40, width: 200, borderRadius: 12, marginTop: 8 }} />
              </div>
            ) : !auth?.accessToken ? (
              <p className={cls.empty}>Войдите в аккаунт, чтобы видеть согласования.</p>
            ) : (
              <div className={cls.list}>
                {approvals.map((item) => (
                  <article key={item.id} className={cls.row}>
                    <p className={cls.label}>{item.label}</p>
                    <Button type="button" onClick={() => navigate(`/orders/${item.orderId}/approval`)}>
                      Перейти к согласованию
                    </Button>
                  </article>
                ))}
              </div>
            )}
          </section>
        ) : null}
      </div>
    </div>
  );
};
