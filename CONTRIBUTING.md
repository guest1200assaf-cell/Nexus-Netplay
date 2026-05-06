# ًں¤‌ ط¯ظ„ظٹظ„ ط§ظ„ظ…ط³ط§ظ‡ظ…ط© ظپظٹ Nexus Netplay Hub

ط£ظ‡ظ„ط§ظ‹! ط³ط¹ط¯ط§ط، ط¨ظ…ط³ط§ظ‡ظ…طھظƒ ظپظٹ ط§ظ„ظ…ط´ط±ظˆط¹. ظ‡ط°ط§ ط§ظ„ط¯ظ„ظٹظ„ ظٹط´ط±ط­ ظƒظٹظپظٹط© ط§ظ„ظ…ط´ط§ط±ظƒط©.

---

## ًں“‹ ط£ظٹظ† طھط¨ط¯ط£طں

### ط§ظ„ظ…ط³ط§ظ‡ظ…ط§طھ ط§ظ„ظ…ط±ط­ظ‘ط¨ ط¨ظ‡ط§:
- ًںگ› **ط¥طµظ„ط§ط­ ط£ط®ط·ط§ط،** â€” ط§ط¨ط­ط« ظپظٹ [Issues](../../issues?q=is%3Aissue+is%3Aopen+label%3Abug)
- ًںژ® **ط¯ط¹ظ… ظ…ط­ط§ظƒظٹط§طھ ط¬ط¯ظٹط¯ط©** â€” RetroArch, RPCS3, Xenia, Cemu...
- ًںŒگ **طھط­ط³ظٹظ† ط§ظ„ط´ط¨ظƒط©** â€” NAT traversalطŒ TURN serversطŒ ط§طھطµط§ظ„ ط¹ط¨ط± Relay
- ًںژ¨ **طھط­ط³ظٹظ† ط§ظ„ظˆط§ط¬ظ‡ط©** â€” ط£ظ†ظٹظ…ظٹط´ظ†طŒ ط«ظٹظ…ط§طھطŒ ط¥ظ…ظƒط§ظ†ظٹط© ط§ظ„ظˆطµظˆظ„
- ًں“– **ط§ظ„طھظˆط«ظٹظ‚** â€” طھط±ط¬ظ…ط©طŒ ط´ط±ظˆط­ط§طھطŒ ظپظٹط¯ظٹظˆظ‡ط§طھ

---

## ًں›  ط¥ط¹ط¯ط§ط¯ ط¨ظٹط¦ط© ط§ظ„طھط·ظˆظٹط±

```bash
# 1. Fork ط§ظ„ط±ظٹط¨ظˆ ظ…ظ† GitHub ط«ظ… ط§ط³طھظ†ط³ط®ظ‡
git clone https://github.com/YOUR_USERNAME/nexus-netplay-hub.git
cd nexus-netplay-hub

# 2. ط£ط¶ظپ ط§ظ„ط±ظٹط¨ظˆ ط§ظ„ط£طµظ„ظٹ ظƒظ€ upstream
git remote add upstream https://github.com/ORIGINAL_OWNER/nexus-netplay-hub.git

# 3. ط«ط¨ظ‘طھ ط§ظ„ظ…ظƒطھط¨ط§طھ
npm install

# 4. ط£ظ†ط´ط¦ branch ط¬ط¯ظٹط¯ ظ„طھط¹ط¯ظٹظ„ط§طھظƒ
git checkout -b feature/add-rpcs3-support
# ط£ظˆ:
git checkout -b fix/upnp-timeout-bug

# 5. ط´ط؛ظ‘ظ„ ط§ظ„طھط·ط¨ظٹظ‚
npm run dev
```

---

## ًںژ® ظƒظٹظپ طھط¶ظٹظپ ط¯ط¹ظ… ظ…ط­ط§ظƒظچ ط¬ط¯ظٹط¯طں

### ط§ظ„ط®ط·ظˆط§طھ:

**1. ط£ظ†ط´ط¦ ظ…ظ„ظپ Config Injector ط¬ط¯ظٹط¯:**
```bash
# ظ…ط«ط§ظ„: ط¥ط¶ط§ظپط© RPCS3
touch src/main/emulators/rpcs3.config.js
```

**2. ط§طھط¨ط¹ ظ†ظپط³ ط§ظ„ظ‡ظٹظƒظ„ ط§ظ„ظ…ظˆط¬ظˆط¯:**
```javascript
// src/main/emulators/rpcs3.config.js

function getRPCS3ConfigPath() {
  // ط­ط¯ط¯ ظ…ط³ط§ط± ظ…ظ„ظپ ط§ظ„ط¥ط¹ط¯ط§ط¯ط§طھ ظ„ظƒظ„ ظ…ظ†طµط©
}

function injectRPCS3NetworkConfig({ hostIP, port, isHost }) {
  // ط§ظ‚ط±ط£ ط§ظ„ظ…ظ„ظپ â†’ ط¹ط¯ظ‘ظ„ ط§ظ„ظ‚ظٹظ… â†’ ط§ط­ظپط¸ ظ†ط³ط®ط© ط§ط­طھظٹط§ط·ظٹط© â†’ ط§ظƒطھط¨
}

function restoreRPCS3Config() {
  // ط§ط³طھط¹ط§ط¯ط© ط§ظ„ظ†ط³ط®ط© ط§ظ„ط§ط­طھظٹط§ط·ظٹط©
}

function launchRPCS3(executablePath, gameFile, onExit) {
  // spawn child_process
}

module.exports = { injectRPCS3NetworkConfig, restoreRPCS3Config, launchRPCS3 };
```

**3. ط³ط¬ظ‘ظ„ظ‡ ظپظٹ IPC:**
```javascript
// src/main/ipc/emulator.ipc.js
const { injectRPCS3NetworkConfig, launchRPCS3 } = require('../emulators/rpcs3.config');

ipcMain.handle('emulator:launch-rpcs3', async (event, config) => { ... });
```

**4. ط£ط¶ظپظ‡ ظپظٹ ط§ظ„ظˆط§ط¬ظ‡ط©:**
```javascript
// src/renderer/pages/Home.jsx
const EMULATORS = [
  // ... ط§ظ„ظ…ط­ط§ظƒظٹط§طھ ط§ظ„ظ…ظˆط¬ظˆط¯ط©
  { id: 'rpcs3', label: 'PlayStation 3', icon: 'ًںژ®', color: '#1a1a6e', sub: 'RPCS3' },
];
```

**5. ط§ط®طھط¨ط±ظ‡ ظˆط£ط±ط³ظ„ Pull Request!**

---

## ًں“گ ظ…ط¹ط§ظٹظٹط± ط§ظ„ظƒظˆط¯

```javascript
// âœ… طµط­: طھط¹ظ„ظٹظ‚ط§طھ ط¹ط±ط¨ظٹط© ظ„ظ„ظ…ظ†ط·ظ‚ ط§ظ„ظ…ظ‡ظ…
function injectConfig(config) {
  // ظ†ط­ظپط¸ ظ†ط³ط®ط© ط§ط­طھظٹط§ط·ظٹط© ظ‚ط¨ظ„ ط£ظٹ طھط¹ط¯ظٹظ„
  backupOriginal(configPath);
  // ...
}

// â‌Œ ط®ط·ط£: ظƒظˆط¯ ط¨ط¯ظˆظ† طھط¹ظ„ظٹظ‚ط§طھ ظ„ظ…ظ†ط·ظ‚ ظ…ط¹ظ‚ط¯
function x(c) { backup(p); modify(c); }
```

**ط§ظ„ظ‚ظˆط§ط¹ط¯:**
- ط§ط³طھط®ط¯ظ… `const` ظˆ `let` â€” ظ„ط§ `var`
- ط£ط¶ظپ JSDoc ظ„ظ„ط¯ظˆط§ظ„ ط§ظ„ط¹ط§ظ…ط©
- ظ„ط§ طھط±ظپط¹ ظ…ظ„ظپط§طھ `.env` ط£ظˆ ظ…ط³ط§ط±ط§طھ ظ…ط­ظ„ظٹط©
- ط§ط®طھط¨ط± ط¹ظ„ظ‰ Windows ظ‚ط¨ظ„ ط§ظ„ظ€ PR ط¥ظ† ط£ظ…ظƒظ†

---

## ًں”€ ط³ظٹط± ط§ظ„ط¹ظ…ظ„ (Workflow)

```
main â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–؛ (stable)
  â””â”€â”€ dev â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–؛ (integration)
        â”œâ”€â”€ feature/add-rpcs3-support
        â”œâ”€â”€ fix/voice-chat-echo
        â””â”€â”€ ui/ps5-theme-improvements
```

1. **Fork** â†’ **branch ظ…ظ† `dev`** â†’ **ظƒظˆط¯** â†’ **PR ط¥ظ„ظ‰ `dev`**
2. ط¨ط¹ط¯ ط§ظ„ظ…ط±ط§ط¬ط¹ط©طŒ `dev` طھظڈط¯ظ…ط¬ ظپظٹ `main` ظ…ط¹ ظƒظ„ Release

---

## ًںگ› ط§ظ„ط¥ط¨ظ„ط§ط؛ ط¹ظ† ط®ط·ط£

ط§ظپطھط­ Issue ط¬ط¯ظٹط¯ ظˆط§ظ…ظ„ط£ ظ‡ط°ط§ ط§ظ„ظ‚ط§ظ„ط¨:

```markdown
**ظˆطµظپ ط§ظ„ط®ط·ط£:**
[ظ…ط§ط°ط§ ظٹط­ط¯ط«طں]

**ط®ط·ظˆط§طھ ط¥ط¹ط§ط¯ط© ط§ظ„ط¥ظ†طھط§ط¬:**
1. ط§ظپطھط­ ط§ظ„طھط·ط¨ظٹظ‚
2. ط§ط®طھط± ظ…ط­ط§ظƒظٹ PCSX2
3. ط§ط¶ط؛ط· "ط§ط³طھط¶ط§ظپط© ط؛ط±ظپط©"
4. [ظ…ط§ط°ط§ ظٹط­ط¯ط«]

**ط§ظ„ظ…طھظˆظ‚ط¹:** [ظ…ط§ ط§ظ„ط°ظٹ ظƒط§ظ† ظٹط¬ط¨ ط£ظ† ظٹط­ط¯ط«]
**ط§ظ„ظ†ط¸ط§ظ…:** Windows 11 / Ubuntu 24 / macOS 14
**ط§ظ„ط¥طµط¯ط§ط±:** v1.2.0
**ط§ظ„ظ€ Logs:** (ظ…ظ† electron-log ط£ظˆ DevTools Console)
```

---

## ًں’¬ ظ„ظ„طھظˆط§طµظ„

- ًںگ› **Issues:** ظ„ظ„ط£ط®ط·ط§ط، ظˆط§ظ„ط§ظ‚طھط±ط§ط­ط§طھ
- ًں’¬ **Discussions:** ظ„ظ„ط£ط³ط¦ظ„ط© ط§ظ„ط¹ط§ظ…ط© ظˆط§ظ„ط£ظپظƒط§ط±
- ًں“§ **Email:** nexus@example.com

ط´ظƒط±ط§ظ‹ ظ„ظ…ط³ط§ظ‡ظ…طھظƒ! ًں™ڈًںژ®
