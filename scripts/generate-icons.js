// scripts/generate-icons.js
// يولّد جميع أحجام الأيقونات من صورة PNG واحدة بدقة 1024×1024
// متطلبات: npm install sharp --save-dev

/**
 * ═══════════════════════════════════════════════════════════
 *  دليل الأيقونات المطلوبة لكل منصة
 * ═══════════════════════════════════════════════════════════
 *
 *  WINDOWS (.ico) — يحتوي على طبقات متعددة:
 *    16×16, 24×24, 32×32, 48×48, 64×64, 128×128, 256×256
 *
 *  LINUX (PNG مجلد):
 *    16×16, 24×24, 32×32, 48×48, 64×64, 96×96,
 *    128×128, 256×256, 512×512
 *
 *  macOS (.icns) — طبقات:
 *    16×16, 32×32, 64×64, 128×128, 256×256, 512×512, 1024×1024
 *
 *  المطلوب منك: ضع ملف icon-source.png (1024×1024) في assets/icons/
 * ═══════════════════════════════════════════════════════════
 */

const sharp  = require('sharp');
const fs     = require('fs');
const path   = require('path');

const SOURCE = path.join(__dirname, '..', 'assets', 'icons', 'icon-source.png');
const OUTDIR = path.join(__dirname, '..', 'assets', 'icons');

const SIZES = [16, 24, 32, 48, 64, 96, 128, 256, 512, 1024];

async function generatePNGs() {
  if (!fs.existsSync(SOURCE)) {
    console.error('❌ لم يُعثر على الملف المصدر:', SOURCE);
    console.log('ضع صورة PNG بدقة 1024×1024 في assets/icons/icon-source.png');
    return;
  }

  console.log('🎨 توليد الأيقونات...\n');

  for (const size of SIZES) {
    const outPath = path.join(OUTDIR, `${size}x${size}.png`);
    await sharp(SOURCE)
      .resize(size, size, { fit: 'contain', background: { r:0, g:0, b:0, alpha:0 } })
      .png()
      .toFile(outPath);
    console.log(`  ✅ ${size}×${size} → ${path.basename(outPath)}`);
  }

  // نسخة icon.png للمرجع العام
  await sharp(SOURCE).resize(512, 512).png()
    .toFile(path.join(OUTDIR, 'icon.png'));

  console.log('\n📌 الخطوات التالية:');
  console.log('  • Windows: حوّل الـ PNGs إلى ICO باستخدام: https://icoconvert.com');
  console.log('             أو: npm install png-to-ico -g && png-to-ico 256x256.png > icon.ico');
  console.log('  • macOS:   استخدم iconutil (macOS فقط) أو: npm install icns -g');
  console.log('  • Linux:   ضع مجلد الـ PNGs في assets/icons/ مباشرة');
}

generatePNGs().catch(console.error);

/*
 ═══════════════════════════════════════════════════════════
  ربط الأيقونات في electron-builder.yml:
 ═══════════════════════════════════════════════════════════

  win:
    icon: assets/icons/icon.ico       ← ملف ICO متعدد الأحجام

  linux:
    icon: assets/icons/               ← مجلد PNG (electron-builder يختار الأنسب)

  mac:
    icon: assets/icons/icon.icns      ← ملف ICNS

 ═══════════════════════════════════════════════════════════
  ربط الأيقونة في main.js (للـ Taskbar & Tray):
 ═══════════════════════════════════════════════════════════

  const win = new BrowserWindow({
    icon: path.join(__dirname, '../../assets/icons/icon.png'),
    ...
  });

  // أو للـ System Tray:
  const { Tray } = require('electron');
  const tray = new Tray(path.join(__dirname, '../../assets/icons/16x16.png'));
  tray.setToolTip('Nexus Netplay Hub');

*/
