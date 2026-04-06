import * as React from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { techApi } from "@/shared/lib/techApi";
import { downloadDataUrl, MAX_DIAGNOSTIC_PHOTO_BYTES, mimeFromDataUrl, pickFiles } from "@/shared/lib/deviceFiles";
import { useStatusToast } from "@/shared/lib/useStatusToast";
import { SkeletonCard } from "@/shared/ui/Skeleton";
import { Button } from "@/shared/ui/Button/Button";
import { StatusToast } from "@/shared/ui/StatusToast/StatusToast";
import { AdminInput } from "@/widgets/admin";
import { TechCard, TechPageHeader } from "@/widgets/technician";
import cls from "./techPages.module.css";

export const TechDiagnosticsPage: React.FC = () => {
  const { repairId } = useParams();
  const [job, setJob] = React.useState<any | null>(null);
  const [issues, setIssues] = React.useState<string[]>([]);
  const [serverPhotoUrls, setServerPhotoUrls] = React.useState<string[]>([]);
  const [pendingPhotoUrls, setPendingPhotoUrls] = React.useState<string[]>([]);
  const [note, setNote] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [picking, setPicking] = React.useState(false);
  const { toast, showToast, closeToast } = useStatusToast();

  React.useEffect(() => {
    if (!repairId) return;
    void (async () => {
      const res = await techApi.getRepairById(repairId);
      setJob(res.repair);
      setIssues(res.repair.diagnosticsIssues ?? []);
      setServerPhotoUrls(Array.isArray(res.repair.photoUrls) ? res.repair.photoUrls : []);
      setPendingPhotoUrls([]);
    })();
  }, [repairId]);
  if (!repairId) return <Navigate to="/tech/tasks" replace />;
  if (!job) {
    return (
      <>
        <TechPageHeader title="Diagnostics" subtitle="Loading…" />
        <SkeletonCard rows={5} />
      </>
    );
  }

  const displayCount = serverPhotoUrls.length + pendingPhotoUrls.length;

  const addIssue = () => {
    const t = note.trim();
    if (!t) return;
    setIssues((prev) => [...prev, t]);
    setNote("");
  };

  const onAddPhotos = async () => {
    setPicking(true);
    try {
      const picked = await pickFiles({
        accept: "image/*",
        multiple: true,
        maxBytesPerFile: MAX_DIAGNOSTIC_PHOTO_BYTES,
      });
      if (!picked.length) return;
      const room = Math.max(0, 12 - pendingPhotoUrls.length - serverPhotoUrls.length);
      const slice = picked.slice(0, room).map((p) => p.dataUrl);
      setPendingPhotoUrls((prev) => [...prev, ...slice]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to add photo";
      showToast("error", msg);
    } finally {
      setPicking(false);
    }
  };

  const removePendingAt = (indexInPending: number) => {
    setPendingPhotoUrls((prev) => prev.filter((_, i) => i !== indexInPending));
  };

  const save = async () => {
    setSaving(true);
    try {
      const res = await techApi.saveDiagnostics(job.id, issues, pendingPhotoUrls.length ? pendingPhotoUrls : undefined);
      setJob(res.repair);
      setServerPhotoUrls(Array.isArray(res.repair.photoUrls) ? res.repair.photoUrls : []);
      setPendingPhotoUrls([]);
      showToast("success", "Diagnostics saved");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to save";
      showToast("error", msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <TechPageHeader title="Diagnostics" subtitle={`${job.publicId} · Fault recording and photos.`} />
      <TechCard style={{ padding: 24, marginBottom: 16 }}>
        <p className={cls.blockTitle}>Identified problems</p>
        <ul style={{ margin: "0 0 16px", paddingLeft: 20 }}>
          {issues.map((x) => (
            <li key={x} className={cls.p}>
              {x}
            </li>
          ))}
        </ul>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ flex: "1 1 220px" }}>
            <AdminInput placeholder="Add item" value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
          <Button type="button" variant="outline" onClick={addIssue}>
            Add
          </Button>
        </div>
      </TechCard>
      <TechCard style={{ padding: 24, marginBottom: 16 }}>
        <p className={cls.blockTitle}>Photos from diagnostics</p>
        <p className={cls.muted} style={{ marginTop: 0, marginBottom: 12 }}>
          Files from the device; after saving they end up in the repair card locally (without the cloud).
        </p>
        <div className={cls.photoGrid}>
          <button
            type="button"
            className={cls.photoStub}
            onClick={() => void onAddPhotos()}
            disabled={picking || displayCount >= 16}
          >
            {picking ? "…" : "+ From device"}
          </button>
          {serverPhotoUrls.map((url, i) => (
            <div key={`s-${i}`} className={cls.photoCell}>
              <img className={cls.photoThumb} src={url} alt="" />
              <button
                type="button"
                className={cls.photoDownload}
                onClick={() => {
                  const ext = mimeFromDataUrl(url).includes("png") ? "png" : "jpg";
                  downloadDataUrl(url, `diagnostic-${i + 1}.${ext}`);
                }}
              >
                Save
              </button>
            </div>
          ))}
          {pendingPhotoUrls.map((url, i) => (
            <div key={`p-${i}`} className={cls.photoCell}>
              <img className={cls.photoThumb} src={url} alt="" />
              <button type="button" className={cls.photoRemoveSmall} onClick={() => removePendingAt(i)}>
                Put away
              </button>
            </div>
          ))}
        </div>
      </TechCard>
      <Button type="button" onClick={() => void save()} disabled={saving}>
        {saving ? "Saving…" : "Save"}
      </Button>
      <Link className={cls.link} to={`/tech/repairs/${job.id}`} style={{ marginLeft: 16 }}>
        To the repair card
      </Link>
      {toast ? <StatusToast tone={toast.tone} message={toast.message} onClose={closeToast} /> : null}
    </>
  );
};
