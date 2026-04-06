import * as React from "react";
import { Link } from "react-router-dom";
import type { AdminOrderRow, AdminOrderStatus } from "@/entities/admin";
import { getAdminOrdersApi } from "@/shared/lib/adminPanelApi";
import { formatRub } from "@/shared/lib/formatMoney";
import { Button } from "@/shared/ui/Button/Button";
import {
  AdminInput,
  AdminPageHeader,
  AdminSelect,
  AdminStatusBadge,
  AdminTable,
  AdminTd,
  AdminTh,
  FilterBar,
} from "@/widgets/admin";
import cls from "./adminPages.module.css";

const STATUS_OPTS: { value: string; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "new", label: "New" },
  { value: "diagnostics", label: "Diagnostics" },
  { value: "approval", label: "Coordination" },
  { value: "in_progress", label: "In progress" },
  { value: "ready", label: "Ready" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Canceled" },
];

const DEVICE_OPTS = [
  { value: "all", label: "All devices" },
  { value: "phone", label: "Telephone" },
  { value: "tablet", label: "Tablet" },
  { value: "laptop", label: "Laptop" },
];

const TECH_OPTS = [
  { value: "all", label: "All masters" },
  { value: "I. Petrov", label: "I. Petrov" },
  { value: "K. Orlov", label: "K. Orlov" },
  { value: "S. Nikolaev", label: "S. Nikolaev" },
  { value: "__unassigned", label: "Not assigned" },
];

type SortKey = "createdAt" | "publicId" | "totalRub" | "customer";

function compare(a: AdminOrderRow, b: AdminOrderRow, key: SortKey, dir: "asc" | "desc"): number {
  const mul = dir === "asc" ? 1 : -1;
  if (key === "totalRub") return (a.totalRub - b.totalRub) * mul;
  return String(a[key]).localeCompare(String(b[key]), "ru") * mul;
}

export const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = React.useState<AdminOrderRow[]>([]);
  const [q, setQ] = React.useState("");
  const [status, setStatus] = React.useState("all");
  const [device, setDevice] = React.useState("all");
  const [tech, setTech] = React.useState("all");
  const [sortKey, setSortKey] = React.useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("desc");
  const [visible, setVisible] = React.useState(12);

  React.useEffect(() => {
    void (async () => {
      const res = await getAdminOrdersApi();
      setOrders(res.orders as AdminOrderRow[]);
    })();
  }, []);

  const filtered = React.useMemo(() => {
    const qq = q.trim().toLowerCase();
    return orders.filter((o) => {
      if (status !== "all" && o.status !== (status as AdminOrderStatus)) return false;
      if (device !== "all" && o.deviceType !== device) return false;
      if (tech === "__unassigned" && o.technician !== null) return false;
      if (tech !== "all" && tech !== "__unassigned" && o.technician !== tech) return false;
      if (!qq) return true;
      const blob = `${o.publicId} ${o.device} ${o.customer} ${o.phone}`.toLowerCase();
      return blob.includes(qq);
    });
  }, [q, status, device, tech, orders]);

  const sorted = React.useMemo(() => {
    const copy = [...filtered];
    copy.sort((a, b) => compare(a, b, sortKey, sortDir));
    return copy;
  }, [filtered, sortKey, sortDir]);

  const page = sorted.slice(0, visible);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir(key === "createdAt" || key === "totalRub" ? "desc" : "asc");
    }
  };

  const sortLabel = (key: SortKey, label: string) => (
    <button type="button" className={cls.sortBtn} onClick={() => toggleSort(key)}>
      {label}
      {sortKey === key ? (sortDir === "asc" ? " ↑" : " ↓") : ""}
    </button>
  );

  return (
    <>
      <AdminPageHeader title="Orders" subtitle="All repair requests: filtering, searching and actions by line." />
      <FilterBar>
        <AdminInput placeholder="Search by No., device, client..." value={q} onChange={(e) => setQ(e.target.value)} />
        <AdminSelect value={status} onChange={(e) => setStatus(e.target.value)}>
          {STATUS_OPTS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </AdminSelect>
        <AdminSelect value={device} onChange={(e) => setDevice(e.target.value)}>
          {DEVICE_OPTS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </AdminSelect>
        <AdminSelect value={tech} onChange={(e) => setTech(e.target.value)}>
          {TECH_OPTS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </AdminSelect>
      </FilterBar>
      <AdminTable>
        <thead>
          <tr>
            <AdminTh>{sortLabel("publicId", "№ order")}</AdminTh>
            <AdminTh>Device</AdminTh>
            <AdminTh>{sortLabel("customer", "Client")}</AdminTh>
            <AdminTh>Status</AdminTh>
            <AdminTh>Master</AdminTh>
            <AdminTh>{sortLabel("totalRub", "Sum")}</AdminTh>
            <AdminTh>{sortLabel("createdAt", "Date")}</AdminTh>
            <AdminTh>Actions</AdminTh>
          </tr>
        </thead>
        <tbody>
          {page.map((o) => (
            <tr key={o.id}>
              <AdminTd>
                <strong>{o.publicId}</strong>
              </AdminTd>
              <AdminTd>{o.device}</AdminTd>
              <AdminTd>
                <div>{o.customer}</div>
                <div className={cls.muted}>{o.phone}</div>
              </AdminTd>
              <AdminTd>
                <AdminStatusBadge status={o.status} />
              </AdminTd>
              <AdminTd>{o.technician ?? "—"}</AdminTd>
              <AdminTd>{formatRub(o.totalRub)}</AdminTd>
              <AdminTd>{o.createdAt}</AdminTd>
              <AdminTd>
                <Link className={cls.link} to={`/admin/orders/${o.id}`}>
                  Card
                </Link>
              </AdminTd>
            </tr>
          ))}
        </tbody>
      </AdminTable>
      {visible < sorted.length && (
        <div style={{ marginTop: 16 }}>
          <Button type="button" variant="outline" onClick={() => setVisible((v) => v + 12)}>
            Show more ({sorted.length - visible})
          </Button>
        </div>
      )}
    </>
  );
};
