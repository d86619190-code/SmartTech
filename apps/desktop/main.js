const { app, BrowserWindow, shell, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
const http = require("http");

const APP_PROTOCOL = "evrenyan";
let mainWindow = null;
let pendingSession = null;
/** Base64 сессии для передачи в renderer через IPC (не в URL — лимит длины) */
let pendingSessionPayload = null;
/** @type {string | null} */
let authBridgeOrigin = null;
/** @type {import('http').Server | null} */
let authBridgeServer = null;

function getRendererUrl() {
  return process.env.ELECTRON_START_URL || "http://localhost:5173";
}

function extractSessionFromProtocolUrl(rawUrl) {
  try {
    const url = new URL(rawUrl);
    if (url.protocol !== `${APP_PROTOCOL}:`) return null;
    return url.searchParams.get("session");
  } catch {
    return null;
  }
}

function findProtocolArgInArgv(argv) {
  if (!Array.isArray(argv)) return null;
  return argv.find((arg) => typeof arg === "string" && arg.startsWith(`${APP_PROTOCOL}://`)) ?? null;
}

function consumeProtocolFromArgv(argv) {
  const protocolArg = findProtocolArgInArgv(argv);
  if (!protocolArg) return;
  const session = extractSessionFromProtocolUrl(protocolArg);
  if (session) pendingSession = session;
}

function applyPendingSessionToWindow() {
  if (!mainWindow || !pendingSession) return;
  pendingSessionPayload = pendingSession;
  pendingSession = null;
  const devUrl = getRendererUrl();
  const base = devUrl.replace(/\/$/, "");
  void mainWindow.loadURL(`${base}/#/login?electronSession=__ipc__`).catch(() => {});
}

const MAX_SESSION_BODY = 512 * 1024;

function finishAuthCallback(res, session) {
  if (!session || session.length < 8) {
    res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Missing or invalid session");
    return;
  }
  pendingSession = session;
  applyPendingSessionToWindow();
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.end(
    `<!DOCTYPE html><html lang="ru"><head><meta charset="utf-8"><title>Вход</title></head>` +
      `<body style="font-family:system-ui,sans-serif;padding:24px;max-width:420px;margin:auto;">` +
      `<p><strong>Вход выполнен.</strong> Вернитесь в приложение на компьютере — это окно можно закрыть.</p>` +
      `</body></html>`,
  );
}

function startAuthBridgeServer() {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      try {
        const url = new URL(req.url || "/", "http://127.0.0.1");
        if (url.pathname !== "/auth-callback") {
          res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
          res.end("Not found");
          return;
        }
        if (req.method === "GET") {
          finishAuthCallback(res, url.searchParams.get("session"));
          return;
        }
        if (req.method === "POST") {
          let raw = "";
          let aborted = false;
          req.on("data", (chunk) => {
            if (aborted) return;
            raw += chunk;
            if (raw.length > MAX_SESSION_BODY) {
              aborted = true;
              res.writeHead(413, { "Content-Type": "text/plain; charset=utf-8" });
              res.end("Payload too large");
              req.destroy();
            }
          });
          req.on("end", () => {
            if (aborted || res.writableEnded) return;
            try {
              const ct = (req.headers["content-type"] || "").toLowerCase();
              let session = null;
              if (ct.includes("application/json")) {
                const j = JSON.parse(raw || "{}");
                session = typeof j.session === "string" ? j.session : null;
              } else {
                session = new URLSearchParams(raw).get("session");
              }
              finishAuthCallback(res, session);
            } catch {
              if (!res.writableEnded) {
                res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
                res.end("Bad request");
              }
            }
          });
          return;
        }
        res.writeHead(405, { Allow: "GET, POST" });
        res.end();
      } catch {
        res.writeHead(500);
        res.end();
      }
    });
    server.listen(0, "127.0.0.1", () => {
      const addr = server.address();
      const port = typeof addr === "object" && addr ? addr.port : 0;
      authBridgeOrigin = `http://127.0.0.1:${port}`;
      authBridgeServer = server;
      resolve(server);
    });
    server.once("error", reject);
  });
}

async function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  mainWindow = win;
  win.webContents.setWindowOpenHandler(({ url }) => {
    void shell.openExternal(url);
    return { action: "deny" };
  });
  win.webContents.on("will-navigate", (event, url) => {
    const current = new URL(win.webContents.getURL());
    const next = new URL(url);
    if (current.origin !== next.origin) {
      event.preventDefault();
      void shell.openExternal(url);
    }
  });
  const devUrl = getRendererUrl();
  try {
    await win.loadURL(devUrl);
  } catch {
    const bundled = path.join(__dirname, "web-dist", "index.html");
    const sibling = path.join(__dirname, "..", "web", "dist", "index.html");
    if (fs.existsSync(bundled)) {
      await win.loadFile(bundled);
    } else {
      await win.loadFile(sibling);
    }
  }
  applyPendingSessionToWindow();
}

const gotSingleInstance = app.requestSingleInstanceLock();
if (!gotSingleInstance) {
  app.quit();
} else {
  app.on("second-instance", (_event, argv) => {
    const protocolArg = findProtocolArgInArgv(argv);
    if (protocolArg) {
      const session = extractSessionFromProtocolUrl(protocolArg);
      if (session) {
        pendingSession = session;
        applyPendingSessionToWindow();
      }
    }
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

if (process.platform === "darwin") {
  app.on("open-url", (event, url) => {
    event.preventDefault();
    const session = extractSessionFromProtocolUrl(url);
    if (session) {
      pendingSession = session;
      applyPendingSessionToWindow();
    }
  });
}

if (process.defaultApp) {
  app.setAsDefaultProtocolClient(APP_PROTOCOL, process.execPath, [path.resolve(process.argv[1])]);
} else {
  app.setAsDefaultProtocolClient(APP_PROTOCOL);
}

ipcMain.handle("evrenyan:auth-bridge-origin", () => authBridgeOrigin);

ipcMain.handle("evrenyan:consume-pending-session", () => {
  const s = pendingSessionPayload;
  pendingSessionPayload = null;
  return s;
});

app.whenReady().then(async () => {
  try {
    await startAuthBridgeServer();
  } catch (e) {
    console.error("evrenyan: auth bridge server failed", e);
  }
  consumeProtocolFromArgv(process.argv);
  void createWindow();
});

app.on("before-quit", () => {
  if (authBridgeServer) {
    try {
      authBridgeServer.close();
    } catch {
      // noop
    }
    authBridgeServer = null;
  }
});
