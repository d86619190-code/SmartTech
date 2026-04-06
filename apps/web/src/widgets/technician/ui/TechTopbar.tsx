import * as React from "react";
import { Link } from "react-router-dom";
import { techApi } from "@/shared/lib/techApi";
import { readAuthSession } from "@/shared/lib/authSession";
import { useI18n } from "@/shared/i18n/i18n";
import cls from "./TechTopbar.module.css";

function dicebear(seed: string): string {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;
}

export const TechTopbar: React.FC = () => {
  const { t } = useI18n();
  const session = readAuthSession();
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null);
  const [name, setName] = React.useState<string>("");

  React.useEffect(() => {
    const sessionName = session?.user.name?.trim();
    const sessionAvatar = session?.user.avatarUrl?.trim();
    if (sessionName) setName(sessionName);
    if (sessionAvatar) setAvatarUrl(sessionAvatar);
    void (async () => {
      try {
        const res = await techApi.getProfile();
        const n = res.profile?.name?.trim() || t("role.master");
        if (!sessionName) setName(n);
        if (!sessionAvatar) setAvatarUrl(res.profile?.avatar_url?.trim() || dicebear(n));
      } catch {
        if (!sessionName) setName(t("role.master"));
        if (!sessionAvatar) setAvatarUrl(dicebear("master"));
      }
    })();
  }, [session?.user.name, session?.user.avatarUrl]);

  return (
    <header className={cls.root}>
      <div className={cls.spacer} />
      <div className={cls.actions}>
        <Link className={cls.avatarLink} to="/tech/profile" title={t("common.profile")} aria-label={`${t("common.profile")}, ${name}`}>
          <img className={cls.avatarImg} src={avatarUrl ?? dicebear(name)} alt="" width={42} height={42} />
        </Link>
      </div>
    </header>
  );
};
