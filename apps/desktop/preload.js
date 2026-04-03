const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("evrenyanDesktop", {
  /** База вида http://127.0.0.1:PORT для редиректа после входа в системном браузере */
  getAuthBridgeOrigin: () => ipcRenderer.invoke("evrenyan:auth-bridge-origin"),
  consumePendingSession: () => ipcRenderer.invoke("evrenyan:consume-pending-session"),
});
