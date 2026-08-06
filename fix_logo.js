const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'frontend', 'public');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

let replacedCount = 0;
let cssUpdatedCount = 0;

const searchRegex = /<a href="\/" class="nav-logo"[^>]*>\s*(?:⚡\s*)?FieldZenPro\s*<\/a>/g;
const replacementHtml = '<a href="/" class="nav-logo" aria-label="FieldZenPro Home"><img src="/assets/images/fieldzenpro-logo.png" alt="FieldZenPro Field Service Management Software" title="FieldZenPro Field Service Management Software" class="header-logo"></a>';

files.forEach(f => {
  const fp = path.join(dir, f);
  let content = fs.readFileSync(fp, 'utf8');
  
  let modified = false;
  if (searchRegex.test(content)) {
    content = content.replace(searchRegex, replacementHtml);
    modified = true;
    replacedCount++;
  }
  
  // Update embedded CSS height to 60px if it exists
  if (content.includes('.header-logo {') && content.includes('height: 40px;')) {
    content = content.replace('height: 40px;', 'height: 60px;');
    modified = true;
    cssUpdatedCount++;
  }
  
  if (modified) {
    fs.writeFileSync(fp, content, 'utf8');
  }
});

console.log(`Replaced text logo in ${replacedCount} files.`);
console.log(`Updated CSS height to 60px in ${cssUpdatedCount} files.`);
