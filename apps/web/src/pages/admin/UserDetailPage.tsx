import * as React from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { getAdminMockUserByIdApi } from "@/shared/lib/adminPanelApi";
import { Button } from "@/shared/ui/Button/Button";
import { SkeletonCard } from "@/shared/ui/Skeleton";
import { AdminCard, AdminPageHeader, AdminTable, AdminTd, AdminTh } from "@/widgets/admin";
import cls from "./adminPages.module.css";

const ACTIVITY: Record<string, string[]> = {
  u1: ["24.03 — opened the order card EV-10421", "18.03 — paid for repairs online", "10.02 — new application"],
  u2: ["24.03 — agreed on the estimate for EV-10420"],
  u3: ["23.03 — corporate agreement, invoice"],
};

const ORDERS_SUMMARY: Record<string, { id: string; label: string; status: string }[]> = {
  u1: [
    { id: "a1", label: "EV-10421 — iPhone 14 Pro", status: "In progress" },
    { id: "a5", label: "EV-10398 — Pixel 8", status: "Completed" },
  ],
  u2: [{ id: "a2", label: "EV-10420 — Samsung Galaxy S23", status: "Coordination" }],
  u3: [
    { id: "a3", label: "EV-10418 — MacBook Air M2", status: "Diagnostics" },
    { id: "a4", label: "EV-10410 — iPad Pro 11", status: "Ready" },
  ],
};

export const AdminUserDetailPage: React.FC = () => {
  const { userId } = useParams();
  const [user, setUser] = React.useState<any | null>(null);
  const [notFound, setNotFound] = React.useState(false);
  React.useEffect(() => {
    if (!userId) return;
    void (async () => {
      try {
        const res = await getAdminMockUserByIdApi(userId);
        setUser(res.user);
      } catch {
        setNotFound(true);
      }
    })();
  }, [userId]);
  if (notFound) return <Navigate to="/admin/users" replace />;
  if (!user) {
    return (
      <>
        <AdminPageHeader title="Customer card" subtitle="Loading…" />
        <SkeletonCard rows={6} />
      </>
    );
  }

  const activity = ACTIVITY[user.id] ?? ["No activity records."];
  const orders = ORDERS_SUMMARY[user.id] ?? [];

  return (
    <>
      <AdminPageHeader
        title={user.name}
        subtitle="Customer card: contacts, orders and activity."
        actions={
          <Button type="button" variant="outline">
            Edit
          </Button>
        }
      />
      <div className={cls.detailGrid}>
        <AdminCard>
          <p className={cls.blockTitle}>Contacts</p>
          <p className={cls.p}>
            Phone: <strong>{user.phone}</strong>
            <br />
            Email: <strong>{user.email}</strong>
            <br />
            City: {user.city}
          </p>
        </AdminCard>
        <AdminCard>
          <p className={cls.blockTitle}>Summary</p>
          <p className={cls.p}>
            Total orders: <strong>{user.ordersCount}</strong>
            <br />
            Last visit: <strong>{user.lastVisit}</strong>
          </p>
        </AdminCard>
      </div>
      <div className={cls.section}>
        <h2 className={cls.h2}>Orders</h2>
        <AdminCard>
          <AdminTable>
            <thead>
              <tr>
                <AdminTh>Order</AdminTh>
                <AdminTh>Status</AdminTh>
                <AdminTh />
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <AdminTd>{o.label}</AdminTd>
                  <AdminTd>{o.status}</AdminTd>
                  <AdminTd>
                    <Link className={cls.link} to={`/admin/orders/${o.id}`}>
                      Open
                    </Link>
                  </AdminTd>
                </tr>
              ))}
            </tbody>
          </AdminTable>
        </AdminCard>
      </div>
      <AdminCard>
        <p className={cls.blockTitle}>Activity history</p>
        <ul className={cls.noteList}>
          {activity.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </AdminCard>
      <Link to="/admin/users" className={cls.link} style={{ display: "inline-block", marginTop: 16 }}>
        ← To the list of clients
      </Link>
    </>
  );
};
