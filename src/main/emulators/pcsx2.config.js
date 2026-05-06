// src/main/emulators/pcsx2.config.js
const fs   = require('fs');
const path = require('path');
const os   = require('os');
const { spawn } = require('child_process');

function getPCSX2ConfigPath(custom = null) {
  if (custom) return custom;
  const home = os.homedir();
  const candidates = {
    win32:  [path.join(process.env.APPDATA||'','PCSX2','inis','PCSX2.ini')],
    linux:  [path.join(home,'.config','PCSX2','inis','PCSX2.ini')],
    darwin: [path.join(home,'Library','Application Support','PCSX2','inis','PCSX2.ini')],
  };
  const list = candidates[process.platform] || candidates.linux;
  return list.find(p => fs.existsSync(p)) || list[0];
}

function parseINI(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const result = {};
  let section = '__global__';
  for (const raw of fs.readFileSync(filePath,'utf-8').split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith(';') || line.startsWith('#')) continue;
    const sec = line.match(/^\[(.+)\]$/);
    if (sec) { section = sec[1]; result[section] = result[section]||{}; continue; }
    const kv = line.match(/^([^=]+)=(.*)$/);
    if (kv) {
      if (!result[section]) result[section] = {};
      result[section][kv[1].trim()] = kv[2].trim();
    }
  }
  return result;
}

function serializeINI(parsed) {
  let out = '';
  for (const [sec, pairs] of Object.entries(parsed)) {
    if (sec !== '__global__') out += `[${sec}]\n`;
    for (const [k,v] of Object.entries(pairs)) out += `${k} = ${v}\n`;
    out += '\n';
  }
  return out;
}

function injectPCSX2NetworkConfig({ hostIP, port, isHost }, customPath = null) {
  const configPath = getPCSX2ConfigPath(customPath);
  const dev9Path   = path.join(path.dirname(configPath), 'DEV9.ini');

  for (const p of [configPath, dev9Path]) {
    if (!fs.existsSync(p)) continue;
    const ini = parseINI(p);
    if (!ini['DEV9']) ini['DEV9'] = {};
    ini['DEV9']['EthEnable']    = '1';
    ini['DEV9']['HostIP']       = hostIP;
    ini['DEV9']['HostPort']     = String(port);
    if (!isHost) ini['DEV9']['RemoteHostIP'] = hostIP;

    const backup = p + '.nexus-backup';
    if (!fs.existsSync(backup)) fs.copyFileSync(p, backup);
    fs.writeFileSync(p, serializeINI(ini), 'utf-8');
    console.log(`[PCSX2] ✅ ${p}`);
  }
  return { success: true, configPath };
}

function restorePCSX2Config(customPath = null) {
  const configPath = getPCSX2ConfigPath(customPath);
  const backup = configPath + '.nexus-backup';
  if (fs.existsSync(backup)) {
    fs.copyFileSync(backup, configPath);
    fs.unlinkSync(backup);
    return { success: true };
  }
  return { success: false };
}

function launchPCSX2(executablePath, isoPath = null, onExit = () => {}) {
  const args = isoPath ? ['--elf', isoPath] : [];
  const proc = spawn(executablePath, args, { detached: true, stdio: 'ignore' });
  proc.unref();
  proc.on('close', code => { restorePCSX2Config(); onExit(code); });
  proc.on('error', err => console.error('[PCSX2]', err.message));
  return proc.pid;
}

module.exports = { injectPCSX2NetworkConfig, restorePCSX2Config, launchPCSX2 };
