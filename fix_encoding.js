const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend', 'public', 'landing.html');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(/â†‘/g, '↑');
content = content.replace(/â†“/g, '↓');
content = content.replace(/âœ“/g, '✓');
content = content.replace(/Â·/g, '·');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed additional encoding issues in landing.html');
