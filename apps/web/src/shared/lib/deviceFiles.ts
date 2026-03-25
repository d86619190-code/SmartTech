/**
 * Выбор файлов с устройства: работает в браузере, в WebView (Capacitor),
 * Electron и на мобильных через стандартный `<input type="file">` с `capture`.
 * Без облака — вложения остаются data URL / скачиваются локально.
 * Фото и видео автоматически сжимаются под лимит (canvas + WebP/JPEG; видео — canvas + MediaRecorder).
 */

export const MAX_CHAT_FILE_BYTES = 2_400_000; /** ~2.3 MB — лимит для JSON в локальной БД */
export const MAX_ORDER_PHOTO_BYTES = 6_000_000;
export const MAX_DIAGNOSTIC_PHOTO_BYTES = 4_000_000;

/** Макс. длительность видео для попытки перекодирования в браузере */
const MAX_VIDEO_COMPRESS_DURATION_SEC = 120;
/** Макс. длинная сторона кадра при сжатии видео */
const MAX_VIDEO_LONG_EDGE = 1280;
/** Стартовый битрейт видео при перекодировании */
const VIDEO_START_BITS_PER_SECOND = 1_200_000;

export type PickedFileMeta = {
  file: File;
  dataUrl: string;
};

function createInput(accept: string, multiple: boolean, capture?: "user" | "environment"): HTMLInputElement {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = accept;
  input.multiple = multiple;
  if (capture) input.setAttribute("capture", capture);
  input.style.position = "fixed";
  input.style.left = "-9999px";
  return input;
}

async function dataUrlByteLength(dataUrl: string): Promise<number> {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return blob.size;
}

function readFileAsDataUrl(file: File, maxBytes: number): Promise<string> {
  return new Promise((resolve, reject) => {
    if (file.size > maxBytes) {
      reject(new Error(`Файл больше ${Math.round(maxBytes / 1024 / 1024)} МБ`));
      return;
    }
    const r = new FileReader();
    r.onload = () => {
      const url = r.result;
      if (typeof url === "string") resolve(url);
      else reject(new Error("Не удалось прочитать файл"));
    };
    r.onerror = () => reject(new Error("Ошибка чтения файла"));
    r.readAsDataURL(file);
  });
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      const u = r.result;
      if (typeof u === "string") resolve(u);
      else reject(new Error("Не удалось прочитать результат"));
    };
    r.onerror = () => reject(new Error("Ошибка чтения результата"));
    r.readAsDataURL(blob);
  });
}

function fitInside(w: number, h: number, maxEdge: number): { width: number; height: number } {
  const scale = Math.min(1, maxEdge / Math.max(w, h));
  return { width: Math.max(1, Math.round(w * scale)), height: Math.max(1, Math.round(h * scale)) };
}

async function loadDrawableImage(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file);
    } catch {
      /* HEIC / неподдерживаемый — пробуем Image */
    }
  }
  const img = new Image();
  const url = URL.createObjectURL(file);
  try {
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Не удалось открыть изображение"));
      img.src = url;
    });
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function encodeCanvasRaster(canvas: HTMLCanvasElement, quality: number): string {
  try {
    const webp = canvas.toDataURL("image/webp", quality);
    if (webp.startsWith("data:image/webp") && webp.length > 100) return webp;
  } catch {
    /* WebP не поддерживается */
  }
  return canvas.toDataURL("image/jpeg", quality);
}

function disposeDrawable(drawable: ImageBitmap | HTMLImageElement): void {
  if (typeof ImageBitmap !== "undefined" && drawable instanceof ImageBitmap) {
    try {
      drawable.close();
    } catch {
      /* noop */
    }
  }
}

/** Сжатие фото под maxBytes: уменьшение стороны и качества. */
export async function compressImageFileToDataUrl(file: File, maxBytes: number): Promise<string> {
  const drawable = await loadDrawableImage(file);
  const sw = drawable instanceof ImageBitmap ? drawable.width : drawable.naturalWidth;
  const sh = drawable instanceof ImageBitmap ? drawable.height : drawable.naturalHeight;
  if (!sw || !sh) {
    disposeDrawable(drawable);
    throw new Error("Пустое изображение");
  }

  let maxEdge = Math.min(2048, Math.max(sw, sh));
  let quality = 0.88;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    disposeDrawable(drawable);
    throw new Error("Не удалось подготовить изображение");
  }

  try {
    for (let attempt = 0; attempt < 48; attempt++) {
      const { width, height } = fitInside(sw, sh, maxEdge);
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(drawable, 0, 0, width, height);
      const dataUrl = encodeCanvasRaster(canvas, quality);
      const size = await dataUrlByteLength(dataUrl);
      if (size <= maxBytes) return dataUrl;
      if (quality > 0.48) {
        quality -= 0.07;
        continue;
      }
      if (maxEdge > 480) {
        maxEdge = Math.floor(maxEdge * 0.85);
        quality = 0.88;
        continue;
      }
      quality -= 0.05;
      if (quality < 0.32) {
        throw new Error("Не удалось сжать фото до допустимого размера — выберите другое изображение");
      }
    }
    throw new Error("Не удалось сжать изображение");
  } finally {
    disposeDrawable(drawable);
  }
}

function pickVideoRecorderMime(): string | null {
  const candidates = ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm", "video/mp4"];
  for (const t of candidates) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(t)) return t;
  }
  return null;
}

async function compressVideoFileToDataUrl(file: File, maxBytes: number): Promise<string> {
  if (file.size <= maxBytes) {
    return readFileAsDataUrl(file, maxBytes);
  }

  const mime = pickVideoRecorderMime();
  if (!mime) {
    throw new Error(
      "Видео слишком большое, а перекодирование в этом браузере недоступно. Выберите короткий ролик или файл меньшего размера.",
    );
  }

  const objectUrl = URL.createObjectURL(file);
  const video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;
  video.setAttribute("playsinline", "");
  video.src = objectUrl;

  try {
    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve();
      video.onerror = () => reject(new Error("Не удалось открыть видео"));
    });

    if (!Number.isFinite(video.duration) || video.duration <= 0) {
      throw new Error("Не удалось определить длительность видео");
    }
    if (video.duration > MAX_VIDEO_COMPRESS_DURATION_SEC) {
      throw new Error(
        `Видео длиннее ${MAX_VIDEO_COMPRESS_DURATION_SEC} с — выберите более короткий ролик или уменьшите размер в галерее.`,
      );
    }

    const vw = video.videoWidth || 640;
    const vh = video.videoHeight || 480;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Не удалось подготовить видео");

    const videoMime = mime.split(";")[0] || "video/webm";
    let bps = VIDEO_START_BITS_PER_SECOND;
    let longEdge = MAX_VIDEO_LONG_EDGE;

    for (let round = 0; round < 4; round++) {
      const { width: cw, height: ch } = fitInside(vw, vh, longEdge);
      canvas.width = cw;
      canvas.height = ch;

      const canvasStream = canvas.captureStream(24);
      try {
        const v = video as HTMLVideoElement & { captureStream?: () => MediaStream };
        if (typeof v.captureStream === "function") {
          const vs = v.captureStream();
          for (const track of vs.getAudioTracks()) {
            canvasStream.addTrack(track);
          }
        }
      } catch {
        /* без звука */
      }

      const chunks: Blob[] = [];
      const recorder = new MediaRecorder(canvasStream, {
        mimeType: mime,
        videoBitsPerSecond: bps,
      });

      await new Promise<void>((resolve, reject) => {
        let settled = false;
        let timeoutId: ReturnType<typeof setTimeout> | undefined;
        const done = (err?: Error) => {
          if (settled) return;
          settled = true;
          if (timeoutId !== undefined) window.clearTimeout(timeoutId);
          if (err) reject(err);
          else resolve();
        };

        const timeoutMs = Math.min(180_000, Math.ceil((video.duration + 3) * 1000));
        timeoutId = window.setTimeout(() => {
          done(new Error("Перекодирование видео заняло слишком много времени"));
        }, timeoutMs);

        recorder.ondataavailable = (e) => {
          if (e.data.size) chunks.push(e.data);
        };
        recorder.onerror = () => done(new Error("Ошибка записи видео"));

        let finishRequested = false;
        const finish = () => {
          if (finishRequested) return;
          finishRequested = true;
          window.setTimeout(() => {
            try {
              if (recorder.state === "recording") {
                try {
                  recorder.requestData();
                } catch {
                  /* noop */
                }
              }
              if (recorder.state !== "inactive") recorder.stop();
            } catch {
              done(new Error("Ошибка остановки записи"));
            }
          }, 150);
        };

        recorder.onstop = () => done();

        video.currentTime = 0;
        video.onended = () => finish();

        const drawFrame = () => {
          ctx.drawImage(video, 0, 0, cw, ch);
          if (video.ended) {
            finish();
            return;
          }
          requestAnimationFrame(drawFrame);
        };

        try {
          recorder.start(200);
        } catch (e) {
          done(e instanceof Error ? e : new Error(String(e)));
          return;
        }

        void video
          .play()
          .then(() => {
            requestAnimationFrame(drawFrame);
          })
          .catch((e) => done(e instanceof Error ? e : new Error(String(e))));
      });

      const outBlob = new Blob(chunks, { type: videoMime });
      if (outBlob.size > 0 && outBlob.size <= maxBytes) {
        return blobToDataUrl(outBlob);
      }
      bps = Math.floor(bps * 0.55);
      longEdge = Math.floor(longEdge * 0.75);
      if (bps < 180_000 && longEdge < 480) break;
    }

    throw new Error(
      "Не удалось сжать видео до допустимого размера — выберите более короткий ролик или снимите в меньшем разрешении.",
    );
  } finally {
    video.pause();
    video.removeAttribute("src");
    video.load();
    URL.revokeObjectURL(objectUrl);
  }
}

async function fileToDataUrlForLimit(file: File, maxBytes: number): Promise<string> {
  const type = file.type || "";
  if (type.startsWith("image/")) {
    return compressImageFileToDataUrl(file, maxBytes);
  }
  if (type.startsWith("video/")) {
    return compressVideoFileToDataUrl(file, maxBytes);
  }
  return readFileAsDataUrl(file, maxBytes);
}

/** Универсальный выбор: галерея/файлы; на телефоне системный диалог или камера при capture. */
export function pickFiles(options: {
  accept: string;
  multiple?: boolean;
  /** Камера: `environment` — задняя, `user` — фронтальная */
  capture?: "user" | "environment";
  maxBytesPerFile?: number;
}): Promise<PickedFileMeta[]> {
  const { accept, multiple = false, capture, maxBytesPerFile = MAX_CHAT_FILE_BYTES } = options;
  return new Promise((resolve, reject) => {
    const input = createInput(accept, multiple, capture);
    const cleanup = () => {
      input.remove();
    };
    input.onchange = () => {
      const files = input.files ? Array.from(input.files) : [];
      cleanup();
      if (files.length === 0) {
        resolve([]);
        return;
      }
      void (async () => {
        try {
          const out: PickedFileMeta[] = [];
          for (const file of files) {
            const dataUrl = await fileToDataUrlForLimit(file, maxBytesPerFile);
            out.push({ file, dataUrl });
          }
          resolve(out);
        } catch (e) {
          reject(e instanceof Error ? e : new Error(String(e)));
        }
      })();
    };
    input.oncancel = () => {
      cleanup();
      resolve([]);
    };
    document.body.appendChild(input);
    input.click();
  });
}

export function pickPhotos(multiple = true): Promise<PickedFileMeta[]> {
  return pickFiles({ accept: "image/*", multiple, maxBytesPerFile: MAX_ORDER_PHOTO_BYTES });
}

export function pickPhotosOrVideos(multiple = true): Promise<PickedFileMeta[]> {
  return pickFiles({
    accept: "image/*,video/*",
    multiple,
    maxBytesPerFile: MAX_CHAT_FILE_BYTES,
  });
}

/** Скачать data URL / blob на устройство (без облака). */
export function downloadDataUrl(dataUrl: string, filename: string): void {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename || "download";
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export function isImageMime(mime: string): boolean {
  return mime.startsWith("image/");
}

export function isVideoMime(mime: string): boolean {
  return mime.startsWith("video/");
}

export function mimeFromDataUrl(dataUrl: string): string {
  const m = /^data:([^;]+);/.exec(dataUrl);
  return m?.[1] ?? "application/octet-stream";
}
