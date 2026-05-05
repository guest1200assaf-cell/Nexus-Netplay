// ─── Auto-Updater — GitHub Releases ─────────────────────────────────────────
const { autoUpdater }  = require('electron-updater');
const { app, dialog, BrowserWindow } = require('electron');
const log = require('electron-log');

// ── Logging ───────────────────────────────────────────────────────────────────
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App version:', app.getVersion());

// ── Configuration ─────────────────────────────────────────────────────────────
autoUpdater.autoDownload    = true;   // Download silently in background
autoUpdater.autoInstallOnAppQuit = true; // Install when user quits

/**
 * Call this from app.whenReady() in main.js after the window is created.
 * Pass mainWindow so we can send progress events to the renderer.
 */
function initUpdater(mainWindow) {
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
  if (isDev) {
    log.info('[Updater] Skipping update check in development mode');
    return;
  }

  // ── Event handlers ──────────────────────────────────────────────────────
  autoUpdater.on('checking-for-update', () => {
    log.info('[Updater] Checking for update…');
    send('updater:checking');
  });

  autoUpdater.on('update-available', (info) => {
    log.info('[Updater] Update available:', info.version);
    send('updater:available', { version: info.version, releaseNotes: info.releaseNotes });
  });

  autoUpdater.on('update-not-available', () => {
    log.info('[Updater] Up to date.');
    send('updater:up-to-date');
  });

  autoUpdater.on('download-progress', (progress) => {
    const msg = `Downloading… ${Math.round(progress.percent)}% (${formatBytes(progress.bytesPerSecond)}/s)`;
    log.info('[Updater]', msg);
    send('updater:progress', {
      percent:  Math.round(progress.percent),
      speed:    formatBytes(progress.bytesPerSecond),
      transferred: formatBytes(progress.transferred),
      total:    formatBytes(progress.total),
    });
  });

  autoUpdater.on('update-downloaded', (info) => {
    log.info('[Updater] Update downloaded:', info.version);
    send('updater:downloaded', { version: info.version });

    // Ask user to restart now or later
    dialog.showMessageBox(mainWindow, {
      type:    'info',
      title:   'تحديث جاهز للتثبيت',
      message: `الإصدار ${info.version} جاهز. هل تريد إعادة التشغيل الآن؟`,
      buttons: ['إعادة تشغيل الآن', 'لاحقاً'],
      defaultId: 0,
      cancelId:  1,
    }).then(({ response }) => {
      if (response === 0) autoUpdater.quitAndInstall(false, true);
    });
  });

  autoUpdater.on('error', (err) => {
    log.error('[Updater] Error:', err.message);
    send('updater:error', { message: err.message });
  });

  // ── Check after 3s delay (let window settle) ──────────────────────────
  setTimeout(() => autoUpdater.checkForUpdates(), 3000);

  // Helper: send event to renderer if window exists
  function send(channel, data = {}) {
    try {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send(channel, data);
      }
    } catch (_) {}
  }
}

function formatBytes(bytes) {
  if (bytes < 1024)       return `${bytes} B`;
  if (bytes < 1048576)    return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

module.exports = { initUpdater };
