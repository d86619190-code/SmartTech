import { isElectronApp } from "./isElectronApp";

/**
 * Public http(s)-origin web application for links to the system browser from Electron.
 * In a window with `file://` (build without a dev server) `window.location.origin` is not suitable.
 * Set during assembly: `VITE_APP_ORIGIN=https://your-domain` (without the slash at the end).
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

/** Stable URL for HashRouter: always `origin/#/path?query`. Empty string if origin is unknown. */
export function buildHashAppUrl(pathWithLeadingSlash: string, searchParams: URLSearchParams): string {
  const base = getAppPublicOrigin().replace(/\/$/, "");
  if (!base) return "";
  const path = pathWithLeadingSlash.startsWith("/") ? pathWithLeadingSlash : `/${pathWithLeadingSlash}`;
  const q = searchParams.toString();
  return q ? `${base}/#${path}?${q}` : `${base}/#${path}`;
}
