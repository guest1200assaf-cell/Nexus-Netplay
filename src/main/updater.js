// src/main/updater.js
// ظ†ط¸ط§ظ… ط§ظ„طھط­ط¯ظٹط« ط§ظ„طھظ„ظ‚ط§ط¦ظٹ â€” ظٹط¹ظ…ظ„ ظ…ط¹ GitHub Releases

const { autoUpdater } = require('electron-updater');
const log             = require('electron-log');

// â”€â”€ طھظˆط¬ظٹظ‡ ط§ظ„ط³ط¬ظ„ظ‘ط§طھ ط¥ظ„ظ‰ ظ…ظ„ظپ â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
log.transports.file.level = 'info';
autoUpdater.logger = log;

// â”€â”€ ط¥ط¹ط¯ط§ط¯ط§طھ ط§ظ„ط³ظ„ظˆظƒ â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
autoUpdater.autoDownload    = true;   // طھط­ظ…ظٹظ„ طھظ„ظ‚ط§ط¦ظٹ ظپظٹ ط§ظ„ط®ظ„ظپظٹط©
autoUpdater.autoInstallOnAppQuit = true; // طھط«ط¨ظٹطھ ط¹ظ†ط¯ ط§ظ„ط¥ط؛ظ„ط§ظ‚

/**
 * ظٹظ‡ظٹط¦ ظ†ط¸ط§ظ… ط§ظ„طھط­ط¯ظٹط« ظˆظٹط±ط¨ط·ظ‡ ط¨ظ†ط§ظپط°ط© Electron
 * @param {BrowserWindow} mainWindow - ط§ظ„ظ†ط§ظپط°ط© ط§ظ„ط±ط¦ظٹط³ظٹط© ظ„ظ„طھط·ط¨ظٹظ‚
 */
function setupAutoUpdater(mainWindow) {

  // ط¯ط§ظ„ط© ظ…ط³ط§ط¹ط¯ط©: ط¥ط±ط³ط§ظ„ ط­ط¯ط« ظ„ظ„ظ€ Renderer
  const send = (event, data = {}) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send(`updater:${event}`, data);
    }
    log.info(`[Updater] ${event}`, data);
  };

  // â”€â”€ ط§ظ„ط£ط­ط¯ط§ط« â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  // â‘  ظپط­طµ ط§ظ„طھط­ط¯ظٹط«ط§طھ ط¨ط¯ط£
  autoUpdater.on('checking-for-update', () => {
    send('checking');
  });

  // â‘، ظٹظˆط¬ط¯ طھط­ط¯ظٹط« ط¬ط¯ظٹط¯ â†’ ظٹط¨ط¯ط£ ط§ظ„طھط­ظ…ظٹظ„ ط§ظ„طھظ„ظ‚ط§ط¦ظٹ
  autoUpdater.on('update-available', (info) => {
    send('available', {
      version:     info.version,
      releaseDate: info.releaseDate,
      releaseNotes: info.releaseNotes,
    });
  });

  // â‘¢ ظ„ط§ ظٹظˆط¬ط¯ طھط­ط¯ظٹط« â†’ ط§ظ„ظ†ط³ط®ط© ط­ط¯ظٹط«ط©
  autoUpdater.on('update-not-available', (info) => {
    send('not-available', { currentVersion: info.version });
  });

  // â‘£ طھظ‚ط¯ظ‘ظ… ط§ظ„طھط­ظ…ظٹظ„
  autoUpdater.on('download-progress', (progress) => {
    send('download-progress', {
      percent:       Math.round(progress.percent),
      transferred:   formatBytes(progress.transferred),
      total:         formatBytes(progress.total),
      bytesPerSecond: formatBytes(progress.bytesPerSecond) + '/s',
    });
  });

  // â‘¤ ط§ظƒطھظ…ظ„ ط§ظ„طھط­ظ…ظٹظ„ â†’ ط¬ط§ظ‡ط² ظ„ظ„طھط«ط¨ظٹطھ
  autoUpdater.on('update-downloaded', (info) => {
    send('downloaded', {
      version:      info.version,
      releaseNotes: info.releaseNotes,
    });
    // ظٹظڈط«ط¨ظژظ‘طھ طھظ„ظ‚ط§ط¦ظٹط§ظ‹ ط¹ظ†ط¯ ط§ظ„ط¥ط؛ظ„ط§ظ‚ (autoInstallOnAppQuit = true)
    // ط£ظˆ ظٹظ…ظƒظ†ظƒ ط¥ط¸ظ‡ط§ط± dialog ظ„ظ„ظ…ط³طھط®ط¯ظ… ظ„ظ„طھط«ط¨ظٹطھ ط§ظ„ط¢ظ†
  });

  // â‘¥ ط®ط·ط£
  autoUpdater.on('error', (err) => {
    send('error', { message: err.message });
    log.error('[Updater] Error:', err);
  });

  // â”€â”€ IPC: ط·ظ„ط¨ط§طھ ظ…ظ† ط§ظ„ظ€ Renderer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const { ipcMain } = require('electron');

  // ط§ظ„ظ…ط³طھط®ط¯ظ… ظٹط±ظٹط¯ ظپط­طµ ظٹط¯ظˆظٹ
  ipcMain.handle('updater:check-now', async () => {
    try {
      return await autoUpdater.checkForUpdates();
    } catch (e) {
      log.error('[Updater] Manual check failed:', e.message);
      return null;
    }
  });

  // ط§ظ„ظ…ط³طھط®ط¯ظ… ظٹط±ظٹط¯ ط§ظ„طھط«ط¨ظٹطھ ط§ظ„ط¢ظ† (ط¨ط¯ظˆظ† ط§ظ†طھط¸ط§ط± ط§ظ„ط¥ط؛ظ„ط§ظ‚)
  ipcMain.on('updater:install-now', () => {
    autoUpdater.quitAndInstall(false, true);
    // false = ظ„ط§ طھظڈطµط¯ط± isSilentطŒ true = forceRunAfter
  });

  // â”€â”€ ط¨ط¯ط، ط§ظ„ظپط­طµ â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // ط§ظ†طھط¸ط± 5 ط«ظˆط§ظ†ظچ ط¨ط¹ط¯ ظپطھط­ ط§ظ„طھط·ط¨ظٹظ‚ ظ‚ط¨ظ„ ط§ظ„ظپط­طµ (ظ„ط§ ظٹظڈط¨ط·ط¦ ط§ظ„ظپطھط­)
  setTimeout(() => {
    autoUpdater.checkForUpdatesAndNotify().catch(err => {
      log.warn('[Updater] Check failed (probably no internet):', err.message);
    });
  }, 5000);
}

// â”€â”€ ط¯ط§ظ„ط© ظ…ط³ط§ط¹ط¯ط©: طھظ†ط³ظٹظ‚ ط§ظ„ط¨ط§ظٹطھط§طھ â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

module.exports = { setupAutoUpdater };
