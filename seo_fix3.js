/**
 * FieldZenPro — SEO Fix Pass 3
 * Fixes the remaining mojibake that appears as literal Unicode sequences
 * (Latin Extended characters that look like ðŸ"… etc.)
 */

const fs = require('fs');
const path = require('path');
const PUBLIC_DIR = path.join(__dirname, 'frontend', 'public');

// These are the actual strings that appear in the file as individual chars
// Each "ð" is U+00F0, "Ÿ" is U+009F, etc. — UTF-8 bytes interpreted as Latin-1
const EMOJI_MAP = [
  // ðŸ'° = 💰
  ['\u00f0\u009f\u0092\u00b0', '\uD83D\uDCB0'],
  // ðŸ"… = 📅
  ['\u00f0\u009f\u0094\u0085', '\uD83D\uDCC5'],
  // ðŸ"‹ = 📋
  ['\u00f0\u009f\u0094\u008b', '\uD83D\uDCCB'],
  // ðŸ" = 🔍
  ['\u00f0\u009f\u0094\u008d', '\uD83D\uDD0D'],
  // ðŸ"§ = 📧 (envelope)
  ['\u00f0\u009f\u0094\u00a7', '\uD83D\uDD27'],
  // â±ï¸ = ⏱️
  ['\u00e2\u00b1\u00ef\u00b8\u008f', '\u23F1\uFE0F'],
  ['\u00e2\u00b1\u00ef\u00b8', '\u23F1\uFE0F'],
  // âœï¸ = ✍️
  ['\u00e2\u009c\u008d\u00ef\u00b8\u008f', '\u270D\uFE0F'],
  ['\u00e2\u009c\u008d\u00ef\u00b8', '\u270D\uFE0F'],
  // ðŸ'¸ = 💸
  ['\u00f0\u009f\u0092\u00b8', '\uD83D\uDCB8'],
  // ðŸ'» = 👻
  ['\u00f0\u009f\u0091\u00bb', '\uD83D\uDC7B'],
  // ðŸ¤· = 🤷
  ['\u00f0\u009f\u00a4\u00b7', '\uD83E\uDD37'],
  // ðŸ"¸ = 📸
  ['\u00f0\u009f\u0094\u00b8', '\uD83D\uDCF8'],
  // ðŸ"„ = 📄
  ['\u00f0\u009f\u0094\u0084', '\uD83D\uDCC4'],
  // ðŸ"¦ = 📦
  ['\u00f0\u009f\u0094\u00a6', '\uD83D\uDCE6'],
  // ðŸ§¾ = 🧾
  ['\u00f0\u009f\u00a7\u00be', '\uD83E\uDDFE'],
  // ðŸ'³ = 💳
  ['\u00f0\u009f\u0092\u00b3', '\uD83D\uDCB3'],
  // ðŸ'¥ = 👥
  ['\u00f0\u009f\u0091\u00a5', '\uD83D\uDC65'],
  // ðŸ"Š = 📊
  ['\u00f0\u009f\u0094\u008a', '\uD83D\uDCCA'],
  // ðŸ¢ = 🏢
  ['\u00f0\u009f\u008f\u00a2', '\uD83C\uDFE2'],
  // ðŸ"¥ = 🔥
  ['\u00f0\u009f\u0094\u00a5', '\uD83D\uDD25'],
  // ðŸ† = 🏆
  ['\u00f0\u009f\u008f\u0086', '\uD83C\uDFC6'],
  // ðŸ'¥ = 💥
  ['\u00f0\u009f\u0092\u00a5', '\uD83D\uDCA5'],
  // ðŸ—ï¸ = 🏗️
  ['\u00f0\u009f\u008f\u0097\u00ef\u00b8\u008f', '\uD83C\uDFD7\uFE0F'],
  ['\u00f0\u009f\u008f\u0097\u00ef\u00b8', '\uD83C\uDFD7\uFE0F'],
  // ðŸ›¡ï¸ = 🛡️
  ['\u00f0\u009f\u009b\u00a1\u00ef\u00b8\u008f', '\uD83D\uDEE1\uFE0F'],
  ['\u00f0\u009f\u009b\u00a1\u00ef\u00b8', '\uD83D\uDEE1\uFE0F'],
  // â„ï¸ or âï¸ = ❄️
  ['\u00e2\u009d\u0084\u00ef\u00b8\u008f', '\u2744\uFE0F'],
  ['\u00e2\u009d\u0084\u00ef\u00b8', '\u2744\uFE0F'],
  // â° = ⏰
  ['\u00e2\u008f\u00b0', '\u23F0'],
  // â˜… = ★
  ['\u00e2\u02dc\u2026', '\u2605'],
  ['\u00e2\u02dc\u00a5', '\u2605'],
  // ðŸ" = 🔑
  ['\u00f0\u009f\u0094\u0091', '\uD83D\uDD11'],
  // ðŸ"œ = 📜
  ['\u00f0\u009f\u0094\u009c', '\uD83D\uDCDC'],
  // ðŸ'¡ = 💡
  ['\u00f0\u009f\u0092\u00a1', '\uD83D\uDCA1'],
  // ðŸŽ¯ = 🎯
  ['\u00f0\u009f\u008e\u00af', '\uD83C\uDFAF'],
  // ðŸš€ = 🚀
  ['\u00f0\u009f\u009a\u0080', '\uD83D\uDE80'],
  // ðŸŒ = 🌐
  ['\u00f0\u009f\u008c\u0090', '\uD83C\uDF10'],
  // ðŸ¤ = 🤝
  ['\u00f0\u009f\u00a4\u009d', '\uD83E\uDD1D'],
  // ðŸ'‰ = 👉
  ['\u00f0\u009f\u0091\u0089', '\uD83D\uDC49'],
  // ðŸ' = 👍
  ['\u00f0\u009f\u0091\u008d', '\uD83D\uDC4D'],
  // ðŸ"  = 📝
  ['\u00f0\u009f\u0094\u00a0', '\uD83D\uDCDD'],
  // ðŸ­ = 🏭
  ['\u00f0\u009f\u00af\u00ad', '\uD83C\uDFED'],
  // ðŸŒŸ = 🌟
  ['\u00f0\u009f\u008c\u009f', '\uD83C\uDF1F'],
];

let totalModified = 0;
const files = fs.readdirSync(PUBLIC_DIR).filter(f => f.endsWith('.html'));

files.forEach(filename => {
  const filePath = path.join(PUBLIC_DIR, filename);
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  EMOJI_MAP.forEach(([broken, fixed]) => {
    if (content.includes(broken)) {
      // Replace all occurrences using split/join for literal string replacement
      const parts = content.split(broken);
      if (parts.length > 1) {
        content = parts.join(fixed);
        changed = true;
      }
    }
  });

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    totalModified++;
    process.stdout.write('.');
  }
});

console.log('\nDone! Fixed emoji in ' + totalModified + ' files.');
