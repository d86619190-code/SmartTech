const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const fs = require('fs');

const APP_PROTOCOL = 'evrenyan';
let mainWindow = null;
let pendingSession = null;

function getRendererUrl() {
  return process.env.ELECTRON_START_URL || 'http://localhost:5173';
}

function extractSessionFromProtocolUrl(rawUrl) {
  try {
    const url = new URL(rawUrl);
    if (url.protocol !== `${APP_PROTOCOL}:`) return null;
    return url.searchParams.get('session');
  } catch {
    return null;
  }
}

function applyPendingSessionToWindow() {
  if (!mainWindow || !pendingSession) return;
  const devUrl = getRendererUrl();
  const target = `${devUrl}/login?electronSession=${encodeURIComponent(pendingSession)}`;
  pendingSession = null;
  void mainWindow.loadURL(target).catch(() => {});
}

async function createWindow() {
  const win = new BrowserWindow({ width: 800, height: 600 });
  mainWindow = win;
  win.webContents.setWindowOpenHandler(({ url }) => {
    void shell.openExternal(url);
    return { action: 'deny' };
  });
  win.webContents.on('will-navigate', (event, url) => {
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
    const bundled = path.join(__dirname, 'web-dist', 'index.html');
    const sibling = path.join(__dirname, '..', 'web', 'dist', 'index.html');
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
  app.on('second-instance', (_event, argv) => {
    const protocolArg = argv.find((arg) => typeof arg === 'string' && arg.startsWith(`${APP_PROTOCOL}://`));
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

if (process.defaultApp) {
  app.setAsDefaultProtocolClient(APP_PROTOCOL, process.execPath, [path.resolve(process.argv[1])]);
} else {
  app.setAsDefaultProtocolClient(APP_PROTOCOL);
}
app.whenReady().then(createWindow);
