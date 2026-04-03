import { isElectronApp } from "./isElectronApp";

/**
 * Публичный http(s)-origin веб-приложения для ссылок в системный браузер из Electron.
 * В окне с `file://` (сборка без dev-сервера) `window.location.origin` не подходит.
 * Задаётся при сборке: `VITE_APP_ORIGIN=https://ваш-домен` (без слэша в конце).
 */
export function getAppPublicOrigin(): string {
  const fromEnv = import.meta.env.VITE_APP_ORIGIN?.trim().replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  if (typeof window === "undefined") return "";
  if (isElectronApp() && window.location.protocol === "file:") {
    return "";
  }
  return window.location.origin;
}

/** Стабильный URL для HashRouter: всегда `origin/#/path?query`. Пустая строка, если origin неизвестен. */
export function buildHashAppUrl(pathWithLeadingSlash: string, searchParams: URLSearchParams): string {
  const base = getAppPublicOrigin().replace(/\/$/, "");
  if (!base) return "";
  const path = pathWithLeadingSlash.startsWith("/") ? pathWithLeadingSlash : `/${pathWithLeadingSlash}`;
  const q = searchParams.toString();
  return q ? `${base}/#${path}?${q}` : `${base}/#${path}`;
}
