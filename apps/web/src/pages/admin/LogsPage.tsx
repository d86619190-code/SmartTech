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
      <AdminPageHeader title="Magazine and events" subtitle="System logs, order actions and notifications." />
      <FilterBar>
        <AdminInput placeholder="Search by text or time..." value={q} onChange={(e) => setQ(e.target.value)} />
      </FilterBar>
      <AdminCard>
        <ActivityFeed title="Event feed" items={items} />
      </AdminCard>
    </>
  );
};
