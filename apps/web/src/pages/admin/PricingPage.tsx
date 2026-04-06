import * as React from "react";
import type { AdminPriceRow } from "@/entities/admin";
import { getAdminPricingApi, updateAdminPricingApi } from "@/shared/lib/adminPanelApi";
import { formatRub } from "@/shared/lib/formatMoney";
import { useStatusToast } from "@/shared/lib/useStatusToast";
import { Button } from "@/shared/ui/Button/Button";
import { StatusToast } from "@/shared/ui/StatusToast/StatusToast";
import { AdminCard, AdminInput, AdminPageHeader } from "@/widgets/admin";
import cls from "./adminPages.module.css";

export const AdminPricingPage: React.FC = () => {
  const [rows, setRows] = React.useState<AdminPriceRow[]>([]);
  const [initial, setInitial] = React.useState<AdminPriceRow[]>([]);
  const [dirty, setDirty] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const { toast, showToast, closeToast } = useStatusToast();
  React.useEffect(() => {
    void (async () => {
      try {
        const res = await getAdminPricingApi();
        setRows(res.rows as AdminPriceRow[]);
        setInitial(res.rows as AdminPriceRow[]);
      } catch (e) {
        showToast("error", e instanceof Error ? e.message : "Failed to load price list");
      }
    })();
  }, [showToast]);

  const update = (id: string, patch: Partial<AdminPriceRow>) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    setDirty(true);
  };

  const reset = () => {
    setRows([...initial]);
    setDirty(false);
  };

  const save = async () => {
    if (!dirty) {
      showToast("info", "No changes to save");
      return;
    }
    try {
      setSaving(true);
      const res = await updateAdminPricingApi(rows);
      setRows(res.rows as AdminPriceRow[]);
      setInitial(res.rows as AdminPriceRow[]);
      setDirty(false);
      showToast("success", "Price saved");
    } catch (e) {
      showToast("error", e instanceof Error ? e.message : "Failed to save price");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <AdminPageHeader
        title="Price and markups"
        subtitle="Structure of work and spare parts by device category."
        actions={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setRows((r) => [
                  ...r,
                  {
                    id: `p-${crypto.randomUUID()}`,
                    category: "",
                    deviceGroup: "",
                    service: "",
                    laborRub: 0,
                    partsFromRub: 0,
                  },
                ]);
                setDirty(true);
              }}
            >
              Add line
            </Button>
            <Button type="button" variant="outline" onClick={reset} disabled={saving || !dirty}>
              Cancel
            </Button>
            <Button type="button" onClick={() => void save()} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </>
        }
      />
      <AdminCard>
        <div style={{ padding: "8px 8px 0", fontSize: 13, color: "var(--color-text-muted)" }}>
          {dirty ? "There are unsaved changes." : 'Change any field and click "Save".'}
        </div>
        <div className={cls.priceHead}>
          <span>Category</span>
          <span>Devices</span>
          <span>Service</span>
          <span>Work, ₽</span>
          <span>Spare part from, ₽</span>
          <span>Guideline</span>
        </div>
        {rows.map((row) => (
          <div key={row.id} className={cls.priceRow}>
            <AdminInput className={cls.priceCell} value={row.category} onChange={(e) => update(row.id, { category: e.target.value })} />
            <AdminInput className={cls.priceCell} value={row.deviceGroup} onChange={(e) => update(row.id, { deviceGroup: e.target.value })} />
            <AdminInput className={cls.priceCell} value={row.service} onChange={(e) => update(row.id, { service: e.target.value })} />
            <AdminInput
              className={cls.priceCell}
              inputMode="numeric"
              value={String(row.laborRub)}
              onChange={(e) => update(row.id, { laborRub: Number(e.target.value.replace(/\D/g, "")) || 0 })}
            />
            <AdminInput
              className={cls.priceCell}
              inputMode="numeric"
              value={String(row.partsFromRub)}
              onChange={(e) => update(row.id, { partsFromRub: Number(e.target.value.replace(/\D/g, "")) || 0 })}
            />
            <span className={cls.hint}>{formatRub(row.laborRub + row.partsFromRub)} total from</span>
          </div>
        ))}
      </AdminCard>
      {toast ? <StatusToast tone={toast.tone} message={toast.message} onClose={closeToast} /> : null}
    </>
  );
};
