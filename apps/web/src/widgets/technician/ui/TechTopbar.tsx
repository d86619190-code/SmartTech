import * as React from "react";
import { Link } from "react-router-dom";
import { techApi } from "@/shared/lib/techApi";
import { readAuthSession } from "@/shared/lib/authSession";
import cls from "./TechTopbar.module.css";

function dicebear(seed: string): string {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;
}

export const TechTopbar: React.FC = () => {
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
        const n = res.profile?.name?.trim() || "Мастер";
        if (!sessionName) setName(n);
        if (!sessionAvatar) setAvatarUrl(res.profile?.avatar_url?.trim() || dicebear(n));
      } catch {
        if (!sessionName) setName("Мастер");
        if (!sessionAvatar) setAvatarUrl(dicebear("master"));
      }
    })();
  }, [session?.user.name, session?.user.avatarUrl]);

  return (
    <header className={cls.root}>
      <div className={cls.spacer} />
      <div className={cls.actions}>
        <Link className={cls.avatarLink} to="/tech/profile" title="Профиль" aria-label={`Профиль, ${name}`}>
          <img className={cls.avatarImg} src={avatarUrl ?? dicebear(name)} alt="" width={42} height={42} />
        </Link>
      </div>
    </header>
  );
};
