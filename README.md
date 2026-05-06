<div align="center">

```
███╗   ██╗███████╗██╗  ██╗██╗   ██╗███████╗
████╗  ██║██╔════╝╚██╗██╔╝██║   ██║██╔════╝
██╔██╗ ██║█████╗   ╚███╔╝ ██║   ██║███████╗
██║╚██╗██║██╔══╝   ██╔██╗ ██║   ██║╚════██║
██║ ╚████║███████╗██╔╝ ██╗╚██████╔╝███████║
╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝
     N E T P L A Y   H U B
```

**نظام المحاكاة الشبكي العابر للمنصات**

اتصال P2P مباشر بدون سيرفرات · بدون اشتراكات · مجاني 100%

[![Release](https://img.shields.io/github/v/release/YOUR_USERNAME/nexus-netplay-hub?style=for-the-badge&color=0078d4&logo=github)](https://github.com/YOUR_USERNAME/nexus-netplay-hub/releases)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
[![Electron](https://img.shields.io/badge/Electron-31-47848F?style=for-the-badge&logo=electron)](https://electronjs.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20Linux%20%7C%20macOS-lightgrey?style=for-the-badge)](https://github.com/YOUR_USERNAME/nexus-netplay-hub/releases)

</div>

---

## ✨ المزايا

| الميزة | التفاصيل |
|--------|----------|
| 🔗 **اتصال P2P مباشر** | WebRTC عبر Simple-Peer — لا سيرفر وسيط، اتصال مشفر بين اللاعبين |
| 🎙 **Voice Chat محلي** | شات صوتي بجودة 48kHz مع إلغاء الصدى وتقليل الضجيج |
| 💾 **مزامنة Save States** | نقل ملفات الـ Save State تلقائياً قبل بدء اللعبة لضمان التزامن |
| ⚙️ **Config Injection** | يعدّل ملفات `.ini` للمحاكيات برمجياً ويستعيدها عند الإغلاق |
| 🔓 **فتح المنافذ (UPnP)** | يفتح المنافذ في الراوتر تلقائياً لضمان اتصال أخضر |
| 🎮 **دعم Controller** | تنقل في الواجهة بالجوستيك — تجربة كاملة بدون لوحة مفاتيح |
| 🔄 **تحديث تلقائي** | يفحص التحديثات عند الفتح ويثبّتها في الخلفية |
| 🖥 **واجهة PS5** | تصميم مستوحى من PlayStation 5 بتأثيرات Blur وGlow |

---

## 🎮 المحاكيات المدعومة

<div align="center">

| المحاكي | المنصة | ملف الإعدادات |
|---------|--------|---------------|
| **PCSX2** | PlayStation 2 | `PCSX2.ini` + `DEV9.ini` |
| **Dolphin** | GameCube / Wii | `Dolphin.ini` |
| **PPSSPP** | PlayStation Portable | `ppsspp.ini` |

</div>

---

## 📥 تحميل للمستخدمين

> **لا تحتاج أي خطوات تقنية — فقط حمّل وشغّل**

<div align="center">

| النظام | الرابط |
|--------|--------|
| 🪟 **Windows** (مثبّت) | [تحميل .exe](https://github.com/YOUR_USERNAME/nexus-netplay-hub/releases/latest) |
| 🪟 **Windows** (Portable) | [تحميل مباشر](https://github.com/YOUR_USERNAME/nexus-netplay-hub/releases/latest) |
| 🐧 **Linux** | [تحميل .AppImage](https://github.com/YOUR_USERNAME/nexus-netplay-hub/releases/latest) |
| 🍎 **macOS** | [تحميل .dmg](https://github.com/YOUR_USERNAME/nexus-netplay-hub/releases/latest) |

</div>

---

## 🛠 تثبيت للمطورين

### المتطلبات
- [Node.js](https://nodejs.org) v18 أو أحدث
- [Git](https://git-scm.com)
- npm v9+

### خطوات التثبيت

```bash
# 1. استنسخ المشروع
git clone https://github.com/YOUR_USERNAME/nexus-netplay-hub.git
cd nexus-netplay-hub

# 2. ثبّت المكتبات
npm install

# 3. شغّل وضع التطوير
npm run dev
```

### أوامر البناء

```bash
npm run dev           # تشغيل بوضع التطوير (Vite + Electron)
npm run build:win     # بناء Windows (.exe + Portable)
npm run build:linux   # بناء Linux (.AppImage + .deb)
npm run build:mac     # بناء macOS (.dmg)
npm run obfuscate     # تشويش الكود قبل البناء
npm run release       # بناء + رفع على GitHub Releases
```

---

## 🏗 هيكل المشروع

```
nexus-netplay-hub/
├── src/
│   ├── main/                    # Electron Main Process
│   │   ├── main.js              # نقطة الدخول
│   │   ├── preload.js           # جسر IPC الآمن
│   │   ├── updater.js           # التحديث التلقائي
│   │   ├── emulators/           # Config Injection لكل محاكي
│   │   ├── ipc/                 # معالجات IPC
│   │   └── network/             # خادم الإشارة المحلي (WebSocket)
│   └── renderer/                # React Frontend
│       ├── pages/               # الصفحات (Home, Lobby, Settings)
│       ├── hooks/               # useP2P, useController, useVoiceChat
│       ├── store/               # Zustand State Management
│       └── components/          # مكونات الواجهة
├── scripts/
│   ├── obfuscate.js             # تشويش الكود
│   └── generate-icons.js        # توليد الأيقونات
├── assets/icons/                # أيقونات المنصات
├── .github/workflows/           # GitHub Actions CI/CD
├── electron-builder.yml         # إعدادات التحزيم
└── package.json
```

---

## 🔧 كيف يعمل

```
┌──────────────────────────────────────────────────────────────┐
│                    Nexus Netplay Hub                         │
│                                                              │
│  ┌─────────────┐  IPC  ┌──────────────────────────────┐    │
│  │ Main Process│◄─────►│     React Renderer (UI)      │    │
│  │             │       │                              │    │
│  │ • Config    │       │  Home → اختيار محاكي        │    │
│  │   Injection │       │  Lobby → غرفة P2P           │    │
│  │ • child_proc│       │  useP2P → WebRTC            │    │
│  │ • UPnP      │       │  useVoiceChat → ميكروفون   │    │
│  │ • WS Server │       │  useFrameSync → مزامنة     │    │
│  └─────────────┘       └──────────────┬───────────────┘    │
│                                       │                      │
└───────────────────────────────────────┼──────────────────────┘
                           WebRTC P2P  │
                    ┌──────────────────▼──────────────────┐
                    │            اللاعب الآخر             │
                    │  Inputs + Voice + Save State Sync   │
                    └─────────────────────────────────────┘
```

---

## 🤝 المساهمة

نرحب بالمساهمات! راجع [CONTRIBUTING.md](CONTRIBUTING.md) للتفاصيل.

---

## 📄 الرخصة

هذا المشروع مرخص تحت [MIT License](LICENSE) — حر الاستخدام والتعديل والتوزيع.

---

<div align="center">

صُنع بـ ❤️ لمجتمع المحاكيات العربي

⭐ إذا أعجبك المشروع، لا تنسَ النجمة!

</div>
