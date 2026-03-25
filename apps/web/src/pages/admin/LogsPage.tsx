import * as React from "react";
import { getAdminLogsApi } from "@/shared/lib/adminPanelApi";
import { AdminCard, AdminInput, AdminPageHeader, ActivityFeed, FilterBar } from "@/widgets/admin";

export const AdminLogsPage: React.FC = () => {
  const [q, setQ] = React.useState("");
  const [logs, setLogs] = React.useState<any[]>([]);
  React.useEffect(() => {
    void (async () => {
      const res = await getAdminLogsApi();
      setLogs(res.logs);
    })();
  }, []);
  const items = React.useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return logs;
    return logs.filter((l) => l.message.toLowerCase().includes(qq) || l.at.includes(qq));
  }, [q, logs]);

  return (
    <>
      <AdminPageHeader title="Журнал и события" subtitle="Системные логи, действия по заказам и уведомления." />
      <FilterBar>
        <AdminInput placeholder="Поиск по тексту или времени…" value={q} onChange={(e) => setQ(e.target.value)} />
      </FilterBar>
      <AdminCard>
        <ActivityFeed title="Лента событий" items={items} />
      </AdminCard>
    </>
  );
};
