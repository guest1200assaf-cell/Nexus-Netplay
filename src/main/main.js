<<<<<<< HEAD
// src/main/main.js
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { setupEmulatorIPC } = require('./ipc/emulator.ipc');
const { setupNetworkIPC }  = require('./ipc/network.ipc');
const { setupFilesIPC }    = require('./ipc/files.ipc');
const { startSignalingServer } = require('./network/signaling.server');
const { setupAutoUpdater }     = require('./updater');
=======
// ─── Nexus Netplay Hub — Electron Main Process ──────────────────────────────
const { app, BrowserWindow, ipcMain, session } = require('electron');
const path = require('path');

const { setupEmulatorIPC }     = require('./ipc/emulator.ipc');
const { setupNetworkIPC }      = require('./ipc/network.ipc');
const { setupFilesIPC }        = require('./ipc/files.ipc');
const { startSignalingServer } = require('./network/signaling.server');
const { initUpdater }          = require('./updater');

>>>>>>> f2a15ce2b0ec8fe19827c78a926291a93c7a800e

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 600,
    frame: false,
<<<<<<< HEAD
=======
    transparent: false,
>>>>>>> f2a15ce2b0ec8fe19827c78a926291a93c7a800e
    backgroundColor: '#07071a',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
<<<<<<< HEAD
    },
  });

  const isDev = process.env.NODE_ENV === 'development';
  mainWindow.loadURL(
    isDev
      ? 'http://localhost:5173'
      : `file://${path.join(__dirname, '../../dist/index.html')}`
  );

  if (isDev) mainWindow.webContents.openDevTools({ mode: 'detach' });
=======
      sandbox: false,
      webSecurity: false,
    },
  });

  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    // Load from extraResources (outside ASAR) for reliable file access
    mainWindow.loadFile(path.join(process.resourcesPath, 'dist', 'index.html'));
  }

  mainWindow.on('closed', () => { mainWindow = null; });
>>>>>>> f2a15ce2b0ec8fe19827c78a926291a93c7a800e
}

app.whenReady().then(async () => {
  createWindow();
<<<<<<< HEAD
  await startSignalingServer(7331);
  setupEmulatorIPC(ipcMain);
  setupNetworkIPC(ipcMain);
  setupFilesIPC(ipcMain);
  setupAutoUpdater(mainWindow);

  ipcMain.on('window:minimize', () => mainWindow.minimize());
  ipcMain.on('window:maximize', () =>
    mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize()
  );
  ipcMain.on('window:close', () => mainWindow.close());
=======

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
>>>>>>> f2a15ce2b0ec8fe19827c78a926291a93c7a800e
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
<<<<<<< HEAD
=======

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
>>>>>>> f2a15ce2b0ec8fe19827c78a926291a93c7a800e
