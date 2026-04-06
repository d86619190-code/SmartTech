import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import { SkeletonCard, SkeletonProfileHero } from "@/shared/ui/Skeleton";
import { PageHeader } from "@/widgets/PageHeader";
import { Button } from "@/shared/ui/Button/Button";
import { getMe, logoutCurrentSession, updateMe } from "@/shared/lib/authApi";
import { readAuthSession } from "@/shared/lib/authSession";
import { useI18n } from "@/shared/i18n/i18n";
import { useStatusToast } from "@/shared/lib/useStatusToast";
import { StatusToast } from "@/shared/ui/StatusToast/StatusToast";
import cls from "./ProfilePage.module.css";

const MAX_AVATAR_SIDE = 720;
const MAX_AVATAR_BYTES = 220 * 1024; // безопасно ниже серверного лимита

function hasCyrillic(s: string): boolean {
  return /[\u0400-\u04FF]/.test(s);
}

/** Имя выглядит как написанное латиницей (без кириллицы) — для русскоязычного сервиса просим указать имя по-русски. */
function looksLikeLatinOnlyName(s: string): boolean {
  const t = s.trim();
  if (t.length < 2) return false;
  if (hasCyrillic(t)) return false;
  return /^[a-zA-Z.\-'\s]+$/.test(t) && /[a-zA-Z]/.test(t);
}

function dataUrlBytes(dataUrl: string): number {
  const base64 = dataUrl.split(",")[1] ?? "";
  return Math.floor((base64.length * 3) / 4);
}

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Не удалось прочитать изображение"));
    };
    img.src = objectUrl;
  });
}

async function compressAvatarToDataUrl(file: File): Promise<string> {
  const img = await loadImageFromFile(file);
  const scale = Math.min(1, MAX_AVATAR_SIDE / Math.max(img.width, img.height));
  const width = Math.max(1, Math.round(img.width * scale));
  const height = Math.max(1, Math.round(img.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas недоступен");
  ctx.drawImage(img, 0, 0, width, height);

  // Несколько попыток с постепенным снижением качества.
  const qualities = [0.9, 0.82, 0.74, 0.66, 0.58];
  let best = canvas.toDataURL("image/jpeg", qualities[0]);
  for (const q of qualities) {
    const next = canvas.toDataURL("image/jpeg", q);
    best = next;
    if (dataUrlBytes(next) <= MAX_AVATAR_BYTES) break;
  }
  return best;
}

export const ProfilePage: React.FC = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [role, setRole] = React.useState<"client" | "master" | "admin" | "boss">("client");
  const [name, setName] = React.useState(t("profile.defaultUser"));
  const [avatarUrl, setAvatarUrl] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isAvatarSaving, setIsAvatarSaving] = React.useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = React.useState(false);
  const [avatarDraftUrl, setAvatarDraftUrl] = React.useState("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [hideNameReminder, setHideNameReminder] = React.useState(false);
  const { toast, showToast, closeToast } = useStatusToast();

  React.useEffect(() => {
    const session = readAuthSession();
    if (!session) {
      navigate("/login", { replace: true });
      return;
    }
    void (async () => {
      try {
        const me = await getMe();
        setRole(me.role);
        setName(me.name ?? t("profile.defaultUser"));
        setAvatarUrl(me.avatarUrl ?? "");
        setPhone(me.phone ?? "");
        setEmail(me.email ?? "");
      } catch (e) {
        const msg = e instanceof Error ? e.message : t("errors.loadProfile");
        const isAuthError = /требуется авторизация|сессия истекла|401/i.test(msg);
        if (isAuthError) {
          navigate("/login", { replace: true });
        } else {
          // Не уводим на логин при временной ошибке API, чтобы не создавать цикл.
          showToast("error", msg);
        }
      } finally {
        setIsLoading(false);
      }
    })();
  }, [navigate, showToast]);

  React.useEffect(() => {
    const session = readAuthSession();
    const uid = session?.user.id;
    if (!uid) return;
    const key = `profile.nameReminder.dismissed.${uid}`;
    setHideNameReminder(localStorage.getItem(key) === "1");
  }, []);

  const logout = async () => {
    await logoutCurrentSession();
    navigate("/login", { replace: true });
  };

  const onSave = async () => {
    try {
      setIsSaving(true);
      const updated = await updateMe(name, avatarUrl, phone);
      setRole(updated.role);
      setName(updated.name ?? t("profile.defaultUser"));
      setAvatarUrl(updated.avatarUrl ?? "");
      setPhone(updated.phone ?? "");
      setEmail(updated.email ?? "");
      showToast("success", t("profile.saved"));
    } catch (e) {
      const msg = e instanceof Error ? e.message : t("errors.saveProfile");
      showToast("error", msg);
    } finally {
      setIsSaving(false);
    }
  };

  const openAvatarModal = () => {
    setAvatarDraftUrl(avatarUrl);
    setIsAvatarModalOpen(true);
  };

  const closeAvatarModal = () => {
    setIsAvatarModalOpen(false);
  };

  const onPickAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const onAvatarFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast("error", t("errors.pickImage"));
      return;
    }
    if (file.size > 6 * 1024 * 1024) {
      showToast("error", t("errors.fileTooLarge"));
      return;
    }
    void (async () => {
      try {
        const compressed = await compressAvatarToDataUrl(file);
        setAvatarDraftUrl(compressed);
        showToast("info", t("profile.avatarOptimized"));
      } catch (err) {
        const msg = err instanceof Error ? err.message : t("errors.imageProcessFailed");
        showToast("error", msg);
      }
    })();
  };

  const onApplyAvatar = async () => {
    try {
      setIsAvatarSaving(true);
      const updated = await updateMe(name, avatarDraftUrl);
      setAvatarUrl(updated.avatarUrl ?? "");
      showToast("success", t("profile.avatarUpdated"));
      setIsAvatarModalOpen(false);
    } catch (e) {
      const msg = e instanceof Error ? e.message : t("errors.avatarUpdateFailed");
      showToast("error", msg);
    } finally {
      setIsAvatarSaving(false);
    }
  };

  const initials = React.useMemo(() => {
    const safe = name.trim();
    if (!safe) return "U";
    const parts = safe.split(/\s+/).slice(0, 2);
    return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "U";
  }, [name]);

  const trimmedName = name.trim();
  const isGenericName = /^(пользователь|user|user\d*)$/i.test(trimmedName) || trimmedName.length < 4;
  const isLatinOnlyName = looksLikeLatinOnlyName(name);
  const showNameReminder = !hideNameReminder && (isGenericName || isLatinOnlyName);
  const nameReminderText = isGenericName ? t("profile.realNameHint") : t("profile.realNameLatinHint");
  const roleLabel =
    role === "master" ? t("role.master") : role === "admin" ? t("role.admin") : role === "boss" ? t("role.boss") : "";

  const dismissNameReminder = () => {
    const session = readAuthSession();
    const uid = session?.user.id;
    if (uid) {
      localStorage.setItem(`profile.nameReminder.dismissed.${uid}`, "1");
    }
    setHideNameReminder(true);
  };

  if (isLoading) {
    return (
      <div className={cls.shell}>
        <PageHeader title={t("common.profile")} />
        <div className={cls.body}>
          <SkeletonProfileHero />
          <SkeletonCard rows={4} />
        </div>
      </div>
    );
  }

  return (
    <div className={cls.shell}>
      <PageHeader title={t("common.profile")} />
      <div className={cls.body}>
        <section className={cls.hero}>
          <button type="button" className={cls.avatarButton} onClick={openAvatarModal} aria-label={t("profile.changeAvatar")}>
            {avatarUrl ? (
              <img src={avatarUrl} alt={t("profile.userAvatar")} className={cls.avatarImage} />
            ) : (
              <div className={cls.avatar} aria-hidden>
                {initials}
              </div>
            )}
            <span className={cls.avatarEditBadge}>
              <span className={cls.avatarEditIcon} aria-hidden>
                ✎
              </span>
              <span className={cls.avatarEditText}>{t("profile.change")}</span>
            </span>
          </button>
          <div className={cls.heroContent}>
            <div className={cls.nameRow}>
              <h2 className={cls.heroName}>{name || t("profile.defaultUser")}</h2>
              {showNameReminder ? (
                <div className={cls.nameReminder} role="note">
                  <span className={cls.reminderText}>{nameReminderText}</span>
                  <button type="button" className={cls.reminderClose} onClick={dismissNameReminder} aria-label={t("profile.hideReminder")}>
                    ×
                  </button>
                </div>
              ) : null}
            </div>
            <p className={cls.heroSub}>{email || t("profile.clientCabinet")}</p>
            <div className={cls.badges}>
              <span className={cls.badge}>{t("profile.premiumService")}</span>
              <span className={cls.badgeMuted}>ID: {email ? "GOOGLE" : "PHONE"}</span>
              {role !== "client" ? <span className={cls.roleBadge}>{t("profile.role")}: {roleLabel}</span> : null}
            </div>
          </div>
        </section>

        <div className={cls.grid}>
          <section className={cls.card}>
            <h3 className={cls.cardTitle}>{t("profile.personalData")}</h3>
            <form
              className={cls.form}
              onSubmit={(e) => {
                e.preventDefault();
                void onSave();
              }}
            >
              <label className={cls.label}>
                {t("profile.name")}
                <input className={cls.input} value={name} onChange={(e) => setName(e.target.value)} />
              </label>
              <label className={cls.label}>
                {t("profile.phone")}
                <input
                  className={cls.input}
                  value={phone}
                  inputMode="tel"
                  placeholder="+7 999 123-45-67"
                  onChange={(e) => setPhone(e.target.value)}
                />
              </label>
              {email ? <p className={cls.meta}>Google: {email}</p> : null}
              <p className={cls.hint}>{t("profile.serverHint")}</p>
              <Button type="submit" variant="outline" disabled={isSaving || name.trim().length < 2}>
                {isSaving ? t("profile.saving") : t("profile.saveChanges")}
              </Button>
            </form>
          </section>

          <section className={cls.card}>
            <h3 className={cls.cardTitle}>{t("profile.navigation")}</h3>
            <div className={cls.links}>
              <Link className={cls.navLink} to="/history">
                {t("profile.orderHistory")}
              </Link>
              <Link className={cls.navLink} to="/messages">
                {t("profile.messages")}
              </Link>
              <Link className={cls.navLink} to="/help">
                {t("profile.help")}
              </Link>
              <Link className={cls.navLink} to="/account/settings">
                {t("profile.accountSettings")}
              </Link>
              <Link className={cls.navLink} to="/contacts">
                {t("profile.contacts")}
              </Link>
              {role === "master" || role === "admin" || role === "boss" ? (
                <Link className={cls.navLink} to="/tech">
                  {t("profile.techPanel")}
                </Link>
              ) : null}
              {role === "admin" || role === "boss" ? (
                <Link className={cls.navLink} to="/admin">
                  {t("profile.adminPanel")}
                </Link>
              ) : null}
            </div>
            <div className={cls.logoutRow}>
              <Button type="button" variant="ghost" onClick={() => void logout()}>
                {t("profile.logout")}
              </Button>
            </div>
          </section>
        </div>
      </div>
      {isAvatarModalOpen ? (
        <div className={cls.modalOverlay} role="dialog" aria-modal="true" aria-label={t("profile.avatarDialog")}>
          <div className={cls.modalCard}>
            <h3 className={cls.modalTitle}>{t("profile.photoTitle")}</h3>
            <p className={cls.modalHint}>{t("profile.photoHint")}</p>
            <div className={cls.modalPreviewWrap}>
              {avatarDraftUrl ? (
                <img src={avatarDraftUrl} alt={t("profile.avatarPreview")} className={cls.modalPreview} />
              ) : (
                <div className={cls.modalFallback}>{initials}</div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="user"
              className={cls.hiddenInput}
              onChange={onAvatarFileChange}
            />
            <div className={cls.modalActions}>
              <Button type="button" variant="outline" onClick={onPickAvatarClick}>
                {t("profile.uploadPhoto")}
              </Button>
              <Button
                type="button"
                onClick={() => void onApplyAvatar()}
                disabled={isAvatarSaving || avatarDraftUrl.trim().length === 0}
              >
                {isAvatarSaving ? t("profile.saving") : t("common.save")}
              </Button>
              <Button type="button" variant="ghost" onClick={closeAvatarModal}>
                {t("common.cancel")}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
      {toast ? <StatusToast tone={toast.tone} message={toast.message} onClose={closeToast} /> : null}
    </div>
  );
};
