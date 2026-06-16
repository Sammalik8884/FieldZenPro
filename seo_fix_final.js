/**
 * FieldZenPro — SEO Fix Final Pass
 * Scans ALL files for ANY remaining broken emoji sequences
 * and fixes them using the exact codepoint map
 */

const fs = require('fs');
const path = require('path');
const PUBLIC_DIR = path.join(__dirname, 'frontend', 'public');

// Complete map discovered through debugging
const EMOJI_MAP = [
  // Calendar 📅  f0 178 201c 2026
  ['\u00f0\u0178\u201c\u2026', '📅'],
  // Money bag 💰  f0 178 2019 b0
  ['\u00f0\u0178\u2019\u00b0', '💰'],
  // Clipboard 📋  f0 178 201c 2039
  ['\u00f0\u0178\u201c\u2039', '📋'],
  // Magnifying glass/search 🔍  f0 178 201c 9d (memo 📝 alternative)
  ['\u00f0\u0178\u201c\u009d', '📝'],
  // Envelope 📧  f0 178 201c a7
  ['\u00f0\u0178\u201c\u00a7', '📧'],
  // Package 📦  f0 178 201c a6
  ['\u00f0\u0178\u201c\u00a6', '📦'],
  // Document 📄  f0 178 201c 201e
  ['\u00f0\u0178\u201c\u201e', '📄'],
  // Money with wings 💸  f0 178 2019 b8
  ['\u00f0\u0178\u2019\u00b8', '💸'],
  // Ghost 👻  f0 178 2018 bb
  ['\u00f0\u0178\u2018\u00bb', '👻'],
  // Shrug 🤷  f0 178 a4 b7
  ['\u00f0\u0178\u00a4\u00b7', '🤷'],
  // Camera 📸  f0 178 201d b8
  ['\u00f0\u0178\u201d\u00b8', '📸'],
  // Receipt 🧾  f0 178 a7 be
  ['\u00f0\u0178\u00a7\u00be', '🧾'],
  // Credit card 💳  f0 178 2019 b3
  ['\u00f0\u0178\u2019\u00b3', '💳'],
  // Group of people 👥  f0 178 2018 a5
  ['\u00f0\u0178\u2018\u00a5', '👥'],
  // Bar chart 📊  f0 178 201c 8a  (or 201c 2022)
  ['\u00f0\u0178\u201c\u008a', '📊'],
  ['\u00f0\u0178\u201c\u2022', '📊'],
  // Office building 🏢  f0 178 8f a2
  ['\u00f0\u0178\u008f\u00a2', '🏢'],
  // Fire 🔥  f0 178 201d a5
  ['\u00f0\u0178\u201d\u00a5', '🔥'],
  ['\u00f0\u0178\u201c\u00a5', '🔥'],
  // Trophy 🏆  f0 178 8f 86
  ['\u00f0\u0178\u008f\u0086', '🏆'],
  // Construction 🏗️  f0 178 8f 2014
  ['\u00f0\u0178\u008f\u2014\u00ef\u00b8\u008f', '🏗️'],
  ['\u00f0\u0178\u008f\u2014', '🏗️'],
  // Shield 🛡️
  ['\u00f0\u0178\u009b\u00a1\u00ef\u00b8\u008f', '🛡️'],
  ['\u00f0\u0178\u009b\u00a1', '🛡️'],
  // Light bulb 💡  f0 178 2019 a1
  ['\u00f0\u0178\u2019\u00a1', '💡'],
  // Target 🎯  f0 178 8e af
  ['\u00f0\u0178\u008e\u00af', '🎯'],
  // Rocket 🚀  f0 178 9a 80
  ['\u00f0\u0178\u009a\u0080', '🚀'],
  // Globe 🌐  f0 178 8c 90
  ['\u00f0\u0178\u008c\u0090', '🌐'],
  // Handshake 🤝  f0 178 a4 9d
  ['\u00f0\u0178\u00a4\u009d', '🤝'],
  // Pointing right 👉  f0 178 2018 89
  ['\u00f0\u0178\u2018\u0089', '👉'],
  // Thumbs up 👍  f0 178 2018 8d
  ['\u00f0\u0178\u2018\u008d', '👍'],
  // Factory 🏭  f0 178 af ad
  ['\u00f0\u0178\u00af\u00ad', '🏭'],
  // Glowing star 🌟  f0 178 8c 9f
  ['\u00f0\u0178\u008c\u009f', '🌟'],
  // Key 🔑  f0 178 201d 2018 or 201c 91
  ['\u00f0\u0178\u201d\u2018', '🔑'],
  ['\u00f0\u0178\u201c\u0091', '🔑'],
  // Wrench 🔧  f0 178 201d a7
  ['\u00f0\u0178\u201d\u00a7', '🔧'],
  // House 🏠  f0 178 8f a0
  ['\u00f0\u0178\u008f\u00a0', '🏠'],
  // Snowflake ❄️
  ['\u00e2\u009d\u0084\u00ef\u00b8\u008f', '❄️'],
  ['\u00e2\u009d\u0084\u00ef\u00b8', '❄️'],
  // Timer ⏱️
  ['\u00e2\u00b1\u00ef\u00b8\u008f', '⏱️'],
  ['\u00e2\u00b1\u00ef\u00b8', '⏱️'],
  // Writing hand ✍️
  ['\u00e2\u009c\u008d\u00ef\u00b8\u008f', '✍️'],
  ['\u00e2\u009c\u008d\u00ef\u00b8', '✍️'],
  ['\u00e2\u009c\u008d', '✍️'],
  // Alarm clock ⏰
  ['\u00e2\u008f\u00b0', '⏰'],
  // Star ★
  ['\u00e2\u02dc\u2026', '★'],
  ['\u00e2\u02dc\u00a5', '★'],
  // X mark ❌
  ['\u00e2\u0152', '❌'],
  // Check ✅
  ['\u00e2\u009c\u2026', '✅'],
  // Up arrow ↑
  ['\u00e2\u0086\u0091', '↑'],
  // Down arrow ↓
  ['\u00e2\u0086\u0093', '↓'],
  // Checkmark ✓
  ['\u00e2\u009c\u0093', '✓'],
  // Phone 📱  f0 178 201c b1
  ['\u00f0\u0178\u201c\u00b1', '📱'],
  // Location pin 📍  f0 178 201c 8d
  ['\u00f0\u0178\u201c\u008d', '📍'],
  // Tools 🛠️  f0 178 9b a0
  ['\u00f0\u0178\u009b\u00a0\u00ef\u00b8\u008f', '🛠️'],
  ['\u00f0\u0178\u009b\u00a0', '🛠️'],
  // Chart/graph 📈  f0 178 201c 2030
  ['\u00f0\u0178\u201c\u2030', '📈'],
  // Money/dollar 💵  f0 178 2019 b5
  ['\u00f0\u0178\u2019\u00b5', '💵'],
  // Bell 🔔  f0 178 201d 2022
  ['\u00f0\u0178\u201d\u2022', '🔔'],
  // Notebook 📓  f0 178 201c 2019
  ['\u00f0\u0178\u201c\u2019', '📓'],
  // Computer 💻  f0 178 2019 bb
  ['\u00f0\u0178\u2019\u00bb', '💻'],
  // Lock 🔒  f0 178 201d 2019
  ['\u00f0\u0178\u201d\u2019', '🔒'],
  // Gear ⚙️  e2 9a 99
  ['\u00e2\u009a\u0099\u00ef\u00b8\u008f', '⚙️'],
  ['\u00e2\u009a\u0099', '⚙️'],
  // Lightning ⚡  e2 9a a1
  ['\u00e2\u009a\u00a1', '⚡'],
  // Warning ⚠️  e2 9a a0
  ['\u00e2\u009a\u00a0\u00ef\u00b8\u008f', '⚠️'],
  // Smiley 😊  f0 178 2dc 8a
  ['\u00f0\u0178\u02dc\u008a', '😊'],
];

let totalModified = 0;
let totalFixed = 0;
const files = fs.readdirSync(PUBLIC_DIR).filter(f => f.endsWith('.html'));

files.forEach(filename => {
  const filePath = path.join(PUBLIC_DIR, filename);
  let content = fs.readFileSync(filePath, 'utf8');
  let fileFixed = 0;

  EMOJI_MAP.forEach(([broken, fixed]) => {
    while (content.includes(broken)) {
      content = content.split(broken).join(fixed);
      fileFixed++;
    }
  });

  if (fileFixed > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    totalModified++;
    totalFixed += fileFixed;
    process.stdout.write('.');
  }
});

console.log('\nFixed ' + totalFixed + ' emoji occurrences across ' + totalModified + ' files.');

// Final scan to check for any remaining ðŸ sequences
console.log('\nRunning final scan...');
let remaining = 0;
files.forEach(filename => {
  const c = fs.readFileSync(path.join(PUBLIC_DIR, filename), 'utf8');
  if (/\u00f0\u0178/.test(c) || /\u00e2\u02dc/.test(c)) {
    const bad = c.split('\n').filter(l=>/\u00f0\u0178|\u00e2\u02dc/.test(l));
    console.log(filename + ': ' + bad.length + ' broken lines remaining');
    bad.forEach(l=>console.log('  >> ' + l.trim().slice(0,80)));
    remaining++;
  }
});
if (remaining === 0) {
  console.log('All clear! No broken emoji sequences found.');
}
