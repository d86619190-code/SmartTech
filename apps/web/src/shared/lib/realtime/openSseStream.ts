export type StreamStatus = "connecting" | "connected" | "reconnecting" | "auth_error";

function isAuthRelatedError(e: unknown): boolean {
  const msg = e instanceof Error ? e.message : String(e);
  return /Сессия|авторизац|401|Unauthorized|Требуется/i.test(msg);
}

type OpenSseStreamOptions = {
  getUrl: () => Promise<string>;
  eventHandlers: Record<string, (rawData: string) => void>;
  onError?: (e: Event) => void;
  onStatus?: (status: StreamStatus) => void;
  initialRetryMs?: number;
  maxRetryMs?: number;
  /** Минимальная пауза перед переподключением — меньше «дрожи» статуса при кратковременных обрывах. */
  minReconnectDelayMs?: number;
};

export function openSseStream(options: OpenSseStreamOptions): () => void {
  const initialRetryMs = options.initialRetryMs ?? 1000;
  const maxRetryMs = options.maxRetryMs ?? 10000;
  const minReconnectDelayMs = options.minReconnectDelayMs ?? 1500;
  let closed = false;
  let es: EventSource | null = null;
  let retryMs = initialRetryMs;

  const reconnectDelay = (): number => Math.max(retryMs, minReconnectDelayMs);

  const connect = async () => {
    if (closed) return;
    options.onStatus?.("connecting");
    try {
      const url = await options.getUrl();
      if (closed) return;
      es = new EventSource(url);
      es.onopen = () => {
        options.onStatus?.("connected");
        retryMs = initialRetryMs;
      };
      for (const [eventName, handler] of Object.entries(options.eventHandlers)) {
        es.addEventListener(eventName, (evt) => {
          handler((evt as MessageEvent).data);
        });
      }
      es.addEventListener("error", (e) => {
        options.onError?.(e);
        es?.close();
        es = null;
        if (closed) return;
        options.onStatus?.("reconnecting");
        const wait = reconnectDelay();
        retryMs = Math.min(maxRetryMs, retryMs * 2);
        window.setTimeout(() => {
          void connect();
        }, wait);
      });
    } catch (e) {
      if (closed) return;
      if (isAuthRelatedError(e)) {
        options.onStatus?.("auth_error");
        return;
      }
      options.onStatus?.("reconnecting");
      const wait = reconnectDelay();
      retryMs = Math.min(maxRetryMs, retryMs * 2);
      window.setTimeout(() => {
        void connect();
      }, wait);
    }
  };

  void connect();
  return () => {
    closed = true;
    es?.close();
  };
}

