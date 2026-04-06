/** Contacts and details of the service - put in env during deployment */
export const SITE = {
  name: "Evrenyan Service",
  tagline: "Smartphone repair",
  phoneDisplay: "+7 (900) 000-00-00",
  phoneTel: "+79000000000",
  address: "Moscow, st. Pribrnaya, 1",
  /** Map: open in Yandex.Maps */
  mapsUrl: "https://yandex.ru/maps/?text=%D0%9C%D0%BE%D1%81%D0%BA%D0%B2%D0%B0",
  /** Map widget (iframe src) - substitute the coordinates of the point */
  yandexMapEmbedUrl:
    "https://yandex.ru/map-widget/v1/?ll=37.617635%2C55.755814&z=16&pt=37.617635%2C55.755814%2Cpm2rdm",
  /** Reviews page on Yandex.Maps - replace with organization */
  yandexReviewsUrl: "https://yandex.ru/maps/",
  whatsappUrl: "https://wa.me/79000000000",
  telegramUrl: "https://t.me/username",
  /** According to technical requirements: daily 10:00–20:00 */
  workingHoursLines: ["From 10:00 to 20:00 without breaks and weekends"],
  statsRepairs: "5000+",
  sinceYear: "2018",
  warrantyMonths: 12,
  /** Legal entity for footer */
  legalName: 'IP Ivanov Ivan Ivanovich',
  inn: "770000000000",
  ogrn: "320000000000000",
  companyYear: 2026,
} as const;
