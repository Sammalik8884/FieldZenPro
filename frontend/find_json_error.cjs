const fs = require('fs');
const path = require('path');

function findHtmlFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const stat = fs.statSync(path.join(dir, file));
    if (stat.isDirectory() && file !== 'node_modules') {
      findHtmlFiles(path.join(dir, file), fileList);
    } else if (file.endsWith('.html')) {
      fileList.push(path.join(dir, file));
    }
  }
  return fileList;
}

const htmlFiles = findHtmlFiles('./');
let hasError = false;

for (const file of htmlFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const regex = /<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    try {
      JSON.parse(match[1].trim());
    } catch (e) {
      console.log('Error in file:', file);
      hasError = true;
    }
  }
}
if (!hasError) console.log('No errors!');
