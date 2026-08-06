const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'frontend', 'public');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

let cssInjected = 0;

files.forEach(f => {
  const fp = path.join(dir, f);
  let html = fs.readFileSync(fp, 'utf8');
  
  if (!html.includes('.header-logo {')) {
    // find the closing </style> tag and insert before it
    const styleEndIdx = html.indexOf('</style>');
    if (styleEndIdx !== -1) {
      const logoCss = `
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
    }
    `;
      html = html.substring(0, styleEndIdx) + logoCss + html.substring(styleEndIdx);
      fs.writeFileSync(fp, html, 'utf8');
      cssInjected++;
    }
  }
});

console.log(`Injected logo CSS into ${cssInjected} files.`);
