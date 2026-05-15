const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');

const filesToUpdate = [
  'about.html', 'blog.html', 'careers.html', 'gdpr.html', 
  'privacy.html', 'security.html', 'terms.html',
  'blog-automate-invoicing.html', 'blog-best-fm-software-2026.html', 
  'blog-digital-checklists-fm.html', 'blog-digital-work-orders.html', 
  'blog-erp-vs-cmms.html'
];

const newCSS = `*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{ --bg:#F8F9FA; --surface:#FFFFFF; --border:#DADCE0; --primary:#4285F4; --text:#202124; --muted:#5F6368; --accent:#34A853; }
body{font-family:'Inter',sans-serif;background:var(--bg);color:var(--text);line-height:1.7}
nav{position:fixed;top:0;left:0;right:0;z-index:100;padding:20px 2rem;background:rgba(255,255,255,0.9);backdrop-filter:blur(20px);border-bottom:1px solid var(--border);}
.nav-logo{font-size:1.4rem;font-weight:800;background:linear-gradient(135deg,var(--primary),var(--accent));-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;text-decoration:none;letter-spacing:-0.5px;}
.container{max-width:800px;margin: 140px auto 100px;padding: 0 2rem;}
h1{font-size:2.5rem;font-weight:800;margin-bottom:1rem;color:var(--text);}
.last-updated{color:var(--muted);font-size:0.9rem;margin-bottom:3rem;display:block;}
h2{font-size:1.5rem;font-weight:600;margin:2.5rem 0 1rem;color:var(--text);}
p, li{color:var(--muted);margin-bottom:1rem;}
ul{margin-left:1.5rem;margin-bottom:1.5rem;}
a{color:var(--primary);text-decoration:none;}
a:hover{text-decoration:underline;}`;

let updatedCount = 0;

filesToUpdate.forEach(file => {
  const filePath = path.join(publicDir, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace the style block
    const styleRegex = /<style>[\s\S]*?<\/style>/;
    content = content.replace(styleRegex, `<style>\n${newCSS}\n</style>`);
    
    fs.writeFileSync(filePath, content, 'utf8');
    updatedCount++;
    console.log('Updated ' + file);
  }
});

console.log('Total files updated: ' + updatedCount);
