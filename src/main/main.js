// src/main/main.js
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { setupEmulatorIPC } = require('./ipc/emulator.ipc');
const { setupNetworkIPC }  = require('./ipc/network.ipc');
const { setupFilesIPC }    = require('./ipc/files.ipc');
const { startSignalingServer } = require('./network/signaling.server');
const { setupAutoUpdater }     = require('./updater');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 600,
    frame: false,
    backgroundColor: '#07071a',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const isDev = process.env.NODE_ENV === 'development';
  mainWindow.loadURL(
    isDev
      ? 'http://localhost:5173'
      : `file://${path.join(__dirname, '../../dist/index.html')}`
  );

  if (isDev) mainWindow.webContents.openDevTools({ mode: 'detach' });
}

app.whenReady().then(async () => {
  createWindow();
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
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
