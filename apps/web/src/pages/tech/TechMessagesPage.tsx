import * as React from "react";
import { Link } from "react-router-dom";
import { techApi } from "@/shared/lib/techApi";
import { TechCard, TechPageHeader } from "@/widgets/technician";
import cls from "./techPages.module.css";

export const TechMessagesPage: React.FC = () => {
  const [threads, setThreads] = React.useState<any[]>([]);
  const load = React.useCallback(async () => {
    const res = await techApi.getThreads();
    setThreads(res.rows);
  }, []);
  React.useEffect(() => {
    void load();
    const t = window.setInterval(() => {
      void load();
    }, 2500);
    return () => window.clearInterval(t);
  }, [load]);
  return (
    <>
      <TechPageHeader title="Сообщения" subtitle="Переписка с клиентами по заказам." />
      <TechCard style={{ padding: 0 }}>
        <div className={cls.threadList}>
          {threads.map((t) => (
            <Link key={t.id} className={cls.threadItem} to={`/tech/messages/${t.id}`}>
              <div className={cls.threadName}>{t.clientName}</div>
              {t.unreadCount > 0 ? <div className={cls.threadUnread}>{t.unreadCount}</div> : null}
              <div className={cls.muted}>{t.orderPublicId}</div>
              <div className={cls.threadPreview}>{t.lastMessage}</div>
              <div className={cls.muted} style={{ marginTop: 6 }}>
                {t.updatedAt}
              </div>
            </Link>
          ))}
        </div>
      </TechCard>
    </>
  );
};
