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
          The current text of the document will be posted here in accordance with the legislation of the Russian Federation. For clarification
          contact service.
        </p>
      </div>
    </div>
  );
};
