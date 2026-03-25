import * as React from "react";
import { PageHeader } from "@/widgets/PageHeader";
import cls from "./LegalStubPage.module.css";

type LegalStubPageProps = {
  title: string;
};

export const LegalStubPage: React.FC<LegalStubPageProps> = ({ title }) => {
  return (
    <div className={cls.shell}>
      <PageHeader title={title} />
      <div className={cls.body}>
        <p className={cls.p}>
          Здесь будет размещён актуальный текст документа в соответствии с законодательством РФ. Для уточнений
          свяжитесь с сервисом.
        </p>
      </div>
    </div>
  );
};
