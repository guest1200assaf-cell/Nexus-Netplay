// ─── PPSSPP Config Injection ─────────────────────────────────────────────────
const fs   = require('fs');
const path = require('path');
const os   = require('os');
const { spawn } = require('child_process');

function getPPSSPPConfigPath() {
  const home = os.homedir();
  const defaults = {
    win32:  [path.join(process.env.APPDATA || '', 'PPSSPP', 'PSP', 'SYSTEM', 'ppsspp.ini')],
    linux:  [path.join(home, '.config', 'ppsspp', 'PSP', 'SYSTEM', 'ppsspp.ini')],
    darwin: [path.join(home, 'Library', 'Application Support', 'PPSSPP', 'PSP', 'SYSTEM', 'ppsspp.ini')],
  };
  const list = defaults[process.platform] || defaults.linux;
  return list.find(p => fs.existsSync(p)) || list[0];
}

function injectPPSSPPNetworkConfig(networkConfig) {
  const { hostIP, port } = networkConfig;
  const configPath = getPPSSPPConfigPath();

  if (!fs.existsSync(configPath)) {
    console.warn('[PPSSPP] Config file not found at', configPath);
    return { success: false, reason: 'Config not found' };
  }

  let content = fs.readFileSync(configPath, 'utf-8');

  // Patch or add [Network] section
  const networkSection = `\n[Network]\nProAdhocServer = ${hostIP}\nPortOffset = ${port}\nEnableWlan = True\n`;
  if (content.includes('[Network]')) {
    content = content.replace(/\[Network\][^\[]*/s, networkSection);
  } else {
    content += networkSection;
  }

  const backup = configPath + '.nexus-backup';
  if (!fs.existsSync(backup)) fs.copyFileSync(configPath, backup);
  fs.writeFileSync(configPath, content, 'utf-8');
  console.log('[PPSSPP] ✅ Network config injected');
  return { success: true, configPath };
}

function restorePPSSPPConfig() {
  const configPath = getPPSSPPConfigPath();
  const backup = configPath + '.nexus-backup';
  if (fs.existsSync(backup)) {
    fs.copyFileSync(backup, configPath);
    fs.unlinkSync(backup);
    console.log('[PPSSPP] 🔄 Config restored');
    return { success: true };
  }
  return { success: false };
}

function launchPPSSPP(executablePath, isoPath = null, onExit = () => {}) {
  const args = isoPath ? [isoPath] : [];
  console.log(`[PPSSPP] 🚀 ${executablePath} ${args.join(' ')}`);

  const proc = spawn(executablePath, args, { detached: true, stdio: 'ignore' });
  proc.unref();
  proc.on('close', (code) => { restorePPSSPPConfig(); onExit(code); });
  proc.on('error', (err)  => console.error('[PPSSPP] ❌', err.message));
  return proc.pid;
}

module.exports = { injectPPSSPPNetworkConfig, restorePPSSPPConfig, launchPPSSPP, getPPSSPPConfigPath };
