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
        <TechPageHeader title="Профиль" subtitle="Загрузка…" />
        <SkeletonKpiGrid count={5} />
      </>
    );
  }
  return (
    <>
      <TechPageHeader title="Профиль" subtitle="Показатели и репутация мастера." />
      <div className={cls.grid2}>
        <TechCard style={{ padding: 24 }}>
          <p className={cls.blockTitle}>Мастер</p>
          <p className={cls.p} style={{ fontSize: 20 }}>
            <strong>{techProfile.name}</strong>
          </p>
          <p className={cls.muted}>{techProfile.role}</p>
        </TechCard>
        <TechCard style={{ padding: 24 }}>
          <p className={cls.blockTitle}>Рейтинг</p>
          <p className={cls.p} style={{ fontSize: 28 }}>
            <strong>{techProfile.rating.toFixed(1)}</strong>
          </p>
          <p className={cls.muted}>Средняя оценка клиентов</p>
        </TechCard>
        <TechCard style={{ padding: 24 }}>
          <p className={cls.blockTitle}>Завершено заказов</p>
          <p className={cls.p} style={{ fontSize: 28 }}>
            <strong>{techProfile.completedJobs}</strong>
          </p>
        </TechCard>
        <TechCard style={{ padding: 24 }}>
          <p className={cls.blockTitle}>Доход за месяц</p>
          <p className={cls.p} style={{ fontSize: 22 }}>
            <strong>{formatRub(techProfile.monthEarningsRub)}</strong>
          </p>
        </TechCard>
        <TechCard style={{ padding: 24 }}>
          <p className={cls.blockTitle}>Среднее время ответа</p>
          <p className={cls.p}>
            <strong>{techProfile.responseMin} мин</strong>
          </p>
          <p className={cls.muted}>В чате с клиентами</p>
        </TechCard>
      </div>
    </>
  );
};
