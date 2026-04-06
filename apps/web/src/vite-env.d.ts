/// <reference types="vite/client" />

interface Window {
  /** Only in Electron (preload.js) */
  evrenyanDesktop?: {
    getAuthBridgeOrigin: () => Promise<string | null>;
    consumePendingSession: () => Promise<string | null>;
  };
}

interface ImportMetaEnv {
  readonly VITE_API_ORIGIN?: string;
  readonly VITE_GOOGLE_CLIENT_ID?: string;
  /** Public URL of the web application (for links to the browser from Electron at file://) */
  readonly VITE_APP_ORIGIN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
