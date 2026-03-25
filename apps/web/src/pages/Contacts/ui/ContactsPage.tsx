import * as React from "react";
import { useNavigate } from "react-router-dom";
import { isElectronApp } from "@/shared/lib/isElectronApp";
import { FAQ_ITEMS } from "@/shared/config/marketing";
import { SITE } from "@/shared/config/siteContacts";
import { Button } from "@/shared/ui/Button/Button";
import { FaqAccordion } from "@/widgets/FaqAccordion";
import { PageHeader } from "@/widgets/PageHeader";
import cls from "./ContactsPage.module.css";

export const ContactsPage: React.FC = () => {
  const navigate = useNavigate();

  const goLead = () => {
    if (isElectronApp()) navigate("/create-order");
    else navigate("/sign-up");
  };

  return (
    <div className={cls.shell}>
      <PageHeader title="Контакты и вопросы" />
      <div className={cls.body}>
        <section className={cls.section} aria-labelledby="faq-c">
          <h2 id="faq-c" className={cls.h2}>
            Частые вопросы
          </h2>
          <FaqAccordion items={FAQ_ITEMS} idPrefix="contacts-faq" />
        </section>

        <section className={cls.section} aria-labelledby="contacts-row">
          <h2 id="contacts-row" className={cls.h2}>
            Связь и график
          </h2>
          <div className={cls.triplet}>
            <div className={cls.tripletItem}>
              <span className={cls.tripletLabel}>Телефон</span>
              <a className={cls.phone} href={`tel:${SITE.phoneTel}`}>
                {SITE.phoneDisplay}
              </a>
            </div>
            <div className={cls.tripletItem}>
              <span className={cls.tripletLabel}>График работы</span>
              <span className={cls.tripletVal}>{SITE.workingHoursLines[0]}</span>
            </div>
            <div className={cls.tripletItem}>
              <span className={cls.tripletLabel}>Адрес</span>
              <span className={cls.tripletVal}>{SITE.address}</span>
            </div>
          </div>
        </section>

        <section className={cls.mapSection} aria-labelledby="map-heading">
          <h2 id="map-heading" className={cls.h2}>
            Как нас найти
          </h2>
          <div className={cls.mapRow}>
            <div className={cls.mapFrame}>
              <iframe
                title="Карта — сервисный центр"
                src={SITE.yandexMapEmbedUrl}
                className={cls.iframe}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
          <div className={cls.mapActions}>
            <Button type="button" onClick={() => window.open(`tel:${SITE.phoneTel}`)}>
              Позвонить
            </Button>
            <Button type="button" variant="outline" onClick={() => window.open(SITE.telegramUrl, "_blank")}>
              Написать в ТГ
            </Button>
            <Button type="button" variant="outline" onClick={goLead}>
              Оставить заявку
            </Button>
          </div>
          <Button type="button" variant="outline" onClick={() => window.open(SITE.mapsUrl, "_blank")}>
            Открыть в Яндекс.Картах
          </Button>
        </section>
      </div>
    </div>
  );
};
