/** Контакты и реквизиты сервиса — вынести в env при деплое */
export const SITE = {
  name: "Evrenyan Service",
  tagline: "Ремонт смартфонов",
  phoneDisplay: "+7 (900) 000-00-00",
  phoneTel: "+79000000000",
  address: "г. Москва, ул. Примерная, д. 1",
  /** Карта: открыть в Яндекс.Картах */
  mapsUrl: "https://yandex.ru/maps/?text=%D0%9C%D0%BE%D1%81%D0%BA%D0%B2%D0%B0",
  /** Виджет карты (iframe src) — подставьте координаты точки */
  yandexMapEmbedUrl:
    "https://yandex.ru/map-widget/v1/?ll=37.617635%2C55.755814&z=16&pt=37.617635%2C55.755814%2Cpm2rdm",
  /** Страница отзывов на Яндекс.Картах — замените на организацию */
  yandexReviewsUrl: "https://yandex.ru/maps/",
  whatsappUrl: "https://wa.me/79000000000",
  telegramUrl: "https://t.me/username",
  /** По ТЗ: ежедневно 10:00–20:00 */
  workingHoursLines: ["С 10:00 до 20:00 без перерывов и выходных"],
  statsRepairs: "5000+",
  sinceYear: "2018",
  warrantyMonths: 12,
  /** Юрлицо для футера */
  legalName: 'ИП Иванов Иван Иванович',
  inn: "770000000000",
  ogrn: "320000000000000",
  companyYear: 2026,
} as const;
