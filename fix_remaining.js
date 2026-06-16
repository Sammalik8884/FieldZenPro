const fs=require('fs'),path=require('path');
const DIR=path.join(__dirname,'frontend','public');

// Fix remaining 4 duplicate pairs + 1 short meta desc
var FIXES = {
  'field-service-applications.html': {
    title:'Field Service Applications: Top Mobile Apps for Service Teams 2026',
    h1:'Field Service Applications: Best Mobile Apps for Field Service Teams in 2026',
    desc:'Compare the best field service applications for iOS and Android. Review scheduling, dispatch, work order and invoicing apps purpose-built for field service teams.'
  },
  'best-field-service-app.html': {
    title:'Best Field Service App 2026: Top Rated iOS & Android Apps Reviewed',
    h1:'Best Field Service App in 2026: Top-Rated iOS & Android Apps for Service Pros',
    desc:'The best field service apps of 2026 reviewed and ranked. Compare mobile apps for scheduling, GPS dispatch, work orders, invoicing & offline capability for field teams.'
  },
  'field-service-scheduling-app.html': {
    title:'Field Service Scheduling App: Mobile Dispatch for Field Teams',
    h1:'Field Service Scheduling App: Manage Your Entire Team from Your Phone',
    desc:'The best field service scheduling app for iOS and Android. Schedule jobs, dispatch techs, track GPS and send invoices — all from a fully offline-capable mobile app.'
  },
  'field-service-erp-software.html': {
    title:'Field Service ERP Software: Complete Business Platform for Service Cos',
    h1:'Field Service ERP Software: Unify Scheduling, Inventory, Invoicing & Payroll',
    desc:'Field service ERP software that combines CRM, scheduling, work orders, inventory, invoicing and payroll in one connected platform. Replace 8 tools with FieldZenPro.'
  },
  'enterprise-field-service-management-software.html': {
    title:'Enterprise Field Service Management Software: Scale to 500+ Techs',
    h1:'Enterprise Field Service Management Software: Manage 100-500 Technicians at Scale',
    desc:'Enterprise field service management software for large service organizations. Multi-region dispatch, compliance documentation, advanced reporting and role-based access.'
  },
  'free-field-service-software.html': {
    title:'Free Field Service Software: Best Free & Affordable FSM Tools 2026',
    h1:'Free Field Service Software: What You Get Free vs. What You Need to Pay For',
    desc:'Looking for free field service software? Compare free FSM tools vs paid platforms. See what features require paid plans and why FieldZenPro delivers the best value.'
  },
  'servicetitan-too-expensive.html': {
    title:'ServiceTitan Too Expensive? Save $10,000/yr with FieldZenPro',
    h1:'ServiceTitan Too Expensive? Switch to FieldZenPro and Save Over $10,000 Per Year',
    desc:'ServiceTitan costs $10,000-$25,000 per year with a 6-month setup. FieldZenPro delivers the same core features at 70% less cost with a 3-day implementation and no setup fee.'
  }
};

var fixed=0;
Object.keys(FIXES).forEach(function(f){
  var fp=path.join(DIR,f);
  if(!fs.existsSync(fp)){console.log('NOT FOUND: '+f);return;}
  var html=fs.readFileSync(fp,'utf8');
  var u=FIXES[f];
  html=html.replace(/<title>[\s\S]*?<\/title>/i,'<title>'+u.title+'</title>');
  html=html.replace(/(<meta name="description" content=")[^"]*"/i,'$1'+u.desc+'"');
  html=html.replace(/(<meta property="og:title" content=")[^"]*"/i,'$1'+u.h1+'"');
  html=html.replace(/(<meta property="og:description" content=")[^"]*"/i,'$1'+u.desc+'"');
  html=html.replace(/(<meta name="twitter:title" content=")[^"]*"/i,'$1'+u.h1+'"');
  html=html.replace(/(<meta name="twitter:description" content=")[^"]*"/i,'$1'+u.desc+'"');
  html=html.replace(/<h1>[\s\S]*?<\/h1>/i,'<h1>'+u.h1+'</h1>');
  html=html.replace(/"headline":"[^"]*"/,'"headline":"'+u.h1.replace(/"/g,'\\"')+'"');
  fs.writeFileSync(fp,html,'utf8');
  fixed++;
  console.log('Fixed: '+f);
});

// Fix broken JSON-LD in blog-best-fm-software-2026.html
var blogPath=path.join(DIR,'blog-best-fm-software-2026.html');
if(fs.existsSync(blogPath)){
  var blogHtml=fs.readFileSync(blogPath,'utf8');
  // Remove all JSON-LD blocks and add clean one
  blogHtml=blogHtml.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/gi,'');
  var cleanSchema='<script type="application/ld+json">\n'+
    '{"@context":"https://schema.org","@type":"Article","headline":"Best Field Service Management Software 2026","description":"Expert comparison of the top field service management software platforms for 2026.","url":"https://fieldzenpro.com/blog-best-fm-software-2026","author":{"@type":"Person","name":"Muhammad Usama"},"publisher":{"@type":"Organization","name":"FieldZenPro","url":"https://fieldzenpro.com"},"datePublished":"2026-03-01","dateModified":"2026-06-16"}\n'+
    '</script>';
  // Insert before </head>
  blogHtml=blogHtml.replace('</head>',cleanSchema+'\n</head>');
  fs.writeFileSync(blogPath,blogHtml,'utf8');
  console.log('Fixed JSON-LD: blog-best-fm-software-2026.html');
}

console.log('\nTotal fixes applied: '+(fixed+1));
