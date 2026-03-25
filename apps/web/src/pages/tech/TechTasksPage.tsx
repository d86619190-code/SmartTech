import * as React from "react";
import { useNavigate } from "react-router-dom";
import { techApi } from "@/shared/lib/techApi";
import { formatRub } from "@/shared/lib/formatMoney";
import { AdminInput, AdminSelect, AdminTable, AdminTd, AdminTh, FilterBar } from "@/widgets/admin";
import { TechCard, TechPageHeader, TechStageBadge } from "@/widgets/technician";
import cls from "./techPages.module.css";

function ArrowGoIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export const TechTasksPage: React.FC = () => {
  const navigate = useNavigate();
  const [q, setQ] = React.useState("");
  const [status, setStatus] = React.useState("all");
  const [incoming, setIncoming] = React.useState<any[]>([]);
  const [repairs, setRepairs] = React.useState<any[]>([]);
  const loadTasks = React.useCallback(async () => {
    const res = await techApi.getTasks();
    setIncoming(res.incoming);
    setRepairs(res.repairs);
  }, []);
  React.useEffect(() => {
    void loadTasks();
    const timer = window.setInterval(() => {
      void loadTasks();
    }, 3000);
    return () => window.clearInterval(timer);
  }, [loadTasks]);

  const rows = React.useMemo(() => {
    const qq = q.trim().toLowerCase();
    const repairsRows = repairs.map((r) => ({ kind: "repair" as const, ...r }));
    const incomingRows = incoming
      .filter((i) => i.status === "pending")
      .map((i) => ({
        kind: "incoming" as const,
        id: i.id,
        publicId: i.publicId,
        device: i.device,
        customer: i.clientName,
        clientAvatarUrl: i.clientAvatarUrl as string | undefined,
        stage: "incoming" as const,
        sum: 0,
      }));
    const all = [...incomingRows, ...repairsRows];
    return all.filter((row) => {
      if (status === "incoming" && row.kind !== "incoming") return false;
      if (status === "repair" && row.kind !== "repair") return false;
      if (!qq) return true;
      return `${row.publicId} ${row.device} ${row.customer}`.toLowerCase().includes(qq);
    });
  }, [q, status, incoming, repairs]);

  return (
    <>
      <TechPageHeader title="Все задачи" subtitle="Входящие и назначенные ремонты: поиск и фильтры." />
      <FilterBar>
        <AdminInput placeholder="Поиск…" value={q} onChange={(e) => setQ(e.target.value)} />
        <AdminSelect value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">Все</option>
          <option value="incoming">Только входящие</option>
          <option value="repair">Только ремонты</option>
        </AdminSelect>
      </FilterBar>
      <TechCard style={{ padding: 0 }}>
        <AdminTable>
          <thead>
            <tr>
              <AdminTh>Заказ</AdminTh>
              <AdminTh>Устройство</AdminTh>
              <AdminTh>Клиент</AdminTh>
              <AdminTh>Статус</AdminTh>
              <AdminTh>Сумма</AdminTh>
              <AdminTh style={{ width: 52 }} aria-label="Открыть" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) =>
              row.kind === "incoming" ? (
                <tr
                  key={row.id}
                  className={cls.taskRowClick}
                  onClick={() => navigate(`/tech/incoming/${row.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      navigate(`/tech/incoming/${row.id}`);
                    }
                  }}
                  tabIndex={0}
                  role="link"
                >
                  <AdminTd>
                    <strong>{row.publicId}</strong>
                  </AdminTd>
                  <AdminTd>{row.device}</AdminTd>
                  <AdminTd>
                    <span className={cls.customerCell}>
                      {row.clientAvatarUrl ? <img src={row.clientAvatarUrl} alt="" className={cls.customerAvatar} /> : null}
                      <span>{row.customer}</span>
                    </span>
                  </AdminTd>
                  <AdminTd>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "var(--color-text-muted)" }}>Входящая</span>
                  </AdminTd>
                  <AdminTd>—</AdminTd>
                  <AdminTd>
                    <span className={cls.taskGo} title="Открыть заявку">
                      <ArrowGoIcon />
                    </span>
                  </AdminTd>
                </tr>
              ) : (
                <tr
                  key={row.id}
                  className={cls.taskRowClick}
                  onClick={() => navigate(`/tech/repairs/${row.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      navigate(`/tech/repairs/${row.id}`);
                    }
                  }}
                  tabIndex={0}
                  role="link"
                >
                  <AdminTd>
                    <strong>{row.publicId}</strong>
                  </AdminTd>
                  <AdminTd>{row.device}</AdminTd>
                  <AdminTd>{row.customer}</AdminTd>
                  <AdminTd>
                    <TechStageBadge stage={row.stage} />
                  </AdminTd>
                  <AdminTd>{formatRub(row.laborRub + row.partsRub)}</AdminTd>
                  <AdminTd>
                    <span className={cls.taskGo} title="Открыть карточку">
                      <ArrowGoIcon />
                    </span>
                  </AdminTd>
                </tr>
              )
            )}
          </tbody>
        </AdminTable>
      </TechCard>
    </>
  );
};
