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
      <PageHeader title="Contacts and questions" />
      <div className={cls.body}>
        <section className={cls.section} aria-labelledby="faq-c">
          <h2 id="faq-c" className={cls.h2}>
            Frequently asked questions
          </h2>
          <FaqAccordion items={FAQ_ITEMS} idPrefix="contacts-faq" />
        </section>

        <section className={cls.section} aria-labelledby="contacts-row">
          <h2 id="contacts-row" className={cls.h2}>
            Communication and schedule
          </h2>
          <div className={cls.triplet}>
            <div className={cls.tripletItem}>
              <span className={cls.tripletLabel}>Telephone</span>
              <a className={cls.phone} href={`tel:${SITE.phoneTel}`}>
                {SITE.phoneDisplay}
              </a>
            </div>
            <div className={cls.tripletItem}>
              <span className={cls.tripletLabel}>Work schedule</span>
              <span className={cls.tripletVal}>{SITE.workingHoursLines[0]}</span>
            </div>
            <div className={cls.tripletItem}>
              <span className={cls.tripletLabel}>Address</span>
              <span className={cls.tripletVal}>{SITE.address}</span>
            </div>
          </div>
        </section>

        <section className={cls.mapSection} aria-labelledby="map-heading">
          <h2 id="map-heading" className={cls.h2}>
            How to find us
          </h2>
          <div className={cls.mapRow}>
            <div className={cls.mapFrame}>
              <iframe
                title="Map - service center"
                src={SITE.yandexMapEmbedUrl}
                className={cls.iframe}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
          <div className={cls.mapActions}>
            <Button type="button" onClick={() => window.open(`tel:${SITE.phoneTel}`)}>
              Call
            </Button>
            <Button type="button" variant="outline" onClick={() => window.open(SITE.telegramUrl, "_blank")}>
              Write to TG
            </Button>
            <Button type="button" variant="outline" onClick={goLead}>
              Leave a request
            </Button>
          </div>
          <Button type="button" variant="outline" onClick={() => window.open(SITE.mapsUrl, "_blank")}>
            Open in Yandex.Maps
          </Button>
        </section>
      </div>
    </div>
  );
};
