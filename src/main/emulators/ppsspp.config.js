// src/main/emulators/ppsspp.config.jsconst fs   = require('fs');
const path = require('path');
const os   = require('os');
const { spawn } = require('child_process');

function getPPSSPPConfigPath() {
  const home = os.homedir();
  const candidates = {
    win32:  [path.join(process.env.APPDATA||'','PPSSPP','memstick','PSP','SYSTEM','ppsspp.ini')],
    linux:  [path.join(home,'.config','ppsspp','PSP','SYSTEM','ppsspp.ini')],
    darwin: [path.join(home,'Library','Application Support','PPSSPP','PSP','SYSTEM','ppsspp.ini')],
  };
  const list = candidates[process.platform] || candidates.linux;
  return list.find(p => fs.existsSync(p)) || list[0];
}

function injectPPSSPPNetplayConfig({ hostIP, port, isHost }) {
  const configPath = getPPSSPPConfigPath();
  if (!fs.existsSync(configPath)) return { success: false, reason: 'Config not found' };

  let content = fs.readFileSync(configPath, 'utf-8');
  const backup = configPath + '.nexus-backup';
  if (!fs.existsSync(backup)) fs.copyFileSync(configPath, backup);

  const set = (key, value) => {
    const re = new RegExp(`^${key}\\s*=.*$`, 'm');
    if (re.test(content)) content = content.replace(re, `${key} = ${value}`);
    else content += `\n${key} = ${value}\n`;
  };

  // PPSSPP uses [Network] section
  set('EnableWlan',       'True');
  set('proAdhocServer',   hostIP);
  set('PortOffset',       String(port));
  set('EnableUPnP',       'True');

  fs.writeFileSync(configPath, content, 'utf-8');
  console.log('[PPSSPP] ✅ Config injected');
  return { success: true };
}

function restorePPSSPPConfig() {
  const p = getPPSSPPConfigPath();
  const b = p + '.nexus-backup';
  if (fs.existsSync(b)) { fs.copyFileSync(b,p); fs.unlinkSync(b); return { success:true }; }
  return { success:false };}

function launchPPSSPP(executablePath, isoPath = null, onExit = () => {}) {
  const args = isoPath ? [isoPath] : [];
  const proc = spawn(executablePath, args, { detached:true, stdio:'ignore' });
  proc.unref();
  proc.on('close', code => { restorePPSSPPConfig(); onExit(code); });
  return proc.pid;
}

module.exports = { injectPPSSPPNetplayConfig, restorePPSSPPConfig, launchPPSSPP };