const fs = require('fs');
const path = require('path');
const dir = 'frontend/public';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

const replacements = {
  'ðŸ’¸': '💸',
  'ðŸ‘»': '👻',
  'ðŸ¤·': '🤷'
};

let count = 0;
for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  for (const [bad, good] of Object.entries(replacements)) {
    if (content.includes(bad)) {
      content = content.split(bad).join(good);
      changed = true;
    }
  }
  
  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    count++;
  }
}
console.log('Fixed ' + count + ' files with new emojis.');
