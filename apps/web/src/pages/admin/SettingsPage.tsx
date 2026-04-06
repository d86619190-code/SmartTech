import * as React from "react";
import { getAdminSettingsApi, updateAdminSettingsApi } from "@/shared/lib/adminPanelApi";
import { Button } from "@/shared/ui/Button/Button";
import { AdminCard, AdminInput, AdminPageHeader, AdminSelect } from "@/widgets/admin";
import cls from "./adminPages.module.css";

export const AdminSettingsPage: React.FC = () => {
  const [defaultAdminRole, setDefaultAdminRole] = React.useState("Operator");
  const [notifyEmail, setNotifyEmail] = React.useState(true);
  const [notifyPush, setNotifyPush] = React.useState(false);
  const [legalName, setLegalName] = React.useState('OOO"Service"');
  const [inn, setInn] = React.useState("7700000000");
  const [supportPhone, setSupportPhone] = React.useState("+7 495 000-00-00");
  const [supportEmail, setSupportEmail] = React.useState("support@example.com");

  React.useEffect(() => {
    void (async () => {
      const res = await getAdminSettingsApi();
      setDefaultAdminRole(res.settings.defaultAdminRole);
      setNotifyEmail(res.settings.notifyEmail);
      setNotifyPush(res.settings.notifyPush);
      setLegalName(res.settings.legalName);
      setInn(res.settings.inn);
      setSupportPhone(res.settings.supportPhone);
      setSupportEmail(res.settings.supportEmail);
    })();
  }, []);

  const save = async () => {
    await updateAdminSettingsApi({
      defaultAdminRole,
      notifyEmail,
      notifyPush,
      legalName,
      inn,
      supportPhone,
      supportEmail,
    });
  };

  return (
    <>
      <AdminPageHeader title="Settings" subtitle="Roles, notifications and service details (demo form)." />
      <AdminCard style={{ marginBottom: 16 }}>
        <div className={cls.settingsSection}>
          <h2 className={cls.h2} style={{ marginBottom: 16 }}>
            Roles and access
          </h2>
          <div className={cls.row}>
            <span className={cls.p}>Default role for new administrators</span>
            <div style={{ minWidth: 200 }}>
              <AdminSelect value={defaultAdminRole} onChange={(e) => setDefaultAdminRole(e.target.value)}>
                <option>Operator</option>
                <option>Supervisor</option>
                <option>Owner</option>
              </AdminSelect>
            </div>
          </div>
          <div className={cls.row}>
            <span className={cls.p}>Two-factor authentication</span>
            <Button type="button" variant="outline">
              Tune
            </Button>
          </div>
        </div>
        <div className={cls.settingsSection}>
          <h2 className={cls.h2} style={{ marginBottom: 16 }}>
            Notifications
          </h2>
          <label className={cls.row}>
            <span className={cls.p}>Email when order status changes</span>
            <input type="checkbox" checked={notifyEmail} onChange={(e) => setNotifyEmail(e.target.checked)} />
          </label>
          <label className={cls.row}>
            <span className={cls.p}>Push for masters</span>
            <input type="checkbox" checked={notifyPush} onChange={(e) => setNotifyPush(e.target.checked)} />
          </label>
        </div>
        <div className={cls.settingsSection}>
          <h2 className={cls.h2} style={{ marginBottom: 16 }}>
            Legal and contacts
          </h2>
          <div className={cls.detailGrid} style={{ marginBottom: 0 }}>
            <AdminInput label="Legal entity name" value={legalName} onChange={(e) => setLegalName(e.target.value)} />
            <AdminInput label="TIN" value={inn} onChange={(e) => setInn(e.target.value)} />
            <AdminInput label="Telephone line" value={supportPhone} onChange={(e) => setSupportPhone(e.target.value)} />
            <AdminInput label="Email support" value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} />
          </div>
        </div>
        <div className={cls.settingsSection} style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
          <Button type="button" variant="outline">
            Reset
          </Button>
          <Button type="button" onClick={() => void save()}>Save</Button>
        </div>
      </AdminCard>
    </>
  );
};
