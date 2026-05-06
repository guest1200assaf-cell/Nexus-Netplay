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