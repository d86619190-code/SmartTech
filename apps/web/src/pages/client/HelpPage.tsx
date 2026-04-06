import * as React from "react";
import { Link } from "react-router-dom";
import { FAQ_ITEMS } from "@/shared/config/marketing";
import { FaqAccordion } from "@/widgets/FaqAccordion";
import { PageHeader } from "@/widgets/PageHeader";
import cls from "./clientPages.module.css";

export const HelpPage: React.FC = () => {
  return (
    <div className={cls.shell}>
      <PageHeader title="Help" subtitle="Answers to frequently asked questions and links to service sections." />
      <div className={cls.body}>
        <section className={cls.card}>
          <h2 className={cls.h2}>Frequently asked questions</h2>
          <FaqAccordion items={FAQ_ITEMS} idPrefix="help-faq" />
        </section>
        <section className={cls.card}>
          <h2 className={cls.h2}>More materials</h2>
          <p className={cls.lead}>Legal information and contacts are in the appropriate sections.</p>
          <div className={cls.linkGrid}>
            <Link className={cls.navCard} to="/warranty">
              Repair warranty
            </Link>
            <Link className={cls.navCard} to="/reviews">
              Customer Reviews
            </Link>
            <Link className={cls.navCard} to="/contacts">
              Contacts and schedule
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};
