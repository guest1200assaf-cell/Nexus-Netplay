# 🤝 دليل المساهمة — Nexus Netplay Hub

شكراً لاهتمامك بالمساهمة في Nexus Netplay Hub! هذا الدليل يشرح كيف تضيف ميزات جديدة أو تدعم محاكيات إضافية.

---

## 🚀 إعداد بيئة التطوير

```bash
git clone https://github.com/guest1200assaf-cell/Nexus-Netplay.git
cd Nexus-Netplay
npm install
npm run dev:all
```

---

## 🎮 إضافة دعم محاكي جديد

### 1. إنشاء ملف Config Injection

```
src/main/emulators/myemulator.config.js
```

يجب أن يحتوي على:
```js
function injectMyEmulatorNetworkConfig(networkConfig) { ... }
function restoreMyEmulatorConfig() { ... }
function launchMyEmulator(executablePath, isoPath, onExit) { ... }

module.exports = { injectMyEmulatorNetworkConfig, restoreMyEmulatorConfig, launchMyEmulator };
```

### 2. تسجيل IPC Handler

في `src/main/ipc/emulator.ipc.js` أضف:
```js
ipcMain.handle('emulator:launch-myemulator', async (event, cfg) => {
  // inject config + spawn process
});
```

### 3. تحديث الـ Store

في `src/renderer/store/nexusStore.js` أضف اسم المحاكي لقائمة `EMULATORS`.

### 4. إضافة GameCard

في `src/renderer/components/ui/GameCard.jsx` أضف معلومات المحاكي الجديد.

---

## 🔗 تحسين نظام الغرف (Room System)

الكود الرئيسي في:
- `src/main/network/signaling.server.js` — منطق الغرف
- `src/renderer/hooks/useP2P.js` — اتصال P2P

أفكار مفتوحة:
- [ ] دعم غرف خاصة بكلمة مرور
- [ ] قائمة غرف عامة (Public Room Browser)
- [ ] Spectator mode (مشاهد بدون لعب)

---

## 📋 قواعد Pull Request

1. **فرع منفصل** لكل ميزة: `git checkout -b feat/ppsspp-support`
2. **اختبر محلياً** قبل الرفع: `npm run dev:all`
3. **وصف واضح** في الـ PR يشرح ماذا أضفت ولماذا
4. **لا تكسر الـ Main Process** — تأكد من عمل IPC بشكل صحيح

---

## 🐛 الإبلاغ عن Bug

افتح Issue جديد مع:
- نظام التشغيل والإصدار
- اسم المحاكي والإصدار
- خطوات إعادة الإنتاج
- الـ Error من `electron-log` (في `%APPDATA%\nexus-netplay-hub\logs\`)
