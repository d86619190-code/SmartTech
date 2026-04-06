import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import { deleteOrderDraftApi, getOrderDraftsApi, saveOrderDraftApi } from "@/shared/lib/clientInboxApi";
import { PageHeader } from "@/widgets/PageHeader";
import { Button } from "@/shared/ui/Button/Button";
import { useStatusToast } from "@/shared/lib/useStatusToast";
import { StatusToast } from "@/shared/ui/StatusToast/StatusToast";
import cls from "./CreateOrderDraftsPage.module.css";

const LOCAL_DRAFTS_KEY = "createOrder.localDrafts.v1";
type LocalDraftRow = { id: string; title: string; saved_at: number; payload: any };

function readLocalDraftRows(): LocalDraftRow[] {
  try {
    const raw = localStorage.getItem(LOCAL_DRAFTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as LocalDraftRow[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocalDraftRows(rows: LocalDraftRow[]): void {
  localStorage.setItem(LOCAL_DRAFTS_KEY, JSON.stringify(rows.slice(0, 20)));
}

async function syncLocalDraftRowsToServer(rows: LocalDraftRow[]): Promise<LocalDraftRow[]> {
  if (rows.length === 0) return [];
  const failed: LocalDraftRow[] = [];
  for (const row of rows) {
    try {
      await saveOrderDraftApi(row.payload, row.id);
    } catch {
      failed.push(row);
    }
  }
  return failed;
}

export const CreateOrderDraftsPage: React.FC = () => {
  const navigate = useNavigate();
  const [rows, setRows] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { toast, showToast, closeToast } = useStatusToast();

  const load = React.useCallback(async () => {
    setLoading(true);
    const local = readLocalDraftRows();
    try {
      const failedLocal = await syncLocalDraftRowsToServer(local);
      if (failedLocal.length > 0) writeLocalDraftRows(failedLocal);
      else localStorage.removeItem(LOCAL_DRAFTS_KEY);
      const data = await getOrderDraftsApi();
      const merged = [...data, ...failedLocal.filter((l) => !data.some((d) => d.id === l.id))];
      setRows(merged);
      if (merged.length === 0) navigate("/create-order?new=1", { replace: true });
    } catch (e) {
      setRows(local);
      if (local.length === 0) {
        showToast("error", e instanceof Error ? e.message : "Failed to load drafts");
        navigate("/create-order?new=1", { replace: true });
      }
    } finally {
      setLoading(false);
    }
  }, [navigate, showToast]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const remove = async (id: string) => {
    try {
      await deleteOrderDraftApi(id);
    } catch (e) {
      // could be local-only draft
      if (!(e instanceof Error) || !/401|authorization|session/i.test(e.message)) {
        // noop for server miss
      }
    }
    const nextLocal = readLocalDraftRows().filter((x) => x.id !== id);
    writeLocalDraftRows(nextLocal);
    const next = rows.filter((x) => x.id !== id);
    setRows(next);
    if (next.length === 0) navigate("/create-order?new=1", { replace: true });
  };

  return (
    <div className={cls.shell}>
      <PageHeader title="Draft applications" />
      <div className={cls.body}>
        <div className={cls.topbar}>
          <div />
          <Button type="button" onClick={() => navigate("/create-order?new=1")}>
            {/* no redirect loop */}
            New application
          </Button>
        </div>
        {loading ? (
          <p className={cls.empty}>Loading…</p>
        ) : (
          <div className={cls.carousel}>
            {rows.map((d) => (
              <article key={d.id} className={cls.card}>
                <p className={cls.title}>{d.title}</p>
                <p className={cls.time}>
                  {new Date(d.saved_at).toLocaleString("ru-RU", {
                    day: "2-digit",
                    month: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                <p className={cls.meta}>Photo: {Array.isArray(d.payload?.photos) ? d.payload.photos.length : 0}</p>
                <div className={cls.actions}>
                  <Link className={cls.openBtn} to={`/create-order?draft=${encodeURIComponent(d.id)}&new=1`}>
                    Open
                  </Link>
                  <Button type="button" variant="outline" onClick={() => void remove(d.id)}>
                    Delete
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
      {toast ? <StatusToast tone={toast.tone} message={toast.message} onClose={closeToast} /> : null}
    </div>
  );
};

