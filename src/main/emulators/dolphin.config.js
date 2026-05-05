// ─── Dolphin Config Injection ────────────────────────────────────────────────
const fs   = require('fs');
const path = require('path');
const os   = require('os');
const { spawn } = require('child_process');

function getDolphinConfigPath() {
  const home = os.homedir();
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
