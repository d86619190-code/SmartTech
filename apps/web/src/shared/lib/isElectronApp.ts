/** true in Electron (application window), false in a regular browser */
export function isElectronApp(): boolean {
  if (typeof navigator === "undefined") return false;
  return /\bElectron\b/i.test(navigator.userAgent);
}
