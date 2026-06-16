const fs = require('fs');
const path = require('path');
const PUBLIC_DIR = path.join(__dirname, 'frontend', 'public');

const FINAL_FIXES = [
  // 📸 camera  f0 178 201c b8
  ['\u00f0\u0178\u201c\u00b8', '📸'],
  // 📜 scroll  f0 178 201d 201e (was showing as 📄)
  ['\u00f0\u0178\u201d\u201e', '📜'],
  // 🏆 trophy  f0 178 8f 2020
  ['\u00f0\u0178\u008f\u2020', '🏆'],
  // 📈 chart up  f0 178 201c 2c6
  ['\u00f0\u0178\u201c\u02c6', '📈'],
  // 🗑️ trash  f0 178 2014 2018 ef b8
  ['\u00f0\u0178\u2014\u2018\u00ef\u00b8\u008f', '🗑️'],
  ['\u00f0\u0178\u2014\u2018', '🗑️'],
  // 🔨 hammer  f0 178 201d a8
  ['\u00f0\u0178\u201d\u00a8', '🔨'],
  // 🔐 lock with key  f0 178 201d 90
  ['\u00f0\u0178\u201d\u0090', '🔐'],
];

let totalModified = 0;
const files = fs.readdirSync(PUBLIC_DIR).filter(f => f.endsWith('.html'));

files.forEach(filename => {
  const filePath = path.join(PUBLIC_DIR, filename);
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  FINAL_FIXES.forEach(([broken, fixed]) => {
    if (content.includes(broken)) {
      content = content.split(broken).join(fixed);
      changed = true;
    }
  });

  // Also fix remaining MytechERP references in h3
  if (content.includes("MytechERP's Checklist Builder Works")) {
    content = content.replace("MytechERP's Checklist Builder Works", "FieldZenPro's Checklist Builder Works");
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    totalModified++;
    process.stdout.write('.');
  }
});

console.log('\nFixed ' + totalModified + ' files.');

// Final check
let remaining = 0;
files.forEach(filename => {
  const c = fs.readFileSync(path.join(PUBLIC_DIR, filename), 'utf8');
  if (/\u00f0\u0178/.test(c) || /\u00e2\u02dc/.test(c)) {
    const bad = c.split('\n').filter(l=>/\u00f0\u0178|\u00e2\u02dc/.test(l));
    console.log(filename + ': ' + bad.length + ' still broken');
    bad.forEach(l=>console.log('  >> ' + l.trim().slice(0,80)));
    remaining++;
  }
});
if (remaining === 0) console.log('\nAll clear! 100% clean.');
