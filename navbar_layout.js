const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'frontend', 'public');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

let replacedCount = 0;
let cssUpdatedCount = 0;

const searchRegex = /<a href="\/" class="nav-logo"[^>]*>[\s\S]*?<\/a>/g;
const replacementHtml = `<a href="/" class="nav-logo" aria-label="FieldZenPro Home" style="display: flex; align-items: center; gap: 10px; text-decoration: none;">
  <img src="/assets/images/fieldzenpro-logo.png" alt="FieldZenPro Logo" class="header-logo">
  <span style="font-size: 22px; font-weight: 800; color: #1e3a8a; letter-spacing: -0.5px; margin-bottom: 0;">FieldZenPro</span>
</a>`;

files.forEach(f => {
  const fp = path.join(dir, f);
  let content = fs.readFileSync(fp, 'utf8');
  
  let modified = false;
  if (searchRegex.test(content)) {
    content = content.replace(searchRegex, replacementHtml);
    modified = true;
    replacedCount++;
  }
  
  // Fix heights back to 45px
  if (content.includes('height: 60px;')) {
    content = content.replace(/height: 60px;/g, 'height: 45px;');
    modified = true;
    cssUpdatedCount++;
  }
  if (content.includes('height: 75px;')) {
    content = content.replace(/height: 75px;/g, 'height: 45px;');
    modified = true;
    cssUpdatedCount++;
  }
  if (content.includes('height: 40px;')) {
    content = content.replace(/height: 40px;/g, 'height: 45px;');
    modified = true;
    cssUpdatedCount++;
  }
  
  if (modified) {
    fs.writeFileSync(fp, content, 'utf8');
  }
});

console.log(`Updated navbar HTML in ${replacedCount} files.`);
console.log(`Updated CSS height to 45px in ${cssUpdatedCount} files.`);
