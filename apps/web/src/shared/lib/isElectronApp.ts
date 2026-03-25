/** true в Electron (окно приложения), false в обычном браузере */
export function isElectronApp(): boolean {
  if (typeof navigator === "undefined") return false;
  return /\bElectron\b/i.test(navigator.userAgent);
}
