<<<<<<< HEAD
// src/main/updater.js
// نظام التحديث التلقائي — يعمل مع GitHub Releases

const { autoUpdater } = require('electron-updater');
const log             = require('electron-log');

// ── توجيه السجلّات إلى ملف ────────────────────────────────
log.transports.file.level = 'info';
autoUpdater.logger = log;

// ── إعدادات السلوك ────────────────────────────────────────
autoUpdater.autoDownload    = true;   // تحميل تلقائي في الخلفية
autoUpdater.autoInstallOnAppQuit = true; // تثبيت عند الإغلاق

/**
 * يهيئ نظام التحديث ويربطه بنافذة Electron
 * @param {BrowserWindow} mainWindow - النافذة الرئيسية للتطبيق
 */
function setupAutoUpdater(mainWindow) {

  // دالة مساعدة: إرسال حدث للـ Renderer
  const send = (event, data = {}) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send(`updater:${event}`, data);
    }
    log.info(`[Updater] ${event}`, data);
  };

  // ── الأحداث ───────────────────────────────────────────────

  // ① فحص التحديثات بدأ
  autoUpdater.on('checking-for-update', () => {
    send('checking');
  });

  // ② يوجد تحديث جديد → يبدأ التحميل التلقائي
  autoUpdater.on('update-available', (info) => {
    send('available', {
      version:     info.version,
      releaseDate: info.releaseDate,
      releaseNotes: info.releaseNotes,
    });
  });

  // ③ لا يوجد تحديث → النسخة حديثة
  autoUpdater.on('update-not-available', (info) => {
    send('not-available', { currentVersion: info.version });
  });

  // ④ تقدّم التحميل
  autoUpdater.on('download-progress', (progress) => {
    send('download-progress', {
      percent:       Math.round(progress.percent),
      transferred:   formatBytes(progress.transferred),
      total:         formatBytes(progress.total),
      bytesPerSecond: formatBytes(progress.bytesPerSecond) + '/s',
    });
  });

  // ⑤ اكتمل التحميل → جاهز للتثبيت
  autoUpdater.on('update-downloaded', (info) => {
    send('downloaded', {
      version:      info.version,
      releaseNotes: info.releaseNotes,
    });
    // يُثبَّت تلقائياً عند الإغلاق (autoInstallOnAppQuit = true)
    // أو يمكنك إظهار dialog للمستخدم للتثبيت الآن
  });

  // ⑥ خطأ
  autoUpdater.on('error', (err) => {
    send('error', { message: err.message });
    log.error('[Updater] Error:', err);
  });

  // ── IPC: طلبات من الـ Renderer ───────────────────────────
  const { ipcMain } = require('electron');

  // المستخدم يريد فحص يدوي
  ipcMain.handle('updater:check-now', async () => {
    try {
      return await autoUpdater.checkForUpdates();
    } catch (e) {
      log.error('[Updater] Manual check failed:', e.message);
      return null;
    }
  });

  // المستخدم يريد التثبيت الآن (بدون انتظار الإغلاق)
  ipcMain.on('updater:install-now', () => {
    autoUpdater.quitAndInstall(false, true);
    // false = لا تُصدر isSilent، true = forceRunAfter
  });

  // ── بدء الفحص ─────────────────────────────────────────────
  // انتظر 5 ثوانٍ بعد فتح التطبيق قبل الفحص (لا يُبطئ الفتح)
  setTimeout(() => {
    autoUpdater.checkForUpdatesAndNotify().catch(err => {
      log.warn('[Updater] Check failed (probably no internet):', err.message);
    });
  }, 5000);
}

// ── دالة مساعدة: تنسيق البايتات ─────────────────────────
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

module.exports = { setupAutoUpdater };
=======
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
>>>>>>> f2a15ce2b0ec8fe19827c78a926291a93c7a800e
