import * as React from "react";
import { Link } from "react-router-dom";
import { clientRepairToTrackingCard } from "@/entities/tracking";
import { getClientRepairsApi } from "@/shared/lib/clientInboxApi";
import { readAuthSession } from "@/shared/lib/authSession";
import { SkeletonTrackingCards } from "@/shared/ui/Skeleton";
import { PageHeader } from "@/widgets/PageHeader";
import { TrackingRepairCard } from "@/widgets/TrackingRepairCard";
import cls from "./TrackingPage.module.css";

export const TrackingPage: React.FC = () => {
  const auth = readAuthSession();
  const [repairs, setRepairs] = React.useState<Awaited<ReturnType<typeof getClientRepairsApi>>>([]);
  const [loading, setLoading] = React.useState(false);
  const lastSigRef = React.useRef<string>("");

  React.useEffect(() => {
    if (!auth?.accessToken) {
      setRepairs([]);
      return;
    }
    let mounted = true;
    const load = async (initial = false) => {
      if (initial) setLoading(true);
      try {
        const rows = await getClientRepairsApi();
        if (!mounted) return;
        const sig = rows
          .map((r) => `${r.id}|${r.progressPercent}|${r.status}|${r.estimateLabel}|${r.imageUrl}`)
          .join("||");
        if (sig !== lastSigRef.current) {
          lastSigRef.current = sig;
          setRepairs(rows);
        }
      } catch {
        if (mounted) setRepairs([]);
      } finally {
        if (mounted && initial) setLoading(false);
      }
    };
    void load(true);
    const t = window.setInterval(() => {
      void load();
    }, 3000);
    return () => {
      mounted = false;
      window.clearInterval(t);
    };
  }, [auth?.accessToken]);

  const cards = React.useMemo(() => repairs.map(clientRepairToTrackingCard), [repairs]);

  if (!auth?.accessToken) {
    return (
      <div className={cls.shell}>
        <div className={cls.inner}>
          <PageHeader embedded title="Отслеживание" />
          <p className={cls.loginHint}>
            Войдите в аккаунт, чтобы видеть статусы ремонтов.{" "}
            <Link className={cls.loginLink} to="/login">
              Вход
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cls.shell}>
      <div className={cls.inner}>
        <PageHeader embedded title="Отслеживание" subtitle="Статусы ваших ремонтов." />
        {loading ? (
          <SkeletonTrackingCards count={2} />
        ) : cards.length === 0 ? (
          <p className={cls.loginHint}>Пока нет заказов для отображения.</p>
        ) : (
          <div className={cls.cardsGrid}>
            {cards.map((card) => (
              <div key={card.id} className={cls.cardWrap}>
                <TrackingRepairCard data={card} cardTitle="Активный ремонт" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
