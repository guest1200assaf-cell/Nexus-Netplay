# 🚀 دليل النشر والتحزيم الكامل — Nexus Netplay Hub

---

## المرحلة 1 — إعداد المشروع أول مرة

```bash
# 1. استنسخ المشروع
git clone https://github.com/YOUR_USERNAME/nexus-netplay-hub
cd nexus-netplay-hub

# 2. ثبّت المكتبات
npm install

# 3. اختبر في وضع التطوير
npm run dev
```

---

## المرحلة 2 — إعداد الأيقونات

### الأحجام المطلوبة لكل منصة:

| المنصة  | الصيغة  | الأحجام المطلوبة |
|---------|---------|-----------------|
| Windows | `.ico`  | 16, 32, 48, 64, 128, **256** (الأهم) |
| Linux   | `.png`  | 16, 32, 48, 64, 128, 256, 512 |
| macOS   | `.icns` | 16, 32, 64, 128, 256, 512, **1024** |

### توليد الأيقونات تلقائياً:
```bash
# 1. ضع صورتك في: assets/icons/icon-source.png (1024×1024 PNG)
# 2. ثبّت sharp
npm install sharp --save-dev
# 3. شغّل السكريبت
node scripts/generate-icons.js
# 4. حوّل الـ PNG إلى ICO (Windows)
npx png-to-ico assets/icons/256x256.png > assets/icons/icon.ico
```

---

## المرحلة 3 — إصدار GitHub Token

### خطوات إنشاء الـ Token:

```
1. افتح: https://github.com/settings/tokens
2. اضغط "Generate new token (classic)"
3. Name: nexus-netplay-release
4. Expiration: No expiration (أو 1 year)
5. Permissions: ✅ repo (كاملة)
6. اضغط "Generate token"
7. انسخ الـ token فوراً (لن يظهر مرة ثانية!)
```

### ربط الـ Token بـ electron-builder:

**طريقة 1 — متغير البيئة (محلياً):**
```bash
# Windows (PowerShell)
$env:GH_TOKEN = "ghp_xxxxxxxxxxxxxxxxxxxx"
npm run release

# Linux/macOS
export GH_TOKEN="ghp_xxxxxxxxxxxxxxxxxxxx"
npm run release
```

**طريقة 2 — ملف .env (لا ترفعه على GitHub!):**
```bash
# .env
GH_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
```
```js
// أضف في بداية electron-builder.yml أو package.json build:
// electron-builder يقرأ GH_TOKEN تلقائياً من env
```

**طريقة 3 — GitHub Actions Secret (للـ CI/CD):**
```
1. افتح الريبو على GitHub
2. Settings → Secrets and variables → Actions
3. New repository secret
4. Name: GH_TOKEN
5. Value: ghp_xxxxxxxxxxxxxxxxxxxx
```

---

## المرحلة 4 — أوامر البناء

```bash
# ── تطوير ───────────────────────────────────────────────
npm run dev                    # Electron + Vite معاً

# ── بناء بدون رفع ───────────────────────────────────────
npm run build                  # كل المنصات
npm run build:win              # Windows فقط (.exe + portable)
npm run build:linux            # Linux فقط (.AppImage + .deb)
npm run build:mac              # macOS فقط (.dmg)

# الإخراج في: dist-electron/

# ── بناء + رفع على GitHub Releases ─────────────────────
npm run release                # يبني ويرفع كل المنصات
# أو:
GH_TOKEN=xxx electron-builder --publish always

# ── تشويش الكود أولاً ثم بناء ──────────────────────────
npm run obfuscate && npm run build
```

---

## المرحلة 5 — إصدار نسخة جديدة (Release Workflow)

```bash
# 1. عدّل رقم الإصدار
npm version patch   # 1.0.0 → 1.0.1
# أو:
npm version minor   # 1.0.0 → 1.1.0
# أو:
npm version major   # 1.0.0 → 2.0.0

# 2. ادفع الكود مع الـ tag
git push origin main --follow-tags

# GitHub Actions سيبني تلقائياً لـ 3 منصات ويرفع على Releases!
```

---

## المرحلة 6 — حماية الكود (Obfuscation)

### مستويات الحماية:

| المستوى | السرعة | الحماية | متى تستخدمه |
|---------|--------|---------|-------------|
| `low`    | سريع  | أساسية  | تطوير/اختبار |
| `medium` | متوسط | جيدة    | **الموصى به** |
| `high`   | بطيء  | قوية    | كود حساس جداً |

### تشغيل التشويش:
```bash
node scripts/obfuscate.js
# الإخراج في: src/main-obfuscated/
```

### ما يفعله التشويش:
```javascript
// قبل التشويش:
function sendInput(input) {
  if (!peerRef.current?.connected) return;
  peerRef.current.send(JSON.stringify({ type: 'input', ...input }));
}

// بعد التشويش:
function _0x3a7f(_0x1b2c, _0x4d5e) {
  if (!_0x1b2c['\x63\x75\x72\x72\x65\x6e\x74']?.['\x63\x6f\x6e\x6e\x65\x63\x74\x65\x64']) return;
  _0x1b2c['\x63\x75\x72\x72\x65\x6e\x74'][_0xa3b4[12]](
    JSON[_0xa3b4[7]]({[_0xa3b4[13]]: _0xa3b4[14], ..._0x4d5e})
  );
}
```

### استراتيجية الحماية الكاملة:

```
┌──────────────────────────────────────────────────────────┐
│  طبقة 1: Obfuscation (javascript-obfuscator)            │
│  → يُشوّش main process (منطق P2P + Config Injection)    │
│                                                          │
│  طبقة 2: ASAR packaging (electron-builder)              │
│  → يحزم كل الملفات في archive مشفرة                    │
│                                                          │
│  طبقة 3: Vite Minification (esbuild)                    │
│  → يضغط ويُصغّر كود React تلقائياً                     │
│                                                          │
│  طبقة 4: Code Signing (اختياري)                         │
│  → يمنع التلاعب بالملف التنفيذي (يحتاج شهادة مدفوعة)  │
└──────────────────────────────────────────────────────────┘

⚠️  ملاحظة مهمة: لا يوجد حماية مطلقة في Electron.
    المحدد الحقيقي هو صعوبة التحليل، وليس الاستحالة.
    الـ ASAR يمكن فتحه بـ: npx asar extract app.asar ./
    لكن مع التشويش، الكود المستخرج يكون غير قابل للفهم.
```

---

## هيكل ملفات dist-electron بعد البناء

```
dist-electron/
├── Nexus Netplay Hub-Setup-1.0.0.exe     ← مثبّت NSIS
├── Nexus Netplay Hub-1.0.0.exe           ← Portable
├── Nexus Netplay Hub-1.0.0-win.zip       ← ZIP
├── Nexus Netplay Hub-1.0.0.AppImage      ← Linux
├── Nexus Netplay Hub-1.0.0.deb           ← Debian
├── Nexus Netplay Hub-1.0.0.dmg           ← macOS
├── latest.yml                            ← يقرأه auto-updater (Windows)
├── latest-linux.yml                      ← يقرأه auto-updater (Linux)
└── latest-mac.yml                        ← يقرأه auto-updater (macOS)
```

ملفات `.yml` تُرفع تلقائياً مع الـ Release وهي ما يستخدمها `electron-updater` لمعرفة آخر إصدار.
