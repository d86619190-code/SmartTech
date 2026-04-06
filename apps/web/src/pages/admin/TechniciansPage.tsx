import * as React from "react";
import { Link } from "react-router-dom";
import { getAdminTechniciansApi } from "@/shared/lib/adminPanelApi";
import { formatRub } from "@/shared/lib/formatMoney";
import { AdminInput, AdminPageHeader, AdminTable, AdminTd, AdminTh, FilterBar } from "@/widgets/admin";
import cls from "./adminPages.module.css";

export const AdminTechniciansPage: React.FC = () => {
  const [q, setQ] = React.useState("");
  const [tech, setTech] = React.useState<any[]>([]);

  React.useEffect(() => {
    void (async () => {
      const res = await getAdminTechniciansApi();
      setTech(res.technicians);
    })();
  }, []);

  const rows = React.useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return tech;
    return tech.filter((t) => `${t.name} ${t.specialty}`.toLowerCase().includes(qq));
  }, [q, tech]);

  return (
    <>
      <AdminPageHeader title="Masters" subtitle="Workload, rating and productivity of service engineers." />
      <FilterBar>
        <AdminInput placeholder="Search by name or specialization..." value={q} onChange={(e) => setQ(e.target.value)} />
      </FilterBar>
      <AdminTable>
        <thead>
          <tr>
            <AdminTh>Master</AdminTh>
            <AdminTh>Specialization</AdminTh>
            <AdminTh>In progress</AdminTh>
            <AdminTh>Rating</AdminTh>
            <AdminTh>Completed</AdminTh>
            <AdminTh>Revenue (total)</AdminTh>
            <AdminTh />
          </tr>
        </thead>
        <tbody>
          {rows.map((t) => (
            <tr key={t.id}>
              <AdminTd>
                <strong>{t.name}</strong>
              </AdminTd>
              <AdminTd>{t.specialty}</AdminTd>
              <AdminTd>{t.activeOrders}</AdminTd>
              <AdminTd>{t.rating.toFixed(1)}</AdminTd>
              <AdminTd>{t.completed}</AdminTd>
              <AdminTd>{formatRub(t.revenueRub)}</AdminTd>
              <AdminTd>
                <Link className={cls.link} to={`/admin/technicians/${t.id}`}>
                  More details
                </Link>
              </AdminTd>
            </tr>
          ))}
        </tbody>
      </AdminTable>
    </>
  );
};
