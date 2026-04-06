import * as React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { pickPhotos } from "@/shared/lib/deviceFiles";
import {
  createOrderApi,
  getOrderDraftsApi,
  saveOrderDraftApi,
  type OrderDraftPayload,
} from "@/shared/lib/clientInboxApi";
import { readAuthSession } from "@/shared/lib/authSession";
import { useStatusToast } from "@/shared/lib/useStatusToast";
import { PageHeader } from "@/widgets/PageHeader";
import { Button } from "@/shared/ui/Button/Button";
import { StatusToast } from "@/shared/ui/StatusToast/StatusToast";
import cls from "./CreateOrderPage.module.css";

const MAX_BREAKAGE_PHOTOS = 5;

type OrderPhoto = { id: string; name: string; dataUrl: string };
type CreateOrderStep = 1 | 2 | 3;
const PENDING_SUBMIT_KEY = "createOrder.pendingSubmit.v1";
const LOCAL_PENDING_DRAFT_KEY = "createOrder.localPendingDraft.v1";
const LOCAL_DRAFTS_KEY = "createOrder.localDrafts.v1";

type LocalDraftRow = { id: string; title: string; saved_at: number; payload: OrderDraftPayload };

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

function upsertLocalDraft(payload: OrderDraftPayload, id?: string): LocalDraftRow {
  const nextId = id ?? crypto.randomUUID();
  const title = payload.device?.trim()
    ? `${payload.device.trim()}${payload.issue?.trim() ? ` — ${payload.issue.trim().slice(0, 38)}${payload.issue.trim().length > 38 ? "…" : ""}` : ""}`
    : "Draft application";
  const row: LocalDraftRow = { id: nextId, title, saved_at: Date.now(), payload };
  const rows = [row, ...readLocalDraftRows().filter((x) => x.id !== nextId)];
  writeLocalDraftRows(rows);
  return row;
}

async function syncLocalDraftRowsToServer(
  saveFn: (payload: OrderDraftPayload, draftId?: string) => Promise<any>
): Promise<void> {
  const rows = readLocalDraftRows();
  if (rows.length === 0) return;
  const failed: LocalDraftRow[] = [];
  for (const row of rows) {
    try {
      await saveFn(row.payload, row.id);
    } catch {
      failed.push(row);
    }
  }
  if (failed.length > 0) {
    writeLocalDraftRows(failed);
    return;
  }
  localStorage.removeItem(LOCAL_DRAFTS_KEY);
}

export const CreateOrderPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = React.useState<CreateOrderStep>(1);
  const [deviceCategory, setDeviceCategory] = React.useState<"phone" | "tablet" | "laptop">("phone");
  const [device, setDevice] = React.useState("");
  const [issue, setIssue] = React.useState("");
  const [contactPhone, setContactPhone] = React.useState("+7 ");
  const [visitMode, setVisitMode] = React.useState<"asap" | "slot">("asap");
  const [slot, setSlot] = React.useState("");
  const [bringInPerson, setBringInPerson] = React.useState(true);
  const [needsConsultation, setNeedsConsultation] = React.useState(false);
  const [photos, setPhotos] = React.useState<OrderPhoto[]>([]);
  const [picking, setPicking] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [currentDraftId, setCurrentDraftId] = React.useState<string | null>(null);
  const toast = useStatusToast();
  const autoSubmittedRef = React.useRef(false);

  const readLocalPendingDraft = React.useCallback((): OrderDraftPayload | null => {
    try {
      const raw = localStorage.getItem(LOCAL_PENDING_DRAFT_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as OrderDraftPayload;
      if (!parsed || typeof parsed !== "object") return null;
      return parsed;
    } catch {
      return null;
    }
  }, []);

  const captureDraftPayload = React.useCallback(
    (): OrderDraftPayload => ({
      step,
      deviceCategory,
      device: device.trim(),
      issue: issue.trim(),
      contactPhone: contactPhone.trim(),
      visitMode,
      slot,
      bringInPerson,
      needsConsultation,
      photos: photos.map((p) => ({ name: p.name, dataUrl: p.dataUrl })),
    }),
    [step, deviceCategory, device, issue, contactPhone, visitMode, slot, bringInPerson, needsConsultation, photos],
  );

  const applyDraft = React.useCallback((d: { id: string; payload: OrderDraftPayload }) => {
    setStep(d.payload.step);
    setDeviceCategory(d.payload.deviceCategory);
    setDevice(d.payload.device);
    setIssue(d.payload.issue);
    setContactPhone(d.payload.contactPhone || "+7 ");
    setVisitMode(d.payload.visitMode);
    setSlot(d.payload.slot);
    setBringInPerson(d.payload.bringInPerson);
    setNeedsConsultation(d.payload.needsConsultation);
    setPhotos(
      d.payload.photos.map((p) => ({
        id: crypto.randomUUID(),
        name: p.name,
        dataUrl: p.dataUrl,
      })),
    );
    setCurrentDraftId(d.id);
  }, []);

  const applyPayload = React.useCallback((payload: OrderDraftPayload) => {
    setStep(payload.step);
    setDeviceCategory(payload.deviceCategory);
    setDevice(payload.device);
    setIssue(payload.issue);
    setContactPhone(payload.contactPhone || "+7 ");
    setVisitMode(payload.visitMode);
    setSlot(payload.slot);
    setBringInPerson(payload.bringInPerson);
    setNeedsConsultation(payload.needsConsultation);
    setPhotos(
      (payload.photos ?? []).map((p) => ({
        id: crypto.randomUUID(),
        name: p.name,
        dataUrl: p.dataUrl,
      })),
    );
  }, []);

  const saveCurrentDraft = React.useCallback(
    async (opts?: { markPendingSubmit?: boolean; redirectToDrafts?: boolean }) => {
      try {
        const row = await saveOrderDraftApi(captureDraftPayload(), currentDraftId ?? undefined);
        setCurrentDraftId(row.id);
        if (opts?.markPendingSubmit) {
          localStorage.setItem(PENDING_SUBMIT_KEY, "1");
        }
        if (opts?.redirectToDrafts) {
          navigate("/create-order/drafts");
        }
        toast.showToast("success", "Draft saved");
        return row;
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to save draft";
        const payload = captureDraftPayload();
        const localRow = upsertLocalDraft(payload, currentDraftId ?? undefined);
        setCurrentDraftId(localRow.id);
        if (/authorization|session|401|unauthorized/i.test(msg)) {
          if (opts?.markPendingSubmit) localStorage.setItem(PENDING_SUBMIT_KEY, "1");
          if (opts?.redirectToDrafts) {
            navigate("/create-order/drafts");
          } else {
            navigate("/login?next=/create-order/drafts");
          }
          toast.showToast("success", "Draft saved locally");
          return { id: localRow.id } as any;
        }
        toast.showToast("success", "Draft saved locally");
        if (opts?.redirectToDrafts) {
          navigate("/create-order/drafts");
        }
        return { id: localRow.id } as any;
      }
    },
    [captureDraftPayload, currentDraftId, navigate, toast],
  );

  const clearCurrentForm = React.useCallback(() => {
    setStep(1);
    setDeviceCategory("phone");
    setDevice("");
    setIssue("");
    setContactPhone("+7 ");
    setVisitMode("asap");
    setSlot("");
    setBringInPerson(true);
    setNeedsConsultation(false);
    setPhotos([]);
    setCurrentDraftId(null);
  }, []);

  React.useEffect(() => {
    let mounted = true;
    const query = new URLSearchParams(location.search);
    const draftId = query.get("draft");
    const autoPost = query.get("autopost") === "1";
    const forceNew = query.get("new") === "1";
    void (async () => {
      try {
        const localPending = readLocalPendingDraft();
        if (localPending) {
          applyPayload(localPending);
        }
        await syncLocalDraftRowsToServer(saveOrderDraftApi);
        const rows = await getOrderDraftsApi();
        if (!mounted) return;
        if (draftId) {
          const hit = rows.find((x) => x.id === draftId);
          if (hit) {
            applyDraft(hit);
            return;
          }
        }
        if (forceNew) return;
        if (rows.length > 0 && !autoPost && localStorage.getItem(PENDING_SUBMIT_KEY) !== "1" && !localPending) {
          navigate("/create-order/drafts", { replace: true });
        }
      } catch {
        if (!draftId && !autoPost && !forceNew && localStorage.getItem(PENDING_SUBMIT_KEY) !== "1") {
          const locals = readLocalDraftRows();
          if (locals.length > 0) navigate("/create-order/drafts", { replace: true });
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, [applyDraft, applyPayload, location.search, navigate, readLocalPendingDraft]);

  const submitOrder = async () => {
    if (step !== 3) return;
    if (!contactPhone.trim() || (visitMode === "slot" && !slot) || photos.length === 0) return;
    if (submitting) return;
    setSubmitting(true);
    try {
      await createOrderApi({
        deviceType: deviceCategory,
        device: device.trim(),
        issue: issue.trim(),
        contactPhone: contactPhone.trim(),
        photoDataUrls: photos.map((p) => p.dataUrl),
        bringInPerson,
        needsConsultation,
      });
      sessionStorage.setItem(
        "createOrderDraft.photos",
        JSON.stringify(photos.map((p) => ({ name: p.name, dataUrl: p.dataUrl }))),
      );
      setCurrentDraftId(null);
      localStorage.removeItem(PENDING_SUBMIT_KEY);
      localStorage.removeItem(LOCAL_PENDING_DRAFT_KEY);
      navigate("/create-order/success");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to submit application";
      if (/authorization|session|401|unauthorized/i.test(msg)) {
        const localPayload = captureDraftPayload();
        localStorage.setItem(LOCAL_PENDING_DRAFT_KEY, JSON.stringify(localPayload));
        const saved = await saveCurrentDraft({ markPendingSubmit: true });
        localStorage.setItem(PENDING_SUBMIT_KEY, "1");
        const next = saved?.id ? `/create-order?draft=${encodeURIComponent(saved.id)}&autopost=1` : "/create-order";
        navigate(`/login?next=${encodeURIComponent(next)}`);
      } else {
        toast.showToast("error", msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  React.useEffect(() => {
    if (autoSubmittedRef.current) return;
    if (!readAuthSession()?.accessToken) return;
    if (localStorage.getItem(PENDING_SUBMIT_KEY) !== "1") return;
    if (step !== 3 || !contactPhone.trim() || (visitMode === "slot" && !slot) || photos.length === 0) {
      // fallback: save to the database and open the drafts page
      void (async () => {
        const row = await saveCurrentDraft();
        localStorage.removeItem(PENDING_SUBMIT_KEY);
        localStorage.removeItem(LOCAL_PENDING_DRAFT_KEY);
        if (row?.id) {
          navigate("/create-order/drafts", { replace: true });
        }
      })();
      return;
    }
    autoSubmittedRef.current = true;
    void submitOrder();
  }, [step, contactPhone, visitMode, slot, photos.length, navigate, saveCurrentDraft]);

  const onAddPhotos = async () => {
    if (photos.length >= MAX_BREAKAGE_PHOTOS) return;
    setPicking(true);
    try {
      const picked = await pickPhotos(true);
      const room = MAX_BREAKAGE_PHOTOS - photos.length;
      const slice = picked.slice(0, room);
      setPhotos((prev) => [
        ...prev,
        ...slice.map((p) => ({
          id: crypto.randomUUID(),
          name: p.file.name || "photo.jpg",
          dataUrl: p.dataUrl,
        })),
      ]);
    } catch {
      /* user cancel or read error */
    } finally {
      setPicking(false);
    }
  };

  const removePhoto = (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  const stepTitle = step === 1 ? "Device data" : step === 2 ? "Photo of the breakdown" : "Contacts and shipping";

  const goNext = () => {
    if (step === 1) {
      if (!device.trim() || !issue.trim()) return;
      setStep(2);
      return;
    }
    if (step === 2) {
      if (photos.length === 0) return;
      setStep(3);
    }
  };

  return (
    <div className={cls.shell}>
      <PageHeader title="New application" />
      <div className={cls.body}>
        <section className={cls.hero}>
          <div className={cls.heroText}>
            <h2 className={cls.heroTitle}>Registration of repair</h2>
            <p className={cls.lead}>
              Fill out the short form. The more accurate the description, the faster the technician will prepare a diagnosis.
            </p>
            <div className={cls.stepsRow}>
              <span className={[cls.stepPill, step >= 1 && cls.stepPillActive].filter(Boolean).join(" ")}>1. Device</span>
              <span className={[cls.stepPill, step >= 2 && cls.stepPillActive].filter(Boolean).join(" ")}>2. Photo</span>
              <span className={[cls.stepPill, step >= 3 && cls.stepPillActive].filter(Boolean).join(" ")}>3. Contacts</span>
            </div>
          </div>
          <div className={cls.progressCard} aria-label="Registration progress">
            <div className={cls.progressHead}>
              <span>Step {step} of 3</span>
              <span>{stepTitle}</span>
            </div>
            <div className={cls.progressTrack}>
              <span className={cls.progressValue} style={{ width: `${(step / 3) * 100}%` }} />
            </div>
          </div>
        </section>

        <div className={cls.card}>
          <form
            className={cls.form}
            onSubmit={(e) => {
              e.preventDefault();
            }}
            onKeyDown={(e) => {
              if (e.key !== "Enter") return;
              const target = e.target as HTMLElement | null;
              if (target?.tagName === "TEXTAREA") return;
              e.preventDefault();
            }}
          >
            {step === 1 ? (
              <section className={cls.section}>
                <h3 className={cls.sectionTitle}>Device</h3>
                <div className={cls.gridTwo}>
                  <label className={cls.label}>
                    Device type
                    <select
                      className={cls.input}
                      value={deviceCategory}
                      onChange={(e) => setDeviceCategory(e.target.value as "phone" | "tablet" | "laptop")}
                    >
                      <option value="phone">Smartphone</option>
                      <option value="tablet">Tablet</option>
                      <option value="laptop">Laptop</option>
                    </select>
                  </label>
                  <label className={cls.label}>
                    Model
                    <input
                      className={cls.input}
                      value={device}
                      onChange={(e) => setDevice(e.target.value)}
                      placeholder="For example: iPhone 14"
                      required
                    />
                  </label>
                </div>
                <label className={cls.label}>
                  What's happened
                  <textarea
                    className={cls.textarea}
                    value={issue}
                    onChange={(e) => setIssue(e.target.value)}
                    placeholder="Describe the symptoms, when it started and what you have already tried"
                    required
                  />
                </label>
              </section>
            ) : null}

            {step === 2 ? (
              <section className={cls.section}>
                <h3 className={cls.sectionTitle}>Photo of the breakdown</h3>
                <div className={cls.uploadBox}>
                  <span className={cls.uploadTitle}>Add at least 1 photo</span>
                  <span className={cls.fileHint}>From device or camera (PNG/JPG, up to {MAX_BREAKAGE_PHOTOS} files). You cannot submit an application without a photo.</span>
                  <Button type="button" variant="outline" onClick={() => void onAddPhotos()} disabled={picking || submitting || photos.length >= MAX_BREAKAGE_PHOTOS}>
                    {picking ? "Choice…" : photos.length >= MAX_BREAKAGE_PHOTOS ? "Maximum photo" : "Select photo"}
                  </Button>
                  {photos.length > 0 ? (
                    <div className={cls.photoPreviewGrid}>
                      {photos.map((p) => (
                        <div key={p.id} className={cls.photoPreviewItem}>
                          <img className={cls.photoPreviewImg} src={p.dataUrl} alt="" />
                          <button type="button" className={cls.photoRemove} onClick={() => removePhoto(p.id)} aria-label="Remove photo">
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className={cls.fileHint}>Currently photos: 0 from {MAX_BREAKAGE_PHOTOS}</p>
                  )}
                </div>
              </section>
            ) : null}

            {step === 3 ? (
              <>
              <section className={cls.section}>
                <h3 className={cls.sectionTitle}>Contacts and visit</h3>
                <label className={cls.label}>
                  Contact phone number
                  <input
                    className={cls.input}
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    inputMode="tel"
                    autoComplete="tel"
                    required
                  />
                </label>

                <div className={cls.label}>
                  When is it convenient to come
                  <div className={cls.radioGrid}>
                    <label className={[cls.radioCard, visitMode === "asap" && cls.radioCardActive].filter(Boolean).join(" ")}>
                      <input
                        type="radio"
                        name="visit"
                        checked={visitMode === "asap"}
                        onChange={() => setVisitMode("asap")}
                      />
                      <span>Coming soon</span>
                    </label>
                    <label className={[cls.radioCard, visitMode === "slot" && cls.radioCardActive].filter(Boolean).join(" ")}>
                      <input
                        type="radio"
                        name="visit"
                        checked={visitMode === "slot"}
                        onChange={() => setVisitMode("slot")}
                      />
                      <span>Select date and time</span>
                    </label>
                  </div>
                  {visitMode === "slot" ? (
                    <input
                      className={[cls.input, cls.slot].join(" ")}
                      type="datetime-local"
                      value={slot}
                      onChange={(e) => setSlot(e.target.value)}
                      required={visitMode === "slot"}
                    />
                  ) : null}
                </div>
              </section>
                <section className={cls.section}>
                  <h3 className={cls.sectionTitle}>Additionally</h3>
                  <div className={cls.checks}>
                    <label className={cls.checkCard}>
                      <input
                        type="checkbox"
                        checked={bringInPerson}
                        onChange={(e) => setBringInPerson(e.target.checked)}
                      />
                      <span>I will bring the device personally</span>
                    </label>
                    <label className={cls.checkCard}>
                      <input
                        type="checkbox"
                        checked={needsConsultation}
                        onChange={(e) => setNeedsConsultation(e.target.checked)}
                      />
                      <span>Need advice before repair</span>
                    </label>
                  </div>
                </section>
                <section className={cls.section}>
                  <h3 className={cls.sectionTitle}>Check before sending</h3>
                  <div className={cls.summaryList}>
                    <div className={cls.summaryRow}><span>Device</span><strong>{deviceCategory ==="phone" ? "Smartphone" : deviceCategory === "tablet" ? "Tablet" : "Laptop"}</strong></div>
                    <div className={cls.summaryRow}><span>Model</span><strong>{device ||"—"}</strong></div>
                    <div className={cls.summaryRow}><span>Phone</span><strong>{contactPhone ||"—"}</strong></div>
                    <div className={cls.summaryRow}><span>Photo</span><strong>{photos.length}</strong></div>
                    <div className={cls.summaryRow}><span>When convenient</span><strong>{visitMode ==="asap" ? "Coming soon" : slot || "—"}</strong></div>
                  </div>
                </section>
              </>
            ) : null}

            <div className={cls.actions}>
              {step > 1 ? (
                <Button type="button" variant="outline" onClick={() => setStep((s) => (s - 1) as CreateOrderStep)}>
                  Back
                </Button>
              ) : (
                <div className={cls.actionsLeft}>
                  <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                    Back
                  </Button>
                  <Button type="button" variant="ghost" onClick={clearCurrentForm}>
                    Clear
                  </Button>
                </div>
              )}
              {step < 3 ? (
                <Button type="button" onClick={goNext} disabled={step === 1 ? !device.trim() || !issue.trim() : photos.length === 0}>
                  Next
                </Button>
              ) : (
                <div className={cls.actionsRight}>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => void saveCurrentDraft({ redirectToDrafts: true })}
                    disabled={submitting}
                  >
                    Save as draft
                  </Button>
                  <Button
                    type="button"
                    onClick={() => void submitOrder()}
                    disabled={submitting || !contactPhone.trim() || (visitMode === "slot" && !slot) || photos.length === 0}
                  >
                    {submitting ? "Sending..." : "Send a request"}
                  </Button>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
      {toast.toast ? <StatusToast tone={toast.toast.tone} message={toast.toast.message} onClose={toast.closeToast} /> : null}
    </div>
  );
};
