import * as React from "react";

export type Locale = "ru" | "en";

const STORAGE_KEY = "app.locale";
const CIS_COUNTRY_CODES = new Set(["RU", "BY", "KZ", "KG", "AM", "AZ", "UZ", "TJ", "TM", "MD"]);

type Dictionary = Record<string, string>;

const RU_DICTIONARY: Dictionary = {
  "common.profile": "Профиль",
  "common.tracking": "Отслеживание",
  "common.save": "Сохранить",
  "common.cancel": "Отмена",
  "common.loadingSoon": "Скоро.",
  "auth.login": "Вход",
  "auth.needAuth": "Нужна авторизация",
  "auth.sessionExpired": "Сессия истекла",
  "errors.timeout": "Сервер не ответил вовремя. Проверьте сеть и попробуйте снова.",
  "errors.loadProfile": "Не удалось загрузить профиль",
  "errors.saveProfile": "Не удалось сохранить профиль",
  "errors.pickImage": "Выберите изображение",
  "errors.fileTooLarge": "Файл слишком большой (до 6MB)",
  "errors.imageReadFailed": "Не удалось прочитать изображение",
  "errors.imageProcessFailed": "Не удалось обработать изображение",
  "errors.avatarUpdateFailed": "Не удалось обновить аватар",
  "profile.defaultUser": "Пользователь",
  "profile.saved": "Профиль сохранен",
  "profile.avatarUpdated": "Аватар обновлен",
  "profile.avatarOptimized": "Фото оптимизировано для быстрой загрузки",
  "profile.clientCabinet": "Личный кабинет клиента",
  "profile.premiumService": "Премиум сервис",
  "profile.role": "Роль",
  "profile.personalData": "Личные данные",
  "profile.name": "Имя",
  "profile.phone": "Телефон",
  "profile.serverHint": "Имя и телефон сохраняются на сервере.",
  "profile.saveChanges": "Сохранить изменения",
  "profile.saving": "Сохраняем...",
  "profile.navigation": "Навигация",
  "profile.orderHistory": "История заказов",
  "profile.messages": "Сообщения",
  "profile.help": "Помощь",
  "profile.accountSettings": "Настройки аккаунта",
  "profile.contacts": "Контакты сервиса",
  "profile.techPanel": "Панель мастера",
  "profile.adminPanel": "Панель администратора",
  "profile.logout": "Выйти из аккаунта",
  "profile.changeAvatar": "Изменить аватар",
  "profile.change": "Изменить",
  "profile.userAvatar": "Аватар пользователя",
  "profile.hideReminder": "Скрыть напоминание",
  "profile.photoTitle": "Фото профиля",
  "profile.photoHint": "Выберите фото с устройства. Работает и на телефоне, и на компьютере.",
  "profile.uploadPhoto": "Загрузить фото",
  "profile.avatarDialog": "Изменение аватара",
  "profile.avatarPreview": "Предпросмотр аватара",
  "profile.realNameHint": "Похоже, это не настоящее имя. Обновите для профиля.",
  "profile.realNameLatinHint": "Имя указано латиницей — похоже, это не ваше настоящее имя. Укажите, как к вам обращаться, на русском: так мастеру проще.",
  "role.master": "Мастер",
  "role.admin": "Администратор",
  "role.boss": "Босс",
  "tracking.subtitle": "Статусы ваших ремонтов.",
  "tracking.empty": "Пока нет заказов для отображения.",
  "tracking.activeRepair": "Активный ремонт",
  "sidebar.home": "Главная",
  "sidebar.landing": "Шоу-лендинг",
  "sidebar.tracking": "Отслеживание",
  "sidebar.create": "Новая заявка",
  "sidebar.history": "История заказов",
  "sidebar.messages": "Сообщения",
  "sidebar.help": "Помощь",
  "sidebar.contacts": "Контакты",
  "sidebar.profile": "Профиль",
  "sidebar.sections": "Разделы приложения",
  "sidebar.mainMenu": "Основное меню",
  "sidebar.language": "Язык",
  "sidebar.langRu": "Рус",
  "sidebar.langEn": "Eng",
  "admin.menu": "Админ-меню",
  "admin.sections": "Разделы админки",
  "admin.dashboard": "Дашборд",
  "admin.orders": "Заказы",
  "admin.clients": "Клиенты",
  "admin.masters": "Мастера",
  "admin.pricing": "Прайс",
  "admin.services": "Услуги",
  "admin.analytics": "Аналитика",
  "admin.logs": "Журнал",
  "admin.settings": "Настройки",
  "admin.backToSite": "К сайту",
  "tech.menu": "Меню мастера",
  "tech.sections": "Разделы мастера",
  "tech.brand": "Сервис · Мастер",
  "tech.dashboard": "Дашборд",
  "tech.incoming": "Входящие",
  "tech.tasks": "Задачи",
  "tech.completed": "Завершенные",
  "tech.settings": "Настройки",
  "topbar.notifications": "Уведомления",
  "nav.closeMenu": "Закрыть меню",
  "nav.openMenu": "Открыть меню",
  "login.title": "Вход",
  "login.titleRegisterApp": "Регистрация для приложения",
  "login.registerDone": "Регистрация выполнена",
  "login.loginDone": "Вход выполнен",
  "login.googleSuccess": "Успешный вход через Google",
  "login.sendCodeFailed": "Не удалось отправить код",
  "login.verifyFailed": "Не удалось войти по коду",
  "login.googleFailed": "Не удалось войти через Google",
  "login.browserOriginMissing": "Для входа через браузер задайте VITE_APP_ORIGIN при сборке фронта — URL сайта (например https://app.example.com).",
  "login.browserOpened": "Открыл браузер. После входа по коду откроется приложение.",
  "login.googleBrowserOpened": "Открыл браузер для входа через Google",
  "login.codeSentPhone": "Код отправлен. Проверьте SMS.",
  "login.codeSentEmail": "Код отправлен. Проверьте email.",
  "login.codeSentLocal": "(локально) Код:",
  "login.electronHintBridge": "После входа сессия отправляется в приложение на 127.0.0.1 (без длинной ссылки в адресе). Запасной вариант — ссылка evrenyan://.",
  "login.electronHintPage": "Страница для регистрации и входа по коду из приложения на ПК.",
  "login.method": "Способ входа",
  "login.phoneOptional": "Телефон (опционально)",
  "login.yourName": "Ваше имя",
  "login.name": "Имя",
  "login.phone": "Телефон",
  "login.sendCode": "Отправить код",
  "login.prepareBrowser": "Подготовка входа в браузере…",
  "login.openBrowserAuth": "Регистрация и вход в браузере",
  "login.or": "или",
  "login.needRegister": "Нужна регистрация?",
  "login.haveAccount": "Уже есть аккаунт?",
  "login.codeNotReceived": "Не пришел код?",
  "login.codeSentToPhone": "Код отправлен на номер",
  "login.codeSentTo": "Код отправлен на",
  "login.change": "Изменить",
  "login.codeSms": "Код из SMS",
  "login.codeEmail": "Код из email",
  "login.confirmationCode": "Код подтверждения",
  "login.sending": "Отправляем…",
  "login.signUp": "Зарегистрироваться",
  "login.signInCode": "Войти по коду",
  "login.sendAgain": "Отправить код еще раз",
  "login.googleUnavailable": "Google Identity Services недоступен",
  "login.googleLoadFailed": "Не удалось загрузить Google",
  "login.googlePopupFailed": "Google popup не открылся на устройстве",
  "login.googleOpenChrome": "Откройте сайт в Chrome/Safari и разрешите всплывающие окна.",
  "login.googleError": "Ошибка Google",
  "login.googleBadCredential": "Google не передал корректный credential",
  "login.googleOpenNormalBrowser": "Откройте сайт в обычном Chrome/Safari и повторите вход. Во встроенных браузерах это частая причина 400.",
  "login.googleInAppBrowserHint": "Во встроенном браузере (Telegram/Instagram/др.) Google-вход часто возвращает 400. Лучше открыть ссылку в Chrome/Safari.",
  "login.googleMobileHint": "Если увидите 400, проверьте системную дату/время телефона и отключите строгую блокировку cookies для сайта.",
  "login.googleGenericError": "Ошибка Google",
  "login.googleNeedClientId": "Укажите",
  "login.googleElectronBlocked": "Во встроенном окне Electron Google-вход блокируется. Используйте вход через браузер.",
  "login.googleUnsupported": "В приложении вход через Google недоступен. Используйте вход по номеру телефона.",
  "login.googleOpenInBrowser": "Войти через Google в браузере",
  "main.forgotPassword": "Восстановление пароля — скоро.",
  "main.signUp": "Регистрация — скоро.",
  "main.privacy": "Политика конфиденциальности",
  "main.terms": "Пользовательское соглашение",
  "main.personalData": "Обработка персональных данных",
};

const EN_DICTIONARY: Dictionary = {
  "common.profile": "Profile",
  "common.tracking": "Tracking",
  "common.save": "Save",
  "common.cancel": "Cancel",
  "common.loadingSoon": "Coming soon.",
  "auth.login": "Sign in",
  "auth.needAuth": "Authorization required",
  "auth.sessionExpired": "Session expired",
  "errors.timeout": "The server did not respond in time. Check your connection and try again.",
  "errors.loadProfile": "Failed to load profile",
  "errors.saveProfile": "Failed to save profile",
  "errors.pickImage": "Please choose an image",
  "errors.fileTooLarge": "File is too large (up to 6MB)",
  "errors.imageReadFailed": "Failed to read image",
  "errors.imageProcessFailed": "Failed to process image",
  "errors.avatarUpdateFailed": "Failed to update avatar",
  "profile.defaultUser": "User",
  "profile.saved": "Profile saved",
  "profile.avatarUpdated": "Avatar updated",
  "profile.avatarOptimized": "Photo optimized for faster upload",
  "profile.clientCabinet": "Client account",
  "profile.premiumService": "Premium service",
  "profile.role": "Role",
  "profile.personalData": "Personal data",
  "profile.name": "Name",
  "profile.phone": "Phone",
  "profile.serverHint": "Name and phone are saved on the server.",
  "profile.saveChanges": "Save changes",
  "profile.saving": "Saving...",
  "profile.navigation": "Navigation",
  "profile.orderHistory": "Order history",
  "profile.messages": "Messages",
  "profile.help": "Help",
  "profile.accountSettings": "Account settings",
  "profile.contacts": "Service contacts",
  "profile.techPanel": "Technician panel",
  "profile.adminPanel": "Admin panel",
  "profile.logout": "Log out",
  "profile.changeAvatar": "Change avatar",
  "profile.change": "Change",
  "profile.userAvatar": "User avatar",
  "profile.hideReminder": "Hide reminder",
  "profile.photoTitle": "Profile photo",
  "profile.photoHint": "Choose a photo from your device. Works on both phone and desktop.",
  "profile.uploadPhoto": "Upload photo",
  "profile.avatarDialog": "Change avatar",
  "profile.avatarPreview": "Avatar preview",
  "profile.realNameHint": "This does not look like a real name. Update it for your profile.",
  "profile.realNameLatinHint": "The name looks transliterated. Please provide your real name for easier communication.",
  "role.master": "Technician",
  "role.admin": "Administrator",
  "role.boss": "Owner",
  "tracking.subtitle": "Statuses of your repairs.",
  "tracking.empty": "No orders to display yet.",
  "tracking.activeRepair": "Active repair",
  "sidebar.home": "Home",
  "sidebar.landing": "Show landing",
  "sidebar.tracking": "Tracking",
  "sidebar.create": "New request",
  "sidebar.history": "Order history",
  "sidebar.messages": "Messages",
  "sidebar.help": "Help",
  "sidebar.contacts": "Contacts",
  "sidebar.profile": "Profile",
  "sidebar.sections": "Application sections",
  "sidebar.mainMenu": "Main menu",
  "sidebar.language": "Language",
  "sidebar.langRu": "Rus",
  "sidebar.langEn": "Eng",
  "admin.menu": "Admin menu",
  "admin.sections": "Admin sections",
  "admin.dashboard": "Dashboard",
  "admin.orders": "Orders",
  "admin.clients": "Clients",
  "admin.masters": "Technicians",
  "admin.pricing": "Pricing",
  "admin.services": "Services",
  "admin.analytics": "Analytics",
  "admin.logs": "Logs",
  "admin.settings": "Settings",
  "admin.backToSite": "Back to site",
  "tech.menu": "Technician menu",
  "tech.sections": "Technician sections",
  "tech.brand": "Service · Technician",
  "tech.dashboard": "Dashboard",
  "tech.incoming": "Incoming",
  "tech.tasks": "Tasks",
  "tech.completed": "Completed",
  "tech.settings": "Settings",
  "topbar.notifications": "Notifications",
  "nav.closeMenu": "Close menu",
  "nav.openMenu": "Open menu",
  "login.title": "Sign in",
  "login.titleRegisterApp": "App registration",
  "login.registerDone": "Registration completed",
  "login.loginDone": "Signed in",
  "login.googleSuccess": "Signed in with Google",
  "login.sendCodeFailed": "Failed to send code",
  "login.verifyFailed": "Failed to sign in by code",
  "login.googleFailed": "Failed to sign in with Google",
  "login.browserOriginMissing": "To use browser sign in, set VITE_APP_ORIGIN during frontend build — your site URL (for example https://app.example.com).",
  "login.browserOpened": "Browser opened. After code sign in, the desktop app will open.",
  "login.googleBrowserOpened": "Opened browser for Google sign in",
  "login.codeSentPhone": "Code sent. Check SMS.",
  "login.codeSentEmail": "Code sent. Check email.",
  "login.codeSentLocal": "(local) Code:",
  "login.electronHintBridge": "After sign in, session is sent to the app on 127.0.0.1 (without long URL params). Backup option: evrenyan:// link.",
  "login.electronHintPage": "Page for registration and code sign in from desktop app.",
  "login.method": "Sign in method",
  "login.phoneOptional": "Phone (optional)",
  "login.yourName": "Your name",
  "login.name": "Name",
  "login.phone": "Phone",
  "login.sendCode": "Send code",
  "login.prepareBrowser": "Preparing browser sign in…",
  "login.openBrowserAuth": "Register and sign in in browser",
  "login.or": "or",
  "login.needRegister": "Need an account?",
  "login.haveAccount": "Already have an account?",
  "login.codeNotReceived": "Didn't receive the code?",
  "login.codeSentToPhone": "Code sent to phone",
  "login.codeSentTo": "Code sent to",
  "login.change": "Change",
  "login.codeSms": "SMS code",
  "login.codeEmail": "Email code",
  "login.confirmationCode": "Confirmation code",
  "login.sending": "Sending…",
  "login.signUp": "Sign up",
  "login.signInCode": "Sign in by code",
  "login.sendAgain": "Send code again",
  "login.googleUnavailable": "Google Identity Services is unavailable",
  "login.googleLoadFailed": "Failed to load Google",
  "login.googlePopupFailed": "Google popup failed to open on this device",
  "login.googleOpenChrome": "Open this page in Chrome/Safari and allow popups.",
  "login.googleError": "Google error",
  "login.googleBadCredential": "Google returned an invalid credential",
  "login.googleOpenNormalBrowser": "Open this page in regular Chrome/Safari and try again. In-app browsers often cause 400 errors.",
  "login.googleInAppBrowserHint": "In-app browsers (Telegram/Instagram/etc.) often return 400 for Google sign in. Open the link in Chrome/Safari.",
  "login.googleMobileHint": "If you see 400, check your phone date/time and disable strict cookie blocking for this site.",
  "login.googleGenericError": "Google error",
  "login.googleNeedClientId": "Set",
  "login.googleElectronBlocked": "Google sign in is blocked in Electron embedded window. Use browser sign in.",
  "login.googleUnsupported": "Google sign in is unavailable in this app environment. Use phone sign in.",
  "login.googleOpenInBrowser": "Sign in with Google in browser",
  "main.forgotPassword": "Password recovery - coming soon.",
  "main.signUp": "Sign up - coming soon.",
  "main.privacy": "Privacy policy",
  "main.terms": "Terms of service",
  "main.personalData": "Personal data processing",
};

const DICTIONARIES: Record<Locale, Dictionary> = {
  ru: RU_DICTIONARY,
  en: EN_DICTIONARY,
};

function readStoredLocaleSync(): Locale {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === "ru" || saved === "en") return saved;
  const browserLang = (navigator.language || "").toLowerCase();
  return browserLang.startsWith("ru") ? "ru" : "en";
}

export function translateStatic(key: string): string {
  const locale = readStoredLocaleSync();
  return DICTIONARIES[locale][key] ?? DICTIONARIES.en[key] ?? key;
}

async function fetchCountryCodeByIp(): Promise<string | null> {
  try {
    const res = await fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(2500) });
    if (!res.ok) return null;
    const body = (await res.json().catch(() => ({}))) as { country_code?: string };
    const code = body.country_code?.toUpperCase();
    return code ?? null;
  } catch {
    return null;
  }
}

export async function detectLocale(): Promise<Locale> {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === "ru" || saved === "en") return saved;

  const countryCode = await fetchCountryCodeByIp();
  if (countryCode) {
    const next: Locale = CIS_COUNTRY_CODES.has(countryCode) ? "ru" : "en";
    localStorage.setItem(STORAGE_KEY, next);
    return next;
  }

  const browserLang = (navigator.language || "").toLowerCase();
  const fallback: Locale = browserLang.startsWith("ru") ? "ru" : "en";
  localStorage.setItem(STORAGE_KEY, fallback);
  return fallback;
}

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
};

const I18nContext = React.createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const [locale, setLocaleState] = React.useState<Locale>("en");
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    void (async () => {
      const next = await detectLocale();
      if (!mounted) return;
      setLocaleState(next);
      setReady(true);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  React.useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = React.useCallback((next: Locale) => {
    localStorage.setItem(STORAGE_KEY, next);
    setLocaleState(next);
  }, []);

  const t = React.useCallback(
    (key: string): string => {
      const dict = DICTIONARIES[locale];
      return dict[key] ?? DICTIONARIES.en[key] ?? key;
    },
    [locale]
  );

  const value = React.useMemo<I18nContextValue>(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  if (!ready) return <>{children}</>;
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = React.useContext(I18nContext);
  if (!ctx) {
    return {
      locale: "en",
      setLocale: () => undefined,
      t: (key: string) => DICTIONARIES.en[key] ?? key,
    };
  }
  return ctx;
}
