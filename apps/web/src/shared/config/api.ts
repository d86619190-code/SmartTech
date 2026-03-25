/** Базовый URL API (без завершающего слэша). */
const rawApiOrigin = (import.meta.env.VITE_API_ORIGIN ?? "http://localhost:4000").replace(/\/$/, "");

function resolveApiOrigin(origin: string): string {
  if (typeof navigator === "undefined") return origin;
  // Android emulator cannot reach host machine via localhost.
  const isAndroid = /Android/i.test(navigator.userAgent);
  const isIos = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  if (isAndroid && /^https?:\/\/(localhost|127\.0\.0\.1)(?::\d+)?$/i.test(origin)) {
    return origin.replace(/localhost|127\.0\.0\.1/i, "10.0.2.2");
  }
  // iOS simulator uses localhost loopback.
  if (isIos && /^https?:\/\/localhost(?::\d+)?$/i.test(origin)) {
    return origin.replace("localhost", "127.0.0.1");
  }
  return origin;
}

export const apiOrigin = resolveApiOrigin(rawApiOrigin);

/** Google OAuth 2.0 Client ID (Web) из Google Cloud Console — должен совпадать с бэкендом. */
export const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "";
