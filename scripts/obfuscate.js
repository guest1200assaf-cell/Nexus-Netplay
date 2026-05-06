// scripts/obfuscate.js
// يُشوّش كود الـ Main Process قبل البناء النهائي
// الاستخدام: node scripts/obfuscate.js

const JavaScriptObfuscator = require('javascript-obfuscator');
const fs   = require('fs');
const path = require('path');

// ── الإعدادات ──────────────────────────────────────────────
const OBFUSCATION_OPTIONS = {
  // مستوى الحماية: low | medium | high
  // high: بطيء جداً، medium: توازن جيد
  optionsPreset: 'medium-obfuscation',

  // إخفاء أسماء المتغيرات والدوال
  identifierNamesGenerator: 'hexadecimal',  // مثال: _0x3a7f

  // تشفير السلاسل النصية
  stringArrayEncoding: ['base64'],
  stringArray: true,
  stringArrayThreshold: 0.75,
  stringArrayRotate: true,
  stringArrayShuffle: true,

  // إضافة كود وهمي
  deadCodeInjection: true,
  deadCodeInjectionThreshold: 0.2,

  // إخفاء منطق التحكم
  controlFlowFlattening: true,
  controlFlowFlatteningThreshold: 0.5,

  // حماية ضد التحليل
  selfDefending: false,        // false لأن Electron بيئة Node وليست متصفح
  debugProtection: false,
  disableConsoleOutput: false,  // نبقي console للـ debug في dev

  // الإخراج
  sourceMap: false,
  compact: true,
  numbersToExpressions: true,
  simplify: true,
  splitStrings: true,
  splitStringsChunkLength: 10,
  transformObjectKeys: true,
  unicodeEscapeSequence: false,
};

// ── الملفات المستهدفة (Main Process فقط) ─────────────────
const TARGET_DIR   = path.join(__dirname, '..', 'src', 'main');
const OUTPUT_DIR   = path.join(__dirname, '..', 'src', 'main-obfuscated');

// ── ملفات يجب استثناؤها من التشويش ──────────────────────
const EXCLUDE_FILES = [
  'preload.js',   // يجب أن يبقى مقروءاً (contextBridge)
];

// ── دالة المعالجة ─────────────────────────────────────────
function obfuscateDirectory(inputDir, outputDir) {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const entries = fs.readdirSync(inputDir, { withFileTypes: true });

  for (const entry of entries) {
    const inputPath  = path.join(inputDir, entry.name);
    const outputPath = path.join(outputDir, entry.name);

    if (entry.isDirectory()) {
      obfuscateDirectory(inputPath, outputPath);
      continue;
    }

    if (!entry.name.endsWith('.js')) {
      // انسخ الملفات غير JS كما هي
      fs.copyFileSync(inputPath, outputPath);
      continue;
    }

    if (EXCLUDE_FILES.includes(entry.name)) {
      console.log(`[⏭] Skip (excluded): ${entry.name}`);
      fs.copyFileSync(inputPath, outputPath);
      continue;
    }

    try {
      const code      = fs.readFileSync(inputPath, 'utf-8');
      const obfResult = JavaScriptObfuscator.obfuscate(code, OBFUSCATION_OPTIONS);
      fs.writeFileSync(outputPath, obfResult.getObfuscatedCode(), 'utf-8');

      const originalSize   = Buffer.byteLength(code, 'utf-8');
      const obfuscatedSize = Buffer.byteLength(obfResult.getObfuscatedCode(), 'utf-8');
      const ratio          = ((obfuscatedSize / originalSize) * 100).toFixed(0);

      console.log(`[✅] ${entry.name.padEnd(40)} ${formatBytes(originalSize).padStart(8)} → ${formatBytes(obfuscatedSize).padStart(8)} (${ratio}%)`);
    } catch (err) {
      console.error(`[❌] ${entry.name}: ${err.message}`);
    }
  }
}

function formatBytes(b) {
  return b < 1024 ? `${b}B` : b < 1048576 ? `${(b/1024).toFixed(1)}KB` : `${(b/1048576).toFixed(1)}MB`;
}

// ── تشغيل ─────────────────────────────────────────────────
console.log('🔐 بدء تشويش الكود...\n');
console.log('المصدر:', TARGET_DIR);
console.log('الإخراج:', OUTPUT_DIR);
console.log('─'.repeat(70));

obfuscateDirectory(TARGET_DIR, OUTPUT_DIR);

console.log('─'.repeat(70));
console.log('✅ اكتمل التشويش! الملفات في:', OUTPUT_DIR);
console.log('\n⚠️  تأكد من تعديل electron-builder.yml ليستخدم main-obfuscated/ بدل main/');
