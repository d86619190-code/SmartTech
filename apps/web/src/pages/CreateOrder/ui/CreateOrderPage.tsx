import * as React from "react";
import { useNavigate } from "react-router-dom";
import { pickPhotos } from "@/shared/lib/deviceFiles";
import { createOrderApi } from "@/shared/lib/clientInboxApi";
import { useStatusToast } from "@/shared/lib/useStatusToast";
import { PageHeader } from "@/widgets/PageHeader";
import { Button } from "@/shared/ui/Button/Button";
import { StatusToast } from "@/shared/ui/StatusToast/StatusToast";
import cls from "./CreateOrderPage.module.css";

const MAX_BREAKAGE_PHOTOS = 5;

type OrderPhoto = { id: string; name: string; dataUrl: string };
type CreateOrderStep = 1 | 2 | 3;

export const CreateOrderPage: React.FC = () => {
  const navigate = useNavigate();
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
  const toast = useStatusToast();

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
      navigate("/create-order/success");
    } catch (e) {
      toast.showToast("error", e instanceof Error ? e.message : "Не удалось отправить заявку");
    } finally {
      setSubmitting(false);
    }
  };

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

  const stepTitle = step === 1 ? "Данные устройства" : step === 2 ? "Фото поломки" : "Контакты и отправка";

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
      <PageHeader title="Новая заявка" />
      <div className={cls.body}>
        <section className={cls.hero}>
          <div className={cls.heroText}>
            <h2 className={cls.heroTitle}>Оформление ремонта</h2>
            <p className={cls.lead}>
              Заполните короткую форму. Чем точнее описание, тем быстрее мастер подготовит диагностику.
            </p>
            <div className={cls.stepsRow}>
              <span className={[cls.stepPill, step >= 1 && cls.stepPillActive].filter(Boolean).join(" ")}>1. Устройство</span>
              <span className={[cls.stepPill, step >= 2 && cls.stepPillActive].filter(Boolean).join(" ")}>2. Фото</span>
              <span className={[cls.stepPill, step >= 3 && cls.stepPillActive].filter(Boolean).join(" ")}>3. Контакты</span>
            </div>
          </div>
          <div className={cls.progressCard} aria-label="Прогресс оформления">
            <div className={cls.progressHead}>
              <span>Шаг {step} из 3</span>
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
                <h3 className={cls.sectionTitle}>Устройство</h3>
                <div className={cls.gridTwo}>
                  <label className={cls.label}>
                    Тип устройства
                    <select
                      className={cls.input}
                      value={deviceCategory}
                      onChange={(e) => setDeviceCategory(e.target.value as "phone" | "tablet" | "laptop")}
                    >
                      <option value="phone">Смартфон</option>
                      <option value="tablet">Планшет</option>
                      <option value="laptop">Ноутбук</option>
                    </select>
                  </label>
                  <label className={cls.label}>
                    Модель
                    <input
                      className={cls.input}
                      value={device}
                      onChange={(e) => setDevice(e.target.value)}
                      placeholder="Например: iPhone 14"
                      required
                    />
                  </label>
                </div>
                <label className={cls.label}>
                  Что случилось
                  <textarea
                    className={cls.textarea}
                    value={issue}
                    onChange={(e) => setIssue(e.target.value)}
                    placeholder="Опишите симптомы, когда началось и что уже пробовали"
                    required
                  />
                </label>
              </section>
            ) : null}

            {step === 2 ? (
              <section className={cls.section}>
                <h3 className={cls.sectionTitle}>Фото поломки</h3>
                <div className={cls.uploadBox}>
                  <span className={cls.uploadTitle}>Добавьте минимум 1 фото</span>
                  <span className={cls.fileHint}>С устройства или камеры (PNG/JPG, до {MAX_BREAKAGE_PHOTOS} файлов). Без фото заявку нельзя отправить.</span>
                  <Button type="button" variant="outline" onClick={() => void onAddPhotos()} disabled={picking || submitting || photos.length >= MAX_BREAKAGE_PHOTOS}>
                    {picking ? "Выбор…" : photos.length >= MAX_BREAKAGE_PHOTOS ? "Максимум фото" : "Выбрать фото"}
                  </Button>
                  {photos.length > 0 ? (
                    <div className={cls.photoPreviewGrid}>
                      {photos.map((p) => (
                        <div key={p.id} className={cls.photoPreviewItem}>
                          <img className={cls.photoPreviewImg} src={p.dataUrl} alt="" />
                          <button type="button" className={cls.photoRemove} onClick={() => removePhoto(p.id)} aria-label="Убрать фото">
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className={cls.fileHint}>Сейчас фото: 0 из {MAX_BREAKAGE_PHOTOS}</p>
                  )}
                </div>
              </section>
            ) : null}

            {step === 3 ? (
              <>
              <section className={cls.section}>
                <h3 className={cls.sectionTitle}>Контакты и визит</h3>
                <label className={cls.label}>
                  Телефон для связи
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
                  Когда удобно приехать
                  <div className={cls.radioGrid}>
                    <label className={[cls.radioCard, visitMode === "asap" && cls.radioCardActive].filter(Boolean).join(" ")}>
                      <input
                        type="radio"
                        name="visit"
                        checked={visitMode === "asap"}
                        onChange={() => setVisitMode("asap")}
                      />
                      <span>В ближайшее время</span>
                    </label>
                    <label className={[cls.radioCard, visitMode === "slot" && cls.radioCardActive].filter(Boolean).join(" ")}>
                      <input
                        type="radio"
                        name="visit"
                        checked={visitMode === "slot"}
                        onChange={() => setVisitMode("slot")}
                      />
                      <span>Выбрать дату и время</span>
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
                  <h3 className={cls.sectionTitle}>Дополнительно</h3>
                  <div className={cls.checks}>
                    <label className={cls.checkCard}>
                      <input
                        type="checkbox"
                        checked={bringInPerson}
                        onChange={(e) => setBringInPerson(e.target.checked)}
                      />
                      <span>Принесу устройство лично</span>
                    </label>
                    <label className={cls.checkCard}>
                      <input
                        type="checkbox"
                        checked={needsConsultation}
                        onChange={(e) => setNeedsConsultation(e.target.checked)}
                      />
                      <span>Нужна консультация перед ремонтом</span>
                    </label>
                  </div>
                </section>
                <section className={cls.section}>
                  <h3 className={cls.sectionTitle}>Проверьте перед отправкой</h3>
                  <div className={cls.summaryList}>
                    <div className={cls.summaryRow}><span>Устройство</span><strong>{deviceCategory === "phone" ? "Смартфон" : deviceCategory === "tablet" ? "Планшет" : "Ноутбук"}</strong></div>
                    <div className={cls.summaryRow}><span>Модель</span><strong>{device || "—"}</strong></div>
                    <div className={cls.summaryRow}><span>Телефон</span><strong>{contactPhone || "—"}</strong></div>
                    <div className={cls.summaryRow}><span>Фото</span><strong>{photos.length}</strong></div>
                    <div className={cls.summaryRow}><span>Когда удобно</span><strong>{visitMode === "asap" ? "В ближайшее время" : slot || "—"}</strong></div>
                  </div>
                </section>
              </>
            ) : null}

            <div className={cls.actions}>
              {step > 1 ? (
                <Button type="button" variant="outline" onClick={() => setStep((s) => (s - 1) as CreateOrderStep)}>
                  Назад
                </Button>
              ) : (
                <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                  Назад
                </Button>
              )}
              {step < 3 ? (
                <Button type="button" onClick={goNext} disabled={step === 1 ? !device.trim() || !issue.trim() : photos.length === 0}>
                  Далее
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={() => void submitOrder()}
                  disabled={submitting || !contactPhone.trim() || (visitMode === "slot" && !slot) || photos.length === 0}
                >
                  {submitting ? "Отправка..." : "Отправить заявку"}
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
      {toast.toast ? <StatusToast tone={toast.toast.tone} message={toast.toast.message} onClose={toast.closeToast} /> : null}
    </div>
  );
};
