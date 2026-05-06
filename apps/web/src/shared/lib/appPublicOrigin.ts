import { isElectronApp } from "./isElectronApp";

export function getAppPublicOrigin(): string {
  const fromEnv = import.meta.env.VITE_APP_ORIGIN?.trim().replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  if (typeof window === "undefined") return "";
  if (isElectronApp() && window.location.protocol === "file:") {
    return "";
  }
  return window.location.origin;
}

export function buildHashAppUrl(pathWithLeadingSlash: string, searchParams: URLSearchParams): string {
  const base = getAppPublicOrigin().replace(/\/$/, "");
  if (!base) return "";
  const path = pathWithLeadingSlash.startsWith("/") ? pathWithLeadingSlash : `/${pathWithLeadingSlash}`;
  const q = searchParams.toString();
  return q ? `${base}/#${path}?${q}` : `${base}/#${path}`;
}
