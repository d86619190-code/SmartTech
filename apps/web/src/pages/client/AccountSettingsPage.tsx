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
      <PageHeader title="Settings" subtitle="Account notifications and preferences (demo)." />
      <div className={cls.body}>
        <section className={cls.card}>
          <h2 className={cls.h2}>Notifications</h2>
          <label className={cls.settingsRow}>
            <span>Push about order status</span>
            <input type="checkbox" checked={pushOrder} onChange={(e) => setPushOrder(e.target.checked)} />
          </label>
          <label className={cls.settingsRow}>
            <span>Email-promotions mailing</span>
            <input type="checkbox" checked={emailNews} onChange={(e) => setEmailNews(e.target.checked)} />
          </label>
          <label className={cls.settingsRow}>
            <span>SMS visit reminders</span>
            <input type="checkbox" checked={sms} onChange={(e) => setSms(e.target.checked)} />
          </label>
        </section>
        <section className={cls.card}>
          <h2 className={cls.h2}>Confidentiality</h2>
          <p className={cls.lead}>
            The data processing policy is described in the documents: {" "}
            <a href="#/privacy" style={{ color: "var(--color-link)" }}>
              confidentiality
            </a>
            .
          </p>
        </section>
        <Button type="button" variant="outline">
          Save
        </Button>
      </div>
    </div>
  );
};
