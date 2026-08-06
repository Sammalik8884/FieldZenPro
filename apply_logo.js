const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'frontend', 'public');

const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

let replacedCount = 0;

const searchRegex = /<a href="\/" class="nav-logo">\s*⚡ FieldZenPro\s*<\/a>/g;
const replacementHtml = '<a href="/" class="nav-logo" aria-label="FieldZenPro Home"><img src="/assets/images/fieldzenpro-logo.png" alt="FieldZenPro Field Service Management Software" title="FieldZenPro Field Service Management Software" class="header-logo"></a>';

files.forEach(f => {
  const fp = path.join(dir, f);
  let content = fs.readFileSync(fp, 'utf8');
  
  if (searchRegex.test(content)) {
    content = content.replace(searchRegex, replacementHtml);
    fs.writeFileSync(fp, content, 'utf8');
    replacedCount++;
  }
});

console.log(`Replaced text logo with image logo in ${replacedCount} files.`);

// Now let's update index.css to make sure the logo is sized right
const cssPath = path.join(dir, 'index.css');
if (fs.existsSync(cssPath)) {
    let css = fs.readFileSync(cssPath, 'utf8');
    if (!css.includes('.header-logo')) {
        css += `\n\n/* Logo styles */
.header-logo {
  height: 40px;
  width: auto;
  display: block;
  object-fit: contain;
}
.nav-logo {
  display: flex;
  align-items: center;
  text-decoration: none;
}\n`;
        fs.writeFileSync(cssPath, css, 'utf8');
        console.log('Added .header-logo to index.css');
    }
}
