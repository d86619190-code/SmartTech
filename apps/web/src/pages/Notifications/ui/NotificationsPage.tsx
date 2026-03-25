import * as React from "react";
import { useNavigate } from "react-router-dom";
import { readAuthSession } from "@/shared/lib/authSession";
import { getInboxSummaryApi, type InboxApproval } from "@/shared/lib/clientInboxApi";
import { Button } from "@/shared/ui/Button/Button";
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
        <h1 className={cls.title}>Уведомления</h1>

        <section className={cls.card} aria-labelledby="approvals-heading">
          <h2 id="approvals-heading" className={cls.cardTitle}>
            Нужно ваше решение
          </h2>

          {loading ? (
            <p className={cls.empty}>Загрузка…</p>
          ) : !auth?.accessToken ? (
            <p className={cls.empty}>Войдите в аккаунт, чтобы видеть согласования.</p>
          ) : approvals.length === 0 ? (
            <p className={cls.empty}>Новых согласований сейчас нет. Когда понадобится ваш выбор, мы покажем его здесь.</p>
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
      </div>
    </div>
  );
};
