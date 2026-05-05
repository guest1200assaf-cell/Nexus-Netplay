// ─── Nexus Netplay Hub — Electron Main Process ──────────────────────────────
const { app, BrowserWindow, ipcMain, session } = require('electron');
const path = require('path');

const { setupEmulatorIPC }     = require('./ipc/emulator.ipc');
const { setupNetworkIPC }      = require('./ipc/network.ipc');
const { setupFilesIPC }        = require('./ipc/files.ipc');
const { startSignalingServer } = require('./network/signaling.server');
const { initUpdater }          = require('./updater');


let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 600,
    frame: false,
    transparent: false,
    backgroundColor: '#07071a',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      webSecurity: false,
    },
  });

  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    const { format } = require('url');
    mainWindow.loadURL(
      format({
        pathname: path.join(__dirname, '../../dist/index.html'),
        protocol: 'file:',
        slashes: true,
      })
    );
  }

  mainWindow.on('closed', () => { mainWindow = null; });
}

app.whenReady().then(async () => {
  createWindow();

  // Start the local signaling WebSocket server
  await startSignalingServer(7331);

  // Register all IPC handlers
  setupEmulatorIPC(ipcMain);
  setupNetworkIPC(ipcMain);
  setupFilesIPC(ipcMain);

  // Custom window controls (frameless)
  ipcMain.on('window:minimize', () => mainWindow?.minimize());
  ipcMain.on('window:maximize', () =>
    mainWindow?.isMaximized() ? mainWindow.unmaximize() : mainWindow?.maximize()
  );
  ipcMain.on('window:close', () => mainWindow?.close());
  ipcMain.handle('window:is-maximized', () => mainWindow?.isMaximized() ?? false);

  // Initialize auto-updater (no-op in dev mode)
  initUpdater(mainWindow);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
