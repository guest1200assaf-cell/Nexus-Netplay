<<<<<<< HEAD
// src/main/emulators/pcsx2.config.js
=======
// ─── PCSX2 Config Injection ──────────────────────────────────────────────────
>>>>>>> f2a15ce2b0ec8fe19827c78a926291a93c7a800e
const fs   = require('fs');
const path = require('path');
const os   = require('os');
const { spawn } = require('child_process');

<<<<<<< HEAD
function getPCSX2ConfigPath(custom = null) {
  if (custom) return custom;
  const home = os.homedir();
  const candidates = {
    win32:  [path.join(process.env.APPDATA||'','PCSX2','inis','PCSX2.ini')],
    linux:  [path.join(home,'.config','PCSX2','inis','PCSX2.ini')],
    darwin: [path.join(home,'Library','Application Support','PCSX2','inis','PCSX2.ini')],
  };
  const list = candidates[process.platform] || candidates.linux;
=======
function getPCSX2ConfigPath(customPath = null) {
  if (customPath) return customPath;
  const home = os.homedir();
  const defaults = {
    win32: [
      path.join(process.env.APPDATA || '', 'PCSX2', 'inis', 'PCSX2.ini'),
      path.join(process.env.APPDATA || '', 'PCSX2', 'inis', 'DEV9.ini'),
      'C:\\Program Files\\PCSX2\\inis\\PCSX2.ini',
    ],
    linux:  [path.join(home, '.config', 'PCSX2', 'inis', 'PCSX2.ini')],
    darwin: [path.join(home, 'Library', 'Application Support', 'PCSX2', 'inis', 'PCSX2.ini')],
  };
  const list = defaults[process.platform] || defaults.linux;
>>>>>>> f2a15ce2b0ec8fe19827c78a926291a93c7a800e
  return list.find(p => fs.existsSync(p)) || list[0];
}

function parseINI(filePath) {
  if (!fs.existsSync(filePath)) return {};
<<<<<<< HEAD
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
=======
  const content = fs.readFileSync(filePath, 'utf-8');
  const result  = {};
  let section   = '__global__';

  for (const rawLine of content.split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith(';') || line.startsWith('#')) continue;

    const secMatch = line.match(/^\[(.+)\]$/);
    if (secMatch) { section = secMatch[1]; result[section] = result[section] || {}; continue; }

    const kvMatch = line.match(/^([^=]+)=(.*)$/);
    if (kvMatch) {
      if (!result[section]) result[section] = {};
      result[section][kvMatch[1].trim()] = kvMatch[2].trim();
>>>>>>> f2a15ce2b0ec8fe19827c78a926291a93c7a800e
    }
  }
  return result;
}

function serializeINI(parsed) {
  let out = '';
<<<<<<< HEAD
  for (const [sec, pairs] of Object.entries(parsed)) {
    if (sec !== '__global__') out += `[${sec}]\n`;
    for (const [k,v] of Object.entries(pairs)) out += `${k} = ${v}\n`;
    out += '\n';
=======
  for (const [section, pairs] of Object.entries(parsed)) {
    if (section === '__global__') {
      for (const [k, v] of Object.entries(pairs)) out += `${k} = ${v}\n`;
      out += '\n';
    } else {
      out += `[${section}]\n`;
      for (const [k, v] of Object.entries(pairs)) out += `${k} = ${v}\n`;
      out += '\n';
    }
>>>>>>> f2a15ce2b0ec8fe19827c78a926291a93c7a800e
  }
  return out;
}

<<<<<<< HEAD
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
=======
function injectPCSX2NetworkConfig(networkConfig, customConfigPath = null) {
  const { hostIP, port, isHost } = networkConfig;
  const configPath = getPCSX2ConfigPath(customConfigPath);
  const configDir  = path.dirname(configPath);
  const dev9Path   = path.join(configDir, 'DEV9.ini');

  if (fs.existsSync(configPath)) {
    const ini = parseINI(configPath);
    if (!ini['DEV9']) ini['DEV9'] = {};
    ini['DEV9']['EthEnable']      = '1';
    ini['DEV9']['EthApi']         = 'tap';
    ini['DEV9']['HostIP']         = hostIP;
    ini['DEV9']['HostPort']       = String(port);
    if (!isHost) {
      ini['DEV9']['RemoteHostIP'] = hostIP;
      ini['DEV9']['RemotePort']   = String(port);
    }

    const backup = configPath + '.nexus-backup';
    if (!fs.existsSync(backup)) fs.copyFileSync(configPath, backup);
    fs.writeFileSync(configPath, serializeINI(ini), 'utf-8');
    console.log(`[PCSX2] ✅ ${configPath} updated`);
  }

  if (fs.existsSync(dev9Path)) {
    const d = parseINI(dev9Path);
    if (!d['DEV9']) d['DEV9'] = {};
    d['DEV9']['HostIP']   = hostIP;
    d['DEV9']['HostPort'] = String(port);
    fs.writeFileSync(dev9Path, serializeINI(d), 'utf-8');
    console.log('[PCSX2] ✅ DEV9.ini updated');
  }

  return { success: true, configPath };
}

function restorePCSX2Config(customConfigPath = null) {
  const configPath = getPCSX2ConfigPath(customConfigPath);
  const backup     = configPath + '.nexus-backup';
  if (fs.existsSync(backup)) {
    fs.copyFileSync(backup, configPath);
    fs.unlinkSync(backup);
    console.log('[PCSX2] 🔄 Config restored');
    return { success: true };
  }
  return { success: false, reason: 'No backup found' };
}

function launchPCSX2(executablePath, isoPath = null, onExit = () => {}) {
  const args = [];
  if (isoPath) args.push('--elf', isoPath);
  console.log(`[PCSX2] 🚀 ${executablePath} ${args.join(' ')}`);

  const proc = spawn(executablePath, args, { detached: true, stdio: 'ignore' });
  proc.unref();
  proc.on('close', (code) => { restorePCSX2Config(); onExit(code); });
  proc.on('error', (err)  => console.error('[PCSX2] ❌', err.message));
  return proc.pid;
}

module.exports = { injectPCSX2NetworkConfig, restorePCSX2Config, launchPCSX2, getPCSX2ConfigPath };
>>>>>>> f2a15ce2b0ec8fe19827c78a926291a93c7a800e
