import * as React from "react";
import { Link } from "react-router-dom";
import { FAQ_ITEMS } from "@/shared/config/marketing";
import { FaqAccordion } from "@/widgets/FaqAccordion";
import { PageHeader } from "@/widgets/PageHeader";
import cls from "./clientPages.module.css";

export const HelpPage: React.FC = () => {
  return (
    <div className={cls.shell}>
      <PageHeader title="Помощь" subtitle="Ответы на частые вопросы и ссылки на разделы сервиса." />
      <div className={cls.body}>
        <section className={cls.card}>
          <h2 className={cls.h2}>Частые вопросы</h2>
          <FaqAccordion items={FAQ_ITEMS} idPrefix="help-faq" />
        </section>
        <section className={cls.card}>
          <h2 className={cls.h2}>Ещё материалы</h2>
          <p className={cls.lead}>Юридическая информация и контакты — в соответствующих разделах.</p>
          <div className={cls.linkGrid}>
            <Link className={cls.navCard} to="/warranty">
              Гарантия на ремонт
            </Link>
            <Link className={cls.navCard} to="/reviews">
              Отзывы клиентов
            </Link>
            <Link className={cls.navCard} to="/contacts">
              Контакты и график
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};
