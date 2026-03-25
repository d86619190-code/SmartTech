import * as React from "react";
import { Button } from "@/shared/ui/Button/Button";
import { PageHeader } from "@/widgets/PageHeader";
import cls from "./clientPages.module.css";

export const AccountSettingsPage: React.FC = () => {
  const [pushOrder, setPushOrder] = React.useState(true);
  const [emailNews, setEmailNews] = React.useState(false);
  const [sms, setSms] = React.useState(true);

  return (
    <div className={cls.shell}>
      <PageHeader title="Настройки" subtitle="Уведомления и предпочтения аккаунта (демо)." />
      <div className={cls.body}>
        <section className={cls.card}>
          <h2 className={cls.h2}>Уведомления</h2>
          <label className={cls.settingsRow}>
            <span>Push о статусе заказа</span>
            <input type="checkbox" checked={pushOrder} onChange={(e) => setPushOrder(e.target.checked)} />
          </label>
          <label className={cls.settingsRow}>
            <span>Email-рассылка акций</span>
            <input type="checkbox" checked={emailNews} onChange={(e) => setEmailNews(e.target.checked)} />
          </label>
          <label className={cls.settingsRow}>
            <span>SMS напоминания о визите</span>
            <input type="checkbox" checked={sms} onChange={(e) => setSms(e.target.checked)} />
          </label>
        </section>
        <section className={cls.card}>
          <h2 className={cls.h2}>Конфиденциальность</h2>
          <p className={cls.lead}>
            Политика обработки данных описана в документах:{" "}
            <a href="#/privacy" style={{ color: "var(--color-link)" }}>
              конфиденциальность
            </a>
            .
          </p>
        </section>
        <Button type="button" variant="outline">
          Сохранить
        </Button>
      </div>
    </div>
  );
};
