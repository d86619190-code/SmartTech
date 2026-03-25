import * as React from "react";
import { getAdminAnalyticsApi } from "@/shared/lib/adminPanelApi";
import { useStatusToast } from "@/shared/lib/useStatusToast";
import { AdminCard, AdminPageHeader, AdminSelect, ChartPlaceholder } from "@/widgets/admin";
import { StatusToast } from "@/shared/ui/StatusToast/StatusToast";
import cls from "./adminPages.module.css";

type Period = "7d" | "30d" | "90d";
type Metric = "revenue" | "orders" | "clients";
type DeviceFilter = "all" | "phone" | "tablet" | "laptop";
type StatusFilter = "all" | "new" | "diagnostics" | "approval" | "in_progress" | "ready" | "completed" | "cancelled";
type ClientTypeFilter = "all" | "new" | "repeat";
type DonutMode = "devices" | "statuses" | "technicians" | "repairTypes";
type Point = { label: string; value: number };
type AnalyticsOrder = {
  id: string;
  publicId: string;
  deviceType: DeviceFilter;
  status: StatusFilter;
  customer: string;
  technician: string | null;
  totalRub: number;
  createdAt: string;
  repairOption?: string;
};

function round(n: number): number {
  return Math.round(n * 10) / 10;
}

function parseRuDate(dateStr: string): Date | null {
  const m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(dateStr.trim());
  if (!m) return null;
  const d = Number(m[1]);
  const mon = Number(m[2]) - 1;
  const y = Number(m[3]);
  const dt = new Date(y, mon, d);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

export const AdminAnalyticsPage: React.FC = () => {
  const [data, setData] = React.useState<any | null>(null);
  const [period, setPeriod] = React.useState<Period>("7d");
  const [metric, setMetric] = React.useState<Metric>("revenue");
  const [deviceFilter, setDeviceFilter] = React.useState<DeviceFilter>("all");
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("all");
  const [technicianFilter, setTechnicianFilter] = React.useState<string>("all");
  const [clientTypeFilter, setClientTypeFilter] = React.useState<ClientTypeFilter>("all");
  const [donutMode, setDonutMode] = React.useState<DonutMode>("devices");
  const { toast, showToast, closeToast } = useStatusToast();

  const reload = React.useCallback(async () => {
    try {
      const next = await getAdminAnalyticsApi();
      setData(next);
    } catch (e) {
      showToast("error", e instanceof Error ? e.message : "Не удалось загрузить аналитику");
    }
  }, [showToast]);

  React.useEffect(() => {
    void reload();
  }, [reload]);

  const orders = (data?.orders ?? []) as AnalyticsOrder[];
  const customerFrequency = React.useMemo(() => {
    const m = new Map<string, number>();
    for (const o of orders) m.set(o.customer, (m.get(o.customer) ?? 0) + 1);
    return m;
  }, [orders]);
  const technicians = ((data?.technicians ?? []) as Array<{ name: string }>).map((t) => t.name);
  const filteredOrders = orders.filter((o) => {
    if (deviceFilter !== "all" && o.deviceType !== deviceFilter) return false;
    if (statusFilter !== "all" && o.status !== statusFilter) return false;
    if (technicianFilter !== "all" && (o.technician ?? "Без мастера") !== technicianFilter) return false;
    if (clientTypeFilter !== "all") {
      const freq = customerFrequency.get(o.customer) ?? 0;
      if (clientTypeFilter === "new" && freq > 1) return false;
      if (clientTypeFilter === "repeat" && freq <= 1) return false;
    }
    return true;
  });
  const scopeOrders = filteredOrders;
  const datedScopeOrders = scopeOrders.map((o) => ({ ...o, parsedDate: parseRuDate(o.createdAt) })).filter((o) => Boolean(o.parsedDate)) as Array<
    AnalyticsOrder & { parsedDate: Date }
  >;
  const latestDate = datedScopeOrders.reduce<Date | null>((acc, o) => (!acc || o.parsedDate > acc ? o.parsedDate : acc), null);
  const labelsByPeriod: Record<Period, string[]> = {
    "7d": ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"],
    "30d": ["Нед 1", "Нед 2", "Нед 3", "Нед 4"],
    "90d": ["Месяц 1", "Месяц 2", "Месяц 3"],
  };

  const barData = React.useMemo<Point[]>(() => {
    const labels = labelsByPeriod[period];
    const values = new Array(labels.length).fill(0) as number[];
    const clientsByBin = new Map<number, Set<string>>();
    for (let i = 0; i < labels.length; i += 1) clientsByBin.set(i, new Set());
    if (!latestDate || datedScopeOrders.length === 0) {
      return labels.map((label) => ({ label, value: 0 }));
    }

    for (const o of datedScopeOrders) {
      const msDiff = latestDate.getTime() - o.parsedDate.getTime();
      const dayDiff = Math.max(0, Math.floor(msDiff / (1000 * 60 * 60 * 24)));
      let idx = -1;
      if (period === "7d") {
        idx = o.parsedDate.getDay();
        idx = idx === 0 ? 6 : idx - 1; // Mon..Sun
      } else if (period === "30d") {
        if (dayDiff > 30) continue;
        idx = Math.min(3, Math.floor(dayDiff / 7));
      } else {
        if (dayDiff > 90) continue;
        idx = Math.min(2, Math.floor(dayDiff / 30));
      }
      if (idx < 0 || idx >= labels.length) continue;
      if (metric === "revenue") values[idx] += o.totalRub / 1000;
      if (metric === "orders") values[idx] += 1;
      clientsByBin.get(idx)?.add(o.customer);
    }

    if (metric === "clients") {
      return labels.map((label, i) => ({ label, value: clientsByBin.get(i)?.size ?? 0 }));
    }
    return labels.map((label, i) => ({ label, value: round(values[i]) }));
  }, [period, metric, datedScopeOrders, latestDate]);

  const donutSegments = React.useMemo<Array<{ label: string; value: number }>>(() => {
    if (donutMode === "technicians") {
      const map = new Map<string, number>();
      for (const o of scopeOrders) {
        const key = o.technician ?? "Без мастера";
        map.set(key, (map.get(key) ?? 0) + 1);
      }
      return Array.from(map.entries()).map(([label, value]) => ({ label, value }));
    }
    if (donutMode === "repairTypes") {
      const map = new Map<string, number>();
      for (const o of scopeOrders) {
        const category =
          o.repairOption?.includes("АКБ") ? "АКБ"
          : o.repairOption?.includes("дисп") || o.repairOption?.includes("сенсор") ? "Экран/сенсор"
          : o.repairOption?.includes("кулер") || o.repairOption?.includes("охлаж") ? "Охлаждение"
          : o.repairOption?.includes("плата") ? "Плата"
          : o.repairOption?.includes("разъём") || o.repairOption?.includes("шлейф") ? "Разъём/шлейф"
          : "Прочее";
        map.set(category, (map.get(category) ?? 0) + 1);
      }
      return Array.from(map.entries()).map(([label, value]) => ({ label, value }));
    }
    if (donutMode === "statuses") {
      const map = new Map<string, number>();
      for (const o of scopeOrders) {
        map.set(o.status, (map.get(o.status) ?? 0) + 1);
      }
      return Array.from(map.entries()).map(([label, value]) => ({ label, value }));
    }
    const scope = scopeOrders;
    const phone = scope.filter((o) => o.deviceType === "phone").length;
    const tablet = scope.filter((o) => o.deviceType === "tablet").length;
    const laptop = scope.filter((o) => o.deviceType === "laptop").length;
    return [
      { label: "Смартфоны", value: phone },
      { label: "Планшеты", value: tablet },
      { label: "Ноутбуки", value: laptop },
    ];
  }, [donutMode, scopeOrders]);

  const donutTotal = Math.max(1, donutSegments.reduce((sum, s) => sum + s.value, 0));
  const donutGradient = React.useMemo(() => {
    const palette = ["#1c1f22", "#495057", "#868e96", "#adb5bd", "#ced4da"];
    let acc = 0;
    return donutSegments
      .map((s, i) => {
        const part = (s.value / donutTotal) * 100;
        const from = acc;
        const to = acc + part;
        acc = to;
        return `${palette[i % palette.length]} ${from}% ${to}%`;
      })
      .join(", ");
  }, [donutSegments, donutTotal]);

  const barTitle =
    metric === "revenue"
      ? "Динамика выручки (тыс. ₽)"
      : metric === "orders"
        ? "Динамика заявок"
        : "Динамика клиентов";
  const selectedRevenue = scopeOrders.reduce((sum, o) => sum + (o.totalRub ?? 0), 0);
  const selectedClients = new Set(scopeOrders.map((o) => o.customer)).size;
  const repeatClients = Array.from(customerFrequency.entries()).filter(([, count]) => count > 1).length;
  const selectedAverageCheck = Math.round(selectedRevenue / Math.max(scopeOrders.length, 1));

  if (!data) return <AdminPageHeader title="Аналитика" subtitle="Загрузка..." />;

  return (
    <>
      <AdminPageHeader title="Аналитика" subtitle="Два графика: столбчатый и круговой, с фильтрами по периоду и сегментам." />

      <AdminCard>
        <div className={cls.analyticsFilters}>
          <label className={cls.filterField}>
            <span className={cls.blockTitle}>Период</span>
            <AdminSelect value={period} onChange={(e) => setPeriod(e.target.value as Period)}>
              <option value="7d">7 дней</option>
              <option value="30d">30 дней</option>
              <option value="90d">90 дней</option>
            </AdminSelect>
          </label>
          <label className={cls.filterField}>
            <span className={cls.blockTitle}>Метрика</span>
            <AdminSelect value={metric} onChange={(e) => setMetric(e.target.value as Metric)}>
              <option value="revenue">Выручка</option>
              <option value="orders">Заявки</option>
              <option value="clients">Клиенты</option>
            </AdminSelect>
          </label>
          <label className={cls.filterField}>
            <span className={cls.blockTitle}>Тип устройства</span>
            <AdminSelect value={deviceFilter} onChange={(e) => setDeviceFilter(e.target.value as DeviceFilter)}>
              <option value="all">Все устройства</option>
              <option value="phone">Смартфоны</option>
              <option value="tablet">Планшеты</option>
              <option value="laptop">Ноутбуки</option>
            </AdminSelect>
          </label>
          <label className={cls.filterField}>
            <span className={cls.blockTitle}>Статус</span>
            <AdminSelect value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}>
              <option value="all">Все статусы</option>
              <option value="new">Новая</option>
              <option value="diagnostics">Диагностика</option>
              <option value="approval">Согласование</option>
              <option value="in_progress">В работе</option>
              <option value="ready">Готово</option>
              <option value="completed">Завершено</option>
              <option value="cancelled">Отменено</option>
            </AdminSelect>
          </label>
          <label className={cls.filterField}>
            <span className={cls.blockTitle}>Мастер</span>
            <AdminSelect value={technicianFilter} onChange={(e) => setTechnicianFilter(e.target.value)}>
              <option value="all">Все мастера</option>
              {technicians.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </AdminSelect>
          </label>
          <label className={cls.filterField}>
            <span className={cls.blockTitle}>Тип клиента</span>
            <AdminSelect value={clientTypeFilter} onChange={(e) => setClientTypeFilter(e.target.value as ClientTypeFilter)}>
              <option value="all">Все</option>
              <option value="new">Новые</option>
              <option value="repeat">Повторные</option>
            </AdminSelect>
          </label>
          <label className={cls.filterField}>
            <span className={cls.blockTitle}>Круговой срез</span>
            <AdminSelect value={donutMode} onChange={(e) => setDonutMode(e.target.value as DonutMode)}>
              <option value="devices">По устройствам</option>
              <option value="statuses">По статусам</option>
              <option value="technicians">По мастерам</option>
              <option value="repairTypes">По типам ремонта</option>
            </AdminSelect>
          </label>
        </div>
      </AdminCard>
      <div className={cls.quickStats}>
        <div className={cls.quickCard}>
          <span className={cls.quickLabel}>Заявок в выборке</span>
          <strong className={cls.quickValue}>{scopeOrders.length}</strong>
        </div>
        <div className={cls.quickCard}>
          <span className={cls.quickLabel}>Клиентов в выборке</span>
          <strong className={cls.quickValue}>{selectedClients}</strong>
        </div>
        <div className={cls.quickCard}>
          <span className={cls.quickLabel}>Повторных клиентов</span>
          <strong className={cls.quickValue}>{repeatClients}</strong>
        </div>
        <div className={cls.quickCard}>
          <span className={cls.quickLabel}>Средний чек (выборка)</span>
          <strong className={cls.quickValue}>{selectedAverageCheck.toLocaleString("ru-RU")} ₽</strong>
        </div>
      </div>

      <div className={cls.analyticsGrid}>
        <AdminCard>
          <ChartPlaceholder title={barTitle} data={barData} />
        </AdminCard>
        <AdminCard>
          <div className={cls.donutWrap}>
            <h3 className={cls.donutTitle}>
              {donutMode === "devices"
                ? "Распределение по типам устройств"
                : donutMode === "statuses"
                  ? "Распределение по статусам"
                  : donutMode === "technicians"
                    ? "Распределение по мастерам"
                    : "Распределение по типам ремонта"}
            </h3>
            <div className={cls.donutBody}>
              <div className={cls.donut} style={{ background: `conic-gradient(${donutGradient})` }} aria-label="Круговой график" />
              <div className={cls.donutLegend}>
                {donutSegments.map((s) => (
                  <div key={s.label} className={cls.legendRow}>
                    <span>{s.label}</span>
                    <strong>
                      {s.value} ({Math.round((s.value / donutTotal) * 100)}%)
                    </strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </AdminCard>
      </div>
      {toast ? <StatusToast tone={toast.tone} message={toast.message} onClose={closeToast} /> : null}
    </>
  );
};
