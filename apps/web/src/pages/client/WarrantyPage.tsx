import * as React from "react";
import { GUARANTEE } from "@/shared/config/marketing";
import { PageHeader } from "@/widgets/PageHeader";
import cls from "./clientPages.module.css";

export const WarrantyPage: React.FC = () => {
  return (
    <div className={cls.shell}>
      <PageHeader title={GUARANTEE.title} subtitle={GUARANTEE.subtitle} />
      <div className={cls.body}>
        <section className={cls.card}>
          <ul style={{ margin: 0, paddingLeft: 20, fontSize: 15, lineHeight: 1.6, color: "var(--color-text-secondary)" }}>
            {GUARANTEE.items.map((item) => (
              <li key={item} style={{ marginBottom: 10 }}>
                {item}
              </li>
            ))}
          </ul>
          <p className={cls.lead} style={{ marginTop: 20 }}>
            Условия фиксируются в акте при выдаче устройства. При наступлении гарантийного случая обратитесь в сервис с
            чеком и устройством.
          </p>
        </section>
      </div>
    </div>
  );
};
