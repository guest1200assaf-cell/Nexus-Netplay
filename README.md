<div align="center">
  <img src="assets/icons/nexus.png" width="120" alt="Nexus Netplay Hub Logo" />

  # Nexus Netplay Hub

  **منصة اللعب الجماعي P2P — بدون سيرفر مركزي**

  [![Release](https://img.shields.io/github/v/release/guest1200assaf-cell/Nexus-Netplay?style=for-the-badge&color=0078d4)](https://github.com/guest1200assaf-cell/Nexus-Netplay/releases)
  [![License](https://img.shields.io/github/license/guest1200assaf-cell/Nexus-Netplay?style=for-the-badge&color=7c3aed)](LICENSE)
  [![Build](https://img.shields.io/github/actions/workflow/status/guest1200assaf-cell/Nexus-Netplay/build-release.yml?style=for-the-badge)](https://github.com/guest1200assaf-cell/Nexus-Netplay/actions)
  [![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-informational?style=for-the-badge)](https://github.com/guest1200assaf-cell/Nexus-Netplay/releases)
</div>

---

## ✨ المزايا

| الميزة | التفاصيل |
|--------|---------|
| 🌐 **P2P Direct** | اتصال مباشر بدون سيرفر وسيط باستخدام WebRTC |
| 👥 **4 لاعبين** | غرف تدعم حتى 4 لاعبين بشبكة Mesh كاملة |
| 🎙 **Voice Chat** | صوت ثنائي الاتجاه مدمج عبر WebRTC Audio |
| 💾 **مزامنة Save-State** | مزامنة نقطة الحفظ بين اللاعبين لبدء منسّق |
| ⚙️ **Config Injection** | ضبط إعدادات المحاكي تلقائياً بدون تعديل يدوي |
| 🎮 **Gamepad Navigation** | تنقل كامل بالـ Controller داخل الواجهة |
| 💬 **شات نصي** | محادثة نصية P2P مباشرة داخل الغرفة |

---

## 🎮 المحاكيات المدعومة

<div align="center">

| المحاكي | النظام | الحالة |
|---------|--------|--------|
| **PCSX2** | PlayStation 2 | ✅ مدعوم |
| **Dolphin** | GameCube / Wii | ✅ مدعوم |
| **PPSSPP** | PlayStation Portable | ✅ مدعوم |

</div>

---

## 📥 التثبيت للمستخدمين

### Windows
1. حمّل `Nexus-Netplay-Setup-x.x.x.exe` من [Releases](https://github.com/YOUR_USERNAME/nexus-netplay-hub/releases)
2. شغّل المثبّت واتبع الخطوات
3. افتح التطبيق من قائمة Start أو سطح المكتب

أو حمّل النسخة المحمولة `Nexus-Netplay-Portable-x.x.x.exe` بدون تثبيت.

---

## 🛠 إعداد بيئة التطوير

### المتطلبات

- Node.js 18+
- أحد المحاكيات: [PCSX2](https://pcsx2.net) / [Dolphin](https://dolphin-emu.org) / [PPSSPP](https://www.ppsspp.org)

### التثبيت

```bash
git clone https://github.com/guest1200assaf-cell/Nexus-Netplay.git
cd Nexus-Netplay
npm install
```

### التشغيل (وضع التطوير)

```bash
# Vite فقط (للتصميم)
npm run dev

# Electron + Vite معاً (التجربة الكاملة)
npm run dev:all
```

---

## 📦 البناء والنشر

```bash
# بناء Windows (NSIS + Portable)
npm run build:win

# رفع Release لـ GitHub تلقائياً
npm run release
```

أو استخدم Git Tags لتشغيل GitHub Actions تلقائياً:

```bash
git tag v1.0.0
git push origin v1.0.0
```

---

## 🏗 هيكل المشروع

```
nexus-netplay-hub/
├── src/
│   ├── main/           # Electron main process
│   │   ├── emulators/  # Config injection (PCSX2, Dolphin, PPSSPP)
│   │   ├── ipc/        # IPC handlers
│   │   ├── network/    # WebSocket signaling + UPnP
│   │   └── updater.js  # Auto-updater
│   ├── renderer/       # React frontend
│   │   ├── components/ # UI components
│   │   ├── hooks/      # useP2P, useVoiceChat, useFrameSync, useController
│   │   ├── pages/      # Home, Lobby, Settings
│   │   └── store/      # Zustand global state
│   └── shared/         # Constants & protocols
└── assets/icons/       # App icons
```

---

## 🤝 المساهمة

راجع [CONTRIBUTING.md](CONTRIBUTING.md) للتعرف على كيفية إضافة محاكيات جديدة أو تحسين نظام الغرف.

---

## 📄 الرخصة

[MIT License](LICENSE) — © 2025 Nexus Team
