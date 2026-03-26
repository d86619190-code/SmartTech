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
        <TechPageHeader title="Этапы ремонта" subtitle="Загрузка…" />
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
            reader.onerror = () => reject(new Error("Не удалось прочитать файл"));
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
      showToast("success", "Этап сохранён — клиент увидит обновление");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Не удалось сохранить этап";
      showToast("error", msg);
    } finally {
      setSaving(false);
    }
  };

  const addProgress = async () => {
    const title = entryTitle.trim();
    if (!title) {
      showToast("error", "Укажите название подпункта");
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
      showToast("success", "Подпункт добавлен в историю");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Не удалось добавить подпункт";
      showToast("error", msg);
    } finally {
      setSaving(false);
    }
  };

  const progressLog = Array.isArray(baseJob.progressLog) ? [...baseJob.progressLog].reverse() : [];

  return (
    <>
      <TechPageHeader title="Этапы ремонта" subtitle="Обновление статуса для клиента и администрации." />
      <TechCard style={{ padding: 24, marginBottom: 20 }}>
        <TechTimeline stage={current} />
        <div style={{ marginTop: 24, maxWidth: 360 }}>
          <AdminSelect label="Текущий этап" value={current} onChange={(e) => setStage(e.target.value as TechRepairStage)}>
            <option value="accepted">Принято</option>
            <option value="diagnostics">Диагностика</option>
            <option value="waiting_approval">Согласование</option>
            <option value="repair">Ремонт</option>
            <option value="ready">Готово</option>
            <option value="completed">Выдано</option>
          </AdminSelect>
        </div>
      </TechCard>
      <TechCard style={{ padding: 20, marginBottom: 20 }}>
        <h3 className={cls.sectionTitle}>Подпункты этапа и фото</h3>
        <div style={{ display: "grid", gap: 10 }}>
          <label>
            <span className={cls.muted}>Тип записи</span>
            <AdminSelect value={entryKind} onChange={(e) => setEntryKind(e.target.value as "stage" | "substep")}>
              <option value="substep">Подпункт</option>
              <option value="stage">Ключевое обновление этапа</option>
            </AdminSelect>
          </label>
          <label>
            <span className={cls.muted}>Название</span>
            <input
              value={entryTitle}
              onChange={(e) => setEntryTitle(e.target.value)}
              placeholder="Например: Проверка цепи питания"
              style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--color-order-row-border)" }}
            />
          </label>
          <label>
            <span className={cls.muted}>Описание</span>
            <textarea
              value={entryDescription}
              onChange={(e) => setEntryDescription(e.target.value)}
              rows={3}
              placeholder="Что сделали, что нашли, что дальше"
              style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--color-order-row-border)", resize: "vertical" }}
            />
          </label>
          <label>
            <span className={cls.muted}>Фото</span>
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
            Добавить в историю
          </Button>
        </div>
      </TechCard>
      <TechCard style={{ padding: 20, marginBottom: 20 }}>
        <h3 className={cls.sectionTitle}>Хронология работ</h3>
        {progressLog.length === 0 ? (
          <p className={cls.p}>Записей пока нет.</p>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {progressLog.map((item: any) => (
              <div key={item.id} style={{ border: "1px solid var(--color-order-row-border)", borderRadius: 12, padding: 12 }}>
                <p className={cls.p}>
                  <strong>{item.title}</strong> · {item.atLabel}
                </p>
                <p className={cls.muted}>
                  {item.kind === "stage" ? "Этап" : "Подпункт"} · {item.stage}
                </p>
                {item.description ? <p className={cls.p} style={{ marginTop: 6 }}>{item.description}</p> : null}
                {Array.isArray(item.photoDataUrls) && item.photoDataUrls.length ? (
                  <div style={{ marginTop: 8, display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(88px,1fr))", gap: 8 }}>
                    {item.photoDataUrls.map((src: string, i: number) => (
                      <img key={`${item.id}-${i}`} src={src} alt="" style={{ width: "100%", aspectRatio: "1 / 1", objectFit: "cover", borderRadius: 8 }} />
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </TechCard>
      <Button type="button" onClick={() => void save()} disabled={saving}>
        {saving ? "Сохранение…" : "Сохранить этап"}
      </Button>
      <Link className={cls.link} to={`/tech/repairs/${baseJob.id}`} style={{ marginLeft: 16 }}>
        К карточке
      </Link>
      {toast ? <StatusToast tone={toast.tone} message={toast.message} onClose={closeToast} /> : null}
    </>
  );
};
