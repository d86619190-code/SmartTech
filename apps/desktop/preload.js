const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("repairDesktop", {
  /** База вида http://127.0.0.1:PORT для редиректа после входа в системном браузере */
  getAuthBridgeOrigin: () => ipcRenderer.invoke("repair:auth-bridge-origin"),
  consumePendingSession: () => ipcRenderer.invoke("repair:consume-pending-session"),
});
