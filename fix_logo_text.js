const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'frontend', 'public');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

let replacedCount = 0;

const searchRegex = /<span style="font-size: 22px; font-weight: 800; color: #1e3a8a; letter-spacing: -0.5px; margin-bottom: 0;">FieldZenPro<\/span>/g;
const replacementHtml = `<span style="font-size: 24px; font-weight: 900; letter-spacing: -0.5px; margin-bottom: 0; background: none !important; -webkit-text-fill-color: initial !important;">
    <span style="color: #1e3a8a;">Field</span><span style="color: #f97316;">Zen</span><span style="color: #1e3a8a;">Pro</span>
  </span>`;

files.forEach(f => {
  const fp = path.join(dir, f);
  let content = fs.readFileSync(fp, 'utf8');
  
  if (searchRegex.test(content)) {
    content = content.replace(searchRegex, replacementHtml);
    fs.writeFileSync(fp, content, 'utf8');
    replacedCount++;
  }
});

console.log(`Updated navbar text colors in ${replacedCount} files.`);
