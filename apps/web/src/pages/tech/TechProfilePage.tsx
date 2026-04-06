import * as React from "react";
import { SkeletonKpiGrid } from "@/shared/ui/Skeleton";
import { techApi } from "@/shared/lib/techApi";
import { formatRub } from "@/shared/lib/formatMoney";
import { TechCard, TechPageHeader } from "@/widgets/technician";
import cls from "./techPages.module.css";

export const TechProfilePage: React.FC = () => {
  const [techProfile, setTechProfile] = React.useState<any | null>(null);
  React.useEffect(() => {
    void (async () => {
      const res = await techApi.getProfile();
      setTechProfile(res.profile);
    })();
  }, []);
  if (!techProfile) {
    return (
      <>
        <TechPageHeader title="Profile" subtitle="Loading…" />
        <SkeletonKpiGrid count={5} />
      </>
    );
  }
  return (
    <>
      <TechPageHeader title="Profile" subtitle="Indicators and reputation of the master." />
      <div className={cls.grid2}>
        <TechCard style={{ padding: 24 }}>
          <p className={cls.blockTitle}>Master</p>
          <p className={cls.p} style={{ fontSize: 20 }}>
            <strong>{techProfile.name}</strong>
          </p>
          <p className={cls.muted}>{techProfile.role}</p>
        </TechCard>
        <TechCard style={{ padding: 24 }}>
          <p className={cls.blockTitle}>Rating</p>
          <p className={cls.p} style={{ fontSize: 28 }}>
            <strong>{techProfile.rating.toFixed(1)}</strong>
          </p>
          <p className={cls.muted}>Average customer rating</p>
        </TechCard>
        <TechCard style={{ padding: 24 }}>
          <p className={cls.blockTitle}>Completed orders</p>
          <p className={cls.p} style={{ fontSize: 28 }}>
            <strong>{techProfile.completedJobs}</strong>
          </p>
        </TechCard>
        <TechCard style={{ padding: 24 }}>
          <p className={cls.blockTitle}>Monthly income</p>
          <p className={cls.p} style={{ fontSize: 22 }}>
            <strong>{formatRub(techProfile.monthEarningsRub)}</strong>
          </p>
        </TechCard>
        <TechCard style={{ padding: 24 }}>
          <p className={cls.blockTitle}>Average response time</p>
          <p className={cls.p}>
            <strong>{techProfile.responseMin} min</strong>
          </p>
          <p className={cls.muted}>Chat with clients</p>
        </TechCard>
      </div>
    </>
  );
};
