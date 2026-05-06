# 🤝 دليل المساهمة في Nexus Netplay Hub

أهلاً! سعداء بمساهمتك في المشروع. هذا الدليل يشرح كيفية المشاركة.

---

## 📋 أين تبدأ؟

### المساهمات المرحّب بها:
- 🐛 **إصلاح أخطاء** — ابحث في [Issues](../../issues?q=is%3Aissue+is%3Aopen+label%3Abug)
- 🎮 **دعم محاكيات جديدة** — RetroArch, RPCS3, Xenia, Cemu...
- 🌐 **تحسين الشبكة** — NAT traversal، TURN servers، اتصال عبر Relay
- 🎨 **تحسين الواجهة** — أنيميشن، ثيمات، إمكانية الوصول
- 📖 **التوثيق** — ترجمة، شروحات، فيديوهات

---

## 🛠 إعداد بيئة التطوير

```bash
# 1. Fork الريبو من GitHub ثم استنسخه
git clone https://github.com/YOUR_USERNAME/nexus-netplay-hub.git
cd nexus-netplay-hub

# 2. أضف الريبو الأصلي كـ upstream
git remote add upstream https://github.com/ORIGINAL_OWNER/nexus-netplay-hub.git

# 3. ثبّت المكتبات
npm install

# 4. أنشئ branch جديد لتعديلاتك
git checkout -b feature/add-rpcs3-support
# أو:
git checkout -b fix/upnp-timeout-bug

# 5. شغّل التطبيق
npm run dev
```

---

## 🎮 كيف تضيف دعم محاكٍ جديد؟

### الخطوات:

**1. أنشئ ملف Config Injector جديد:**
```bash
# مثال: إضافة RPCS3
touch src/main/emulators/rpcs3.config.js
```

**2. اتبع نفس الهيكل الموجود:**
```javascript
// src/main/emulators/rpcs3.config.js

function getRPCS3ConfigPath() {
  // حدد مسار ملف الإعدادات لكل منصة
}

function injectRPCS3NetworkConfig({ hostIP, port, isHost }) {
  // اقرأ الملف → عدّل القيم → احفظ نسخة احتياطية → اكتب
}

function restoreRPCS3Config() {
  // استعادة النسخة الاحتياطية
}

function launchRPCS3(executablePath, gameFile, onExit) {
  // spawn child_process
}

module.exports = { injectRPCS3NetworkConfig, restoreRPCS3Config, launchRPCS3 };
```

**3. سجّله في IPC:**
```javascript
// src/main/ipc/emulator.ipc.js
const { injectRPCS3NetworkConfig, launchRPCS3 } = require('../emulators/rpcs3.config');

ipcMain.handle('emulator:launch-rpcs3', async (event, config) => { ... });
```

**4. أضفه في الواجهة:**
```javascript
// src/renderer/pages/Home.jsx
const EMULATORS = [
  // ... المحاكيات الموجودة
  { id: 'rpcs3', label: 'PlayStation 3', icon: '🎮', color: '#1a1a6e', sub: 'RPCS3' },
];
```

**5. اختبره وأرسل Pull Request!**

---

## 📐 معايير الكود

```javascript
// ✅ صح: تعليقات عربية للمنطق المهم
function injectConfig(config) {
  // نحفظ نسخة احتياطية قبل أي تعديل
  backupOriginal(configPath);
  // ...
}

// ❌ خطأ: كود بدون تعليقات لمنطق معقد
function x(c) { backup(p); modify(c); }
```

**القواعد:**
- استخدم `const` و `let` — لا `var`
- أضف JSDoc للدوال العامة
- لا ترفع ملفات `.env` أو مسارات محلية
- اختبر على Windows قبل الـ PR إن أمكن

---

## 🔀 سير العمل (Workflow)

```
main ──────────────────────────────────────────► (stable)
  └── dev ────────────────────────────────────► (integration)
        ├── feature/add-rpcs3-support
        ├── fix/voice-chat-echo
        └── ui/ps5-theme-improvements
```

1. **Fork** → **branch من `dev`** → **كود** → **PR إلى `dev`**
2. بعد المراجعة، `dev` تُدمج في `main` مع كل Release

---

## 🐛 الإبلاغ عن خطأ

افتح Issue جديد واملأ هذا القالب:

```markdown
**وصف الخطأ:**
[ماذا يحدث؟]

**خطوات إعادة الإنتاج:**
1. افتح التطبيق
2. اختر محاكي PCSX2
3. اضغط "استضافة غرفة"
4. [ماذا يحدث]

**المتوقع:** [ما الذي كان يجب أن يحدث]
**النظام:** Windows 11 / Ubuntu 24 / macOS 14
**الإصدار:** v1.2.0
**الـ Logs:** (من electron-log أو DevTools Console)
```

---

## 💬 للتواصل

- 🐛 **Issues:** للأخطاء والاقتراحات
- 💬 **Discussions:** للأسئلة العامة والأفكار
- 📧 **Email:** nexus@example.com

شكراً لمساهمتك! 🙏🎮
