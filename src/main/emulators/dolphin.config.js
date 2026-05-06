<<<<<<< HEAD
// src/main/emulators/dolphin.config.js
=======
// ─── Dolphin Config Injection ────────────────────────────────────────────────
>>>>>>> f2a15ce2b0ec8fe19827c78a926291a93c7a800e
const fs   = require('fs');
const path = require('path');
const os   = require('os');
const { spawn } = require('child_process');

function getDolphinConfigPath() {
  const home = os.homedir();
<<<<<<< HEAD
  const candidates = {
    win32:  [path.join(process.env.APPDATA||'','Dolphin Emulator','Config','Dolphin.ini')],
    linux:  [path.join(home,'.config','dolphin-emu','Dolphin.ini')],
    darwin: [path.join(home,'Library','Application Support','Dolphin','Config','Dolphin.ini')],
  };
  const list = candidates[process.platform] || candidates.linux;
  return list.find(p => fs.existsSync(p)) || list[0];
}

function injectDolphinNetplayConfig({ hostIP, port, isHost, nickname = 'Player' }) {
  const configPath = getDolphinConfigPath();
  if (!fs.existsSync(configPath)) return { success: false, reason: 'Config not found' };

  const content = fs.readFileSync(configPath, 'utf-8');
  const backup  = configPath + '.nexus-backup';
  if (!fs.existsSync(backup)) fs.copyFileSync(configPath, backup);

  // Dolphin يستخدم قسم [NetPlay]
  let updated = content;
  const set = (key, value) => {
    const re = new RegExp(`^${key}\\s*=.*$`, 'm');
    if (re.test(updated)) updated = updated.replace(re, `${key} = ${value}`);
    else updated += `\n[NetPlay]\n${key} = ${value}`;
  };

  set('NickName',      nickname);
  set('HostCode',      isHost ? '' : hostIP);
  set('ConnectPort',   String(port));
  set('HostPort',      String(port));
  set('TraversalPort', String(port));

  fs.writeFileSync(configPath, updated, 'utf-8');
  console.log('[Dolphin] ✅ Config injected');
  return { success: true };
}

function restoreDolphinConfig() {
  const p = getDolphinConfigPath();
  const b = p + '.nexus-backup';
  if (fs.existsSync(b)) { fs.copyFileSync(b,p); fs.unlinkSync(b); return { success:true }; }
  return { success:false };
}

function launchDolphin(executablePath, gameFile = null, onExit = () => {}) {
  const args = gameFile ? ['-e', gameFile] : [];
  const proc = spawn(executablePath, args, { detached:true, stdio:'ignore' });
  proc.unref();
  proc.on('close', code => { restoreDolphinConfig(); onExit(code); });
  return proc.pid;
}

module.exports = { injectDolphinNetplayConfig, restoreDolphinConfig, launchDolphin };
=======
  const defaults = {
    win32:  [path.join(process.env.APPDATA || '', 'Dolphin Emulator', 'Config', 'Dolphin.ini')],
    linux:  [path.join(home, '.config', 'dolphin-emu', 'Dolphin.ini')],
    darwin: [path.join(home, 'Library', 'Application Support', 'Dolphin', 'Config', 'Dolphin.ini')],
  };
  const list = defaults[process.platform] || defaults.linux;
  return list.find(p => fs.existsSync(p)) || list[0];
}

function injectDolphinNetplayConfig(networkConfig) {
  const { hostIP, port, isHost, traversalCode } = networkConfig;
  const configPath = getDolphinConfigPath();
  console.log(`[Dolphin] Injecting netplay config → ${configPath}`);

  // Dolphin uses its own Netplay UI, but we can pre-configure via INI
  // In practice, Dolphin netplay is started programmatically via CLI args
  const args = isHost
    ? ['--exec', networkConfig.isoPath || '', `--netplay-host-code=${traversalCode || ''}`, `--netplay-port=${port}`]
    : ['--exec', networkConfig.isoPath || '', `--netplay-connect=${hostIP}`, `--netplay-port=${port}`];

  return { success: true, args };
}

function launchDolphin(executablePath, networkConfig = {}, onExit = () => {}) {
  const { args } = injectDolphinNetplayConfig(networkConfig);
  const filtered = args.filter(Boolean);
  console.log(`[Dolphin] 🚀 ${executablePath} ${filtered.join(' ')}`);

  const proc = spawn(executablePath, filtered, { detached: true, stdio: 'ignore' });
  proc.unref();
  proc.on('close', (code) => { console.log(`[Dolphin] ⛔ exit ${code}`); onExit(code); });
  proc.on('error', (err)  => console.error('[Dolphin] ❌', err.message));
  return proc.pid;
}

module.exports = { injectDolphinNetplayConfig, launchDolphin, getDolphinConfigPath };
>>>>>>> f2a15ce2b0ec8fe19827c78a926291a93c7a800e
