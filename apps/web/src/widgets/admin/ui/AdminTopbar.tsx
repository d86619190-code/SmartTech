import * as React from "react";
import { Link } from "react-router-dom";
import { readAuthSession } from "@/shared/lib/authSession";
import { useI18n } from "@/shared/i18n/i18n";
import cls from "./AdminTopbar.module.css";

export const AdminTopbar: React.FC = () => {
  const { t } = useI18n();
  const session = readAuthSession();
  const name = session?.user.name?.trim() || t("common.profile");
  const avatar = session?.user.avatarUrl?.trim() || "";
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((x) => x[0]?.toUpperCase() ?? "")
    .join("") || "U";
  return (
    <header className={cls.root}>
      <div className={cls.spacer} />
      <div className={cls.actions}>
        <button type="button" className={cls.iconBtn} aria-label={t("topbar.notifications")}>
          <svg className={cls.ico} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            <path d="M6 8a6 6 0 1112 0c0 7 3 9 3 9H3s3-2 3-9" strokeLinecap="round" />
            <path d="M10.3 21a1.94 1.94 0 003.4 0" strokeLinecap="round" />
          </svg>
        </button>
        <Link className={cls.avatarLink} to="/profile" title={t("common.profile")} aria-label={`${t("common.profile")}, ${name}`}>
          {avatar ? <img className={cls.avatarImg} src={avatar} alt="" width={42} height={42} /> : <span className={cls.avatarFallback}>{initials}</span>}
        </Link>
      </div>
    </header>
  );
};
