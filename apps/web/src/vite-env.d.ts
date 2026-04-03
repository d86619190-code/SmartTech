/// <reference types="vite/client" />

interface Window {
  /** Только в Electron (preload.js) */
  evrenyanDesktop?: {
    getAuthBridgeOrigin: () => Promise<string | null>;
    consumePendingSession: () => Promise<string | null>;
  };
}

interface ImportMetaEnv {
  readonly VITE_API_ORIGIN?: string;
  readonly VITE_GOOGLE_CLIENT_ID?: string;
  /** Публичный URL веб-приложения (для ссылок в браузер из Electron при file://) */
  readonly VITE_APP_ORIGIN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
