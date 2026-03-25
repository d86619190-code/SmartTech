import * as React from "react";
import { getAdminSettingsApi, updateAdminSettingsApi } from "@/shared/lib/adminPanelApi";
import { Button } from "@/shared/ui/Button/Button";
import { AdminCard, AdminInput, AdminPageHeader, AdminSelect } from "@/widgets/admin";
import cls from "./adminPages.module.css";

export const AdminSettingsPage: React.FC = () => {
  const [defaultAdminRole, setDefaultAdminRole] = React.useState("Оператор");
  const [notifyEmail, setNotifyEmail] = React.useState(true);
  const [notifyPush, setNotifyPush] = React.useState(false);
  const [legalName, setLegalName] = React.useState('ООО "Сервис"');
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
      <AdminPageHeader title="Настройки" subtitle="Роли, уведомления и реквизиты сервиса (демо-форма)." />
      <AdminCard style={{ marginBottom: 16 }}>
        <div className={cls.settingsSection}>
          <h2 className={cls.h2} style={{ marginBottom: 16 }}>
            Роли и доступ
          </h2>
          <div className={cls.row}>
            <span className={cls.p}>Роль по умолчанию для новых администраторов</span>
            <div style={{ minWidth: 200 }}>
              <AdminSelect value={defaultAdminRole} onChange={(e) => setDefaultAdminRole(e.target.value)}>
                <option>Оператор</option>
                <option>Супервизор</option>
                <option>Владелец</option>
              </AdminSelect>
            </div>
          </div>
          <div className={cls.row}>
            <span className={cls.p}>Двухфакторная аутентификация</span>
            <Button type="button" variant="outline">
              Настроить
            </Button>
          </div>
        </div>
        <div className={cls.settingsSection}>
          <h2 className={cls.h2} style={{ marginBottom: 16 }}>
            Уведомления
          </h2>
          <label className={cls.row}>
            <span className={cls.p}>Email при смене статуса заказа</span>
            <input type="checkbox" checked={notifyEmail} onChange={(e) => setNotifyEmail(e.target.checked)} />
          </label>
          <label className={cls.row}>
            <span className={cls.p}>Push для мастеров</span>
            <input type="checkbox" checked={notifyPush} onChange={(e) => setNotifyPush(e.target.checked)} />
          </label>
        </div>
        <div className={cls.settingsSection}>
          <h2 className={cls.h2} style={{ marginBottom: 16 }}>
            Юридические и контакты
          </h2>
          <div className={cls.detailGrid} style={{ marginBottom: 0 }}>
            <AdminInput label="Название юрлица" value={legalName} onChange={(e) => setLegalName(e.target.value)} />
            <AdminInput label="ИНН" value={inn} onChange={(e) => setInn(e.target.value)} />
            <AdminInput label="Телефон линии" value={supportPhone} onChange={(e) => setSupportPhone(e.target.value)} />
            <AdminInput label="Email поддержки" value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} />
          </div>
        </div>
        <div className={cls.settingsSection} style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
          <Button type="button" variant="outline">
            Сбросить
          </Button>
          <Button type="button" onClick={() => void save()}>Сохранить</Button>
        </div>
      </AdminCard>
    </>
  );
};
