const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'frontend', 'public');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

let faviconInjected = 0;
const faviconTag = '\n  <link rel="icon" type="image/png" href="/favicon.png">\n';

files.forEach(f => {
  const fp = path.join(dir, f);
  let html = fs.readFileSync(fp, 'utf8');
  
  // Remove any existing favicon tags
  html = html.replace(/<link[^>]*rel="icon"[^>]*>/gi, '');
  html = html.replace(/<link[^>]*rel="shortcut icon"[^>]*>/gi, '');
  
  // Insert the new favicon tag right before </head>
  const headEndIdx = html.indexOf('</head>');
  if (headEndIdx !== -1) {
    html = html.substring(0, headEndIdx) + faviconTag + html.substring(headEndIdx);
    fs.writeFileSync(fp, html, 'utf8');
    faviconInjected++;
  }
});

console.log(`Injected proper favicon.png into ${faviconInjected} files.`);
