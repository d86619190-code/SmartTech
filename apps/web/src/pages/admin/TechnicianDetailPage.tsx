import * as React from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { getAdminTechnicianByIdApi } from "@/shared/lib/adminPanelApi";
import { formatRub } from "@/shared/lib/formatMoney";
import { Button } from "@/shared/ui/Button/Button";
import { SkeletonCard } from "@/shared/ui/Skeleton";
import { AdminCard, AdminPageHeader } from "@/widgets/admin";
import cls from "./adminPages.module.css";

export const AdminTechnicianDetailPage: React.FC = () => {
  const { techId } = useParams();
  const [tech, setTech] = React.useState<any | null>(null);
  const [notFound, setNotFound] = React.useState(false);
  React.useEffect(() => {
    if (!techId) return;
    void (async () => {
      try {
        const res = await getAdminTechnicianByIdApi(techId);
        setTech(res.technician);
      } catch {
        setNotFound(true);
      }
    })();
  }, [techId]);
  if (notFound) return <Navigate to="/admin/technicians" replace />;
  if (!tech) {
    return (
      <>
        <AdminPageHeader title="Master Card" subtitle="Loading…" />
        <SkeletonCard rows={5} />
      </>
    );
  }

  return (
    <>
      <AdminPageHeader
        title={tech.name}
        subtitle="Detailed load and assignments (demo data)."
        actions={
          <>
            <Button type="button" variant="outline">
              Remove from orders
            </Button>
            <Button type="button">Assign to order</Button>
          </>
        }
      />
      <div className={cls.detailGrid}>
        <AdminCard>
          <p className={cls.blockTitle}>Indicators</p>
          <p className={cls.p}>
            Active orders: <strong>{tech.activeOrders}</strong>
            <br />
            Rating: <strong>{tech.rating.toFixed(1)}</strong>
            <br />
            Completed work: <strong>{tech.completed}</strong>
          </p>
        </AdminCard>
        <AdminCard>
          <p className={cls.blockTitle}>Finance</p>
          <p className={cls.p}>
            Accumulated revenue (estimate): <strong>{formatRub(tech.revenueRub)}</strong>
          </p>
        </AdminCard>
        <AdminCard>
          <p className={cls.blockTitle}>Specialization</p>
          <p className={cls.p}>{tech.specialty}</p>
        </AdminCard>
      </div>
      <AdminCard>
        <p className={cls.blockTitle}>Current appointments</p>
        <p className={cls.p}>
          In demo mode, assignments can be linked to orders using the “Master” field in the “Orders” section. Connect API for live data.
        </p>
      </AdminCard>
      <Link to="/admin/technicians" className={cls.link} style={{ display: "inline-block", marginTop: 16 }}>
        ← To the list of masters
      </Link>
    </>
  );
};
