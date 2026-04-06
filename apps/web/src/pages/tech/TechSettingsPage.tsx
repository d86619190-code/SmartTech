import * as React from "react";
import { techApi } from "@/shared/lib/techApi";
import { useStatusToast } from "@/shared/lib/useStatusToast";
import { Button } from "@/shared/ui/Button/Button";
import { StatusToast } from "@/shared/ui/StatusToast/StatusToast";
import { AdminInput } from "@/widgets/admin";
import { TechCard, TechPageHeader } from "@/widgets/technician";
import cls from "./techPages.module.css";

export const TechSettingsPage: React.FC = () => {
  const [avail, setAvail] = React.useState(true);
  const [email, setEmail] = React.useState(true);
  const [push, setPush] = React.useState(true);
  const [workFrom, setWorkFrom] = React.useState("10:00");
  const [workTo, setWorkTo] = React.useState("20:00");
  const [phone, setPhone] = React.useState("+7 900 000-00-00");
  const [specialty, setSpecialty] = React.useState("Apple Displays");
  const [saving, setSaving] = React.useState(false);
  const { toast, showToast, closeToast } = useStatusToast();

  React.useEffect(() => {
    void (async () => {
      const res = await techApi.getSettings();
      setAvail(res.settings.available);
      setEmail(res.settings.notifyEmail);
      setPush(res.settings.notifyPush);
      setWorkFrom(res.settings.workFrom);
      setWorkTo(res.settings.workTo);
      setPhone(res.settings.phone);
      setSpecialty(res.settings.specialty);
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await techApi.saveSettings({
        available: avail,
        notifyEmail: email,
        notifyPush: push,
        workFrom,
        workTo,
        phone,
        specialty,
      });
      showToast("success", "Settings saved");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to save";
      showToast("error", msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <TechPageHeader title="Settings" subtitle="Availability, notifications and profile." />
      <TechCard style={{ marginBottom: 16 }}>
        <div style={{ padding: "24px", borderBottom: "1px solid var(--color-order-row-border)" }}>
          <h2 className={cls.sectionTitle} style={{ marginBottom: 12 }}>
            Availability
          </h2>
          <label className={cls.rowFlex} style={{ alignItems: "center", gap: 12 }}>
            <input type="checkbox" checked={avail} onChange={(e) => setAvail(e.target.checked)} />
            <span className={cls.p}>Accept new applications</span>
          </label>
        </div>
        <div style={{ padding: "24px", borderBottom: "1px solid var(--color-order-row-border)" }}>
          <h2 className={cls.sectionTitle} style={{ marginBottom: 12 }}>
            Working hours (optional)
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, maxWidth: 400 }}>
            <AdminInput label="С" type="time" value={workFrom} onChange={(e) => setWorkFrom(e.target.value)} />
            <AdminInput label="To" type="time" value={workTo} onChange={(e) => setWorkTo(e.target.value)} />
          </div>
        </div>
        <div style={{ padding: "24px", borderBottom: "1px solid var(--color-order-row-border)" }}>
          <h2 className={cls.sectionTitle} style={{ marginBottom: 12 }}>
            Notifications
          </h2>
          <label style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <input type="checkbox" checked={email} onChange={(e) => setEmail(e.target.checked)} />
            <span className={cls.p}>Email</span>
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <input type="checkbox" checked={push} onChange={(e) => setPush(e.target.checked)} />
            <span className={cls.p}>Push in the application</span>
          </label>
        </div>
        <div style={{ padding: "24px" }}>
          <h2 className={cls.sectionTitle} style={{ marginBottom: 12 }}>
            Profile
          </h2>
          <AdminInput label="Telephone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <div style={{ marginTop: 12 }}>
            <AdminInput label="Specialization (visible to administrator)" value={specialty} onChange={(e) => setSpecialty(e.target.value)} />
          </div>
        </div>
        <div style={{ padding: "16px 24px 24px", display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <Button type="button" onClick={() => void save()} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </TechCard>
      {toast ? <StatusToast tone={toast.tone} message={toast.message} onClose={closeToast} /> : null}
    </>
  );
};
