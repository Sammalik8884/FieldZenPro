const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'frontend', 'public');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

let cssUpdatedCount = 0;

files.forEach(f => {
  const fp = path.join(dir, f);
  let content = fs.readFileSync(fp, 'utf8');
  
  let modified = false;
  
  // Bump height from 60px to 75px so the text is fully readable
  if (content.includes('.header-logo {') && content.includes('height: 60px;')) {
    content = content.replace('height: 60px;', 'height: 75px;');
    modified = true;
    cssUpdatedCount++;
  }
  
  if (modified) {
    fs.writeFileSync(fp, content, 'utf8');
  }
});

console.log(`Updated CSS height to 75px in ${cssUpdatedCount} files.`);
