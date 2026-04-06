import * as React from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import type { TechRepairStage } from "@/entities/technician";
import { techApi } from "@/shared/lib/techApi";
import { useStatusToast } from "@/shared/lib/useStatusToast";
import { SkeletonCard } from "@/shared/ui/Skeleton";
import { Button } from "@/shared/ui/Button/Button";
import { StatusToast } from "@/shared/ui/StatusToast/StatusToast";
import { AdminSelect } from "@/widgets/admin";
import { TechCard, TechPageHeader, TechTimeline } from "@/widgets/technician";
import cls from "./techPages.module.css";

export const TechTrackingPage: React.FC = () => {
  const { repairId } = useParams();
  const [baseJob, setBaseJob] = React.useState<any | null>(null);
  const [stage, setStage] = React.useState<TechRepairStage | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [entryTitle, setEntryTitle] = React.useState("");
  const [entryDescription, setEntryDescription] = React.useState("");
  const [entryPhotos, setEntryPhotos] = React.useState<string[]>([]);
  const [entryKind, setEntryKind] = React.useState<"stage" | "substep">("substep");
  const { toast, showToast, closeToast } = useStatusToast();

  React.useEffect(() => {
    if (!repairId) return;
    void (async () => {
      const res = await techApi.getRepairById(repairId);
      setBaseJob(res.repair);
      setStage(null);
    })();
  }, [repairId]);

  if (!repairId) return <Navigate to="/tech/tasks" replace />;
  if (!baseJob) {
    return (
      <>
        <TechPageHeader title="Repair stages" subtitle="Loading…" />
        <SkeletonCard rows={5} />
      </>
    );
  }
  const current = stage ?? baseJob.stage;

  const onPickPhotos = async (files: FileList | null) => {
    if (!files?.length) return;
    const selected = Array.from(files).slice(0, 6);
    const dataUrls = await Promise.all(
      selected.map(
        (f) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result ?? ""));
            reader.onerror = () => reject(new Error("Failed to read file"));
            reader.readAsDataURL(f);
          }),
      ),
    );
    setEntryPhotos((prev) => [...prev, ...dataUrls.filter(Boolean)].slice(0, 8));
  };

  const save = async () => {
    setSaving(true);
    try {
      const res = await techApi.saveStage(baseJob.id, current);
      setBaseJob(res.repair);
      setStage(null);
      showToast("success", "The stage is saved - the client will see the update");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to save stage";
      showToast("error", msg);
    } finally {
      setSaving(false);
    }
  };

  const addProgress = async () => {
    const title = entryTitle.trim();
    if (!title) {
      showToast("error", "Specify the name of the sub-item");
      return;
    }
    setSaving(true);
    try {
      const res = await techApi.addProgressEntry(baseJob.id, {
        stage: current,
        kind: entryKind,
        title,
        description: entryDescription.trim() || undefined,
        photoDataUrls: entryPhotos,
      });
      setBaseJob(res.repair);
      setEntryTitle("");
      setEntryDescription("");
      setEntryPhotos([]);
      showToast("success", "Sub-item added to history");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to add subitem";
      showToast("error", msg);
    } finally {
      setSaving(false);
    }
  };

  const progressLog = Array.isArray(baseJob.progressLog) ? [...baseJob.progressLog].reverse() : [];

  return (
    <>
      <TechPageHeader title="Repair stages" subtitle="Status update for client and administration." />
      <TechCard style={{ padding: 24, marginBottom: 20 }}>
        <TechTimeline stage={current} />
        <div style={{ marginTop: 24, maxWidth: 360 }}>
          <AdminSelect label="Current stage" value={current} onChange={(e) => setStage(e.target.value as TechRepairStage)}>
            <option value="accepted">Accepted</option>
            <option value="diagnostics">Diagnostics</option>
            <option value="waiting_approval">Coordination</option>
            <option value="repair">Repair</option>
            <option value="ready">Ready</option>
            <option value="completed">Issued</option>
          </AdminSelect>
        </div>
      </TechCard>
      <TechCard style={{ padding: 20, marginBottom: 20 }}>
        <h3 className={cls.sectionTitle}>Stage sub-items and photos</h3>
        <div style={{ display: "grid", gap: 10 }}>
          <label>
            <span className={cls.muted}>Record type</span>
            <AdminSelect value={entryKind} onChange={(e) => setEntryKind(e.target.value as "stage" | "substep")}>
              <option value="substep">Sub-clause</option>
              <option value="stage">Key Stage Update</option>
            </AdminSelect>
          </label>
          <label>
            <span className={cls.muted}>Name</span>
            <input
              value={entryTitle}
              onChange={(e) => setEntryTitle(e.target.value)}
              placeholder="For example: Checking the power circuit"
              style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--color-order-row-border)" }}
            />
          </label>
          <label>
            <span className={cls.muted}>Description</span>
            <textarea
              value={entryDescription}
              onChange={(e) => setEntryDescription(e.target.value)}
              rows={3}
              placeholder="What did you do, what did you find, what’s next?"
              style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--color-order-row-border)", resize: "vertical" }}
            />
          </label>
          <label>
            <span className={cls.muted}>Photo</span>
            <input type="file" accept="image/*" multiple onChange={(e) => void onPickPhotos(e.target.files)} />
          </label>
          {entryPhotos.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(96px,1fr))", gap: 8 }}>
              {entryPhotos.map((src, i) => (
                <img key={`${i}-${src.slice(0, 20)}`} src={src} alt="" style={{ width: "100%", aspectRatio: "1 / 1", objectFit: "cover", borderRadius: 10 }} />
              ))}
            </div>
          ) : null}
          <Button type="button" variant="outline" onClick={() => void addProgress()} disabled={saving}>
            Add to story
          </Button>
        </div>
      </TechCard>
      <TechCard style={{ padding: 20, marginBottom: 20 }}>
        <h3 className={cls.sectionTitle}>Chronology of work by stages</h3>
        {progressLog.length === 0 ? (
          <p className={cls.p}>There are no entries yet.</p>
        ) : (
          <div style={{ display: "grid", gap: 14 }}>
            {(["accepted", "diagnostics", "repair", "ready", "completed"] as const).map((stageKey) => {
              const items = progressLog.filter((x: any) => x.stage === stageKey);
              if (!items.length) return null;
              const titleMap: Record<string, string> = {
                accepted: "Accepted",
                diagnostics: "Diagnostics - sub-items",
                repair: "Work/repair - sub-items",
                ready: "Ready",
                completed: "Issued",
              };
              return (
                <details key={stageKey} open>
                  <summary className={cls.p}>
                    <strong>{titleMap[stageKey] ?? stageKey}</strong>
                  </summary>
                  <div style={{ marginTop: 8, display: "grid", gap: 10 }}>
                    {items.map((item: any) => (
                      <div
                        key={item.id}
                        style={{ border: "1px solid var(--color-order-row-border)", borderRadius: 12, padding: 12 }}
                      >
                        <p className={cls.p}>
                          <strong>{item.title}</strong> · {item.atLabel}
                        </p>
                        <p className={cls.muted}>
                          {item.kind === "stage" ? "Stage" : "Sub-clause"} · {item.stage}
                        </p>
                        {item.description ? <p className={cls.p} style={{ marginTop: 6 }}>{item.description}</p> : null}
                        {Array.isArray(item.photoDataUrls) && item.photoDataUrls.length ? (
                          <div
                            style={{
                              marginTop: 8,
                              display: "grid",
                              gridTemplateColumns: "repeat(auto-fill,minmax(88px,1fr))",
                              gap: 8,
                            }}
                          >
                            {item.photoDataUrls.map((src: string, i: number) => (
                              <img
                                key={`${item.id}-${i}`}
                                src={src}
                                alt=""
                                style={{
                                  width: "100%",
                                  aspectRatio: "1 / 1",
                                  objectFit: "cover",
                                  borderRadius: 8,
                                }}
                              />
                            ))}
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </details>
              );
            })}
          </div>
        )}
      </TechCard>
      <Button type="button" onClick={() => void save()} disabled={saving}>
        {saving ? "Saving…" : "Save stage"}
      </Button>
      <Link className={cls.link} to={`/tech/repairs/${baseJob.id}`} style={{ marginLeft: 16 }}>
        To the card
      </Link>
      {toast ? <StatusToast tone={toast.tone} message={toast.message} onClose={closeToast} /> : null}
    </>
  );
};
