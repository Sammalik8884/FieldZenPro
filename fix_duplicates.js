/**
 * Fix ALL duplicate titles, H1s and meta descriptions
 * Fix all titles/meta desc that are too long
 * Each page gets 100% unique title, H1, and meta desc derived from its slug
 */
const fs=require('fs'),path=require('path');
const DIR=path.join(__dirname,'frontend','public');
const DOMAIN='https://fieldzenpro.com';

// Unique overrides for every page that needs differentiation
const UNIQUE = {
  // Comparison cluster — each needs its own angle
  'housecall-pro-alternative.html': {
    title:'Housecall Pro Alternative 2026: FieldZenPro vs Housecall Pro',
    h1:'Housecall Pro Alternative: Why FieldZenPro Beats Housecall Pro in 2026',
    desc:'Looking for a Housecall Pro alternative? FieldZenPro includes payroll, inventory & offline mobile — all missing from Housecall Pro. Free migration. Try 14 days free.'
  },
  'jobber-vs-fieldzenpro.html': {
    title:'Jobber vs FieldZenPro 2026: Side-by-Side Feature Comparison',
    h1:'Jobber vs FieldZenPro: Complete Feature & Pricing Comparison (2026)',
    desc:'Jobber vs FieldZenPro: compare scheduling, mobile app, payroll, inventory & pricing side by side. See which field service platform wins for your business in 2026.'
  },
  'jobber-alternative.html': {
    title:'Best Jobber Alternative 2026 — FieldZenPro',
    h1:'Best Jobber Alternative in 2026: FieldZenPro (Complete Comparison)',
    desc:'FieldZenPro is the best Jobber alternative for service businesses needing built-in payroll and inventory. Lower cost, better mobile app, free migration. Try free today.'
  },
  'switch-from-jobber.html': {
    title:'Switch From Jobber to FieldZenPro — Free Migration in 48 Hours',
    h1:'Switch From Jobber to FieldZenPro: Free Migration in 48 Hours',
    desc:'Ready to switch from Jobber? FieldZenPro\'s free migration team moves your customer data in 48 hours. Built-in payroll, offline app & flat-rate pricing included.'
  },
  'servicetitan-vs-fieldzenpro.html': {
    title:'ServiceTitan vs FieldZenPro 2026: Which FSM Platform Wins?',
    h1:'ServiceTitan vs FieldZenPro: Which Field Service Platform Is Right for You?',
    desc:'ServiceTitan vs FieldZenPro: full comparison of features, pricing, implementation time & support. FieldZenPro delivers enterprise features at 70% lower cost.'
  },
  'servicetitan-too-expensive.html': {
    title:'ServiceTitan Too Expensive? Affordable Alternative for SMBs',
    h1:'ServiceTitan Too Expensive? Switch to FieldZenPro and Save $10,000+ Per Year',
    desc:'ServiceTitan costs $10,000-$25,000/year. FieldZenPro delivers the same core features at a fraction of the price with no setup fee and 3-day implementation.'
  },
  'field-service-software-small-business-not-servicetitan.html': {
    title:'Field Service Software for Small Business (Not ServiceTitan)',
    h1:'Field Service Software for Small Business: The Best ServiceTitan Alternative',
    desc:'Small businesses don\'t need ServiceTitan\'s price or complexity. FieldZenPro delivers scheduling, dispatch, invoicing & payroll at SMB-friendly pricing. Try free.'
  },
  // Technician cluster
  'field-technician-software.html': {
    title:'Field Technician Software: Mobile App & Digital Work Orders 2026',
    h1:'Field Technician Software: Mobile App, Work Orders & On-Site Invoicing',
    desc:'Purpose-built field technician software with iOS & Android mobile app, digital work orders, photo capture, customer signatures & on-site invoicing. Try FieldZenPro free.'
  },
  'field-technician-management-software.html': {
    title:'Field Technician Management Software: Schedule, Track & Pay Techs',
    h1:'Field Technician Management Software: Schedule, Track & Manage Your Entire Team',
    desc:'Manage field technicians from hire to pay. FieldZenPro handles scheduling, GPS tracking, performance monitoring, digital work orders & payroll in one platform.'
  },
  'service-tech-software.html': {
    title:'Service Tech Software: Mobile Tools for Field Service Technicians',
    h1:'Service Tech Software: The Best Mobile Platform for Service Technicians',
    desc:'Service tech software built for the field. Offline mobile app, GPS clock-in, digital work orders & on-site invoicing. Everything your service techs need on their phone.'
  },
  'service-technician-software.html': {
    title:'Service Technician Software: Digital Work Orders, GPS & Invoicing',
    h1:'Service Technician Software: Digital Work Orders, Live GPS Tracking & Invoicing',
    desc:'Complete service technician software for iOS & Android. Digital work orders with photos, GPS tracking, offline capability, customer signatures & same-day invoicing.'
  },
  'field-engineer-software.html': {
    title:'Field Engineer Software: Project Management & Mobile Tools',
    h1:'Field Engineer Software: Manage Complex Projects, Assets & On-Site Teams',
    desc:'Field engineer software for managing complex technical projects, asset tracking, multi-site coordination, compliance documentation & client invoicing. Try FieldZenPro free.'
  },
  'service-engineer-software.html': {
    title:'Service Engineer Software: Manage Jobs, Assets & Compliance',
    h1:'Service Engineer Software: Jobs, Asset Tracking & Compliance Documentation',
    desc:'Service engineer software that tracks equipment assets, manages complex jobs, handles SLA compliance and generates professional service reports automatically.'
  },
  // Scheduling cluster
  'field-scheduling-software.html': {
    title:'Field Scheduling Software: Drag-and-Drop Job Assignment',
    h1:'Field Scheduling Software: Smart Drag-and-Drop Job Assignment for Field Teams',
    desc:'Field scheduling software with visual drag-and-drop dispatch board, GPS technician tracking & route optimization. Cut scheduling time by 60%. Try FieldZenPro free.'
  },
  'technician-scheduling-software.html': {
    title:'Technician Scheduling Software: Automate Your Field Team Calendar',
    h1:'Technician Scheduling Software: Automate Your Entire Field Team Calendar',
    desc:'Stop manually scheduling technicians. FieldZenPro\'s technician scheduling software automates recurring jobs, optimizes routes & dispatches via GPS in under 60 seconds.'
  },
  'scheduling-software-for-field-technicians.html': {
    title:'Scheduling Software for Field Technicians: Route & Dispatch',
    h1:'Scheduling Software for Field Technicians: Optimized Routes & Smart Dispatch',
    desc:'Scheduling software built for field technician teams. GPS-optimized routes, skills-based job assignment, automated recurring scheduling & customer notifications.'
  },
  'field-tech-scheduling-software.html': {
    title:'Field Tech Scheduling Software: Fast Dispatch & Route Optimization',
    h1:'Field Tech Scheduling Software: Dispatch Faster, Drive Less, Complete More Jobs',
    desc:'Field tech scheduling software that assigns jobs in under 60 seconds, reduces drive time by 35% and automates recurring maintenance scheduling for your entire team.'
  },
  // Small business cluster
  'field-management-software-for-small-business.html': {
    title:'Field Management Software for Small Business: Simple & Affordable',
    h1:'Field Management Software for Small Business: Simple, Affordable & Powerful',
    desc:'Field management software built for small service businesses. Replace 5 disconnected tools with one affordable platform. Live in 3 days, no IT required.'
  },
  'field-service-software-for-small-business.html': {
    title:'Field Service Software for Small Business — FieldZenPro',
    h1:'Field Service Software for Small Business: Grow Without Growing Complexity',
    desc:'The best field service software for small businesses with 1-50 technicians. Scheduling, invoicing, payroll & GPS tracking — all in one platform at one flat price.'
  },
  'service-management-software-for-small-business.html': {
    title:'Service Management Software for Small Business 2026',
    h1:'Service Management Software for Small Business: Everything in One Platform',
    desc:'All-in-one service management software for small businesses. Manage jobs, schedule techs, invoice customers & run payroll from a single affordable platform.'
  },
  'work-order-software-for-small-business.html': {
    title:'Work Order Software for Small Business: Digital & Fast',
    h1:'Work Order Software for Small Business: Go Digital in 3 Days',
    desc:'Replace paper work orders with digital. FieldZenPro\'s work order software for small business includes photos, signatures, auto-invoicing & full offline mobile capability.'
  },
  'best-field-service-management-software-for-small-business.html': {
    title:'Best Field Service Management Software for Small Business 2026',
    h1:'Best Field Service Management Software for Small Business: Expert Picks 2026',
    desc:'The best FSM software for small service businesses in 2026. Compare features, pricing & support for platforms built for 1-50 technician teams. Find your perfect fit.'
  },
  // Landscaping cluster
  'landscaping-business-software.html': {
    title:'Landscaping Business Software: Crews, Routes & Billing 2026',
    h1:'Landscaping Business Software: Manage Crews, Routes & Recurring Billing',
    desc:'All-in-one landscaping business software. Route-optimize crew schedules, automate recurring billing & manage equipment across your entire operation. Try free today.'
  },
  'scheduling-software-for-landscaping-business.html': {
    title:'Scheduling Software for Landscaping Business: Optimize Crew Routes',
    h1:'Scheduling Software for Landscaping Business: Crew Routes, Jobs & Contracts',
    desc:'Landscaping scheduling software that builds optimized crew routes, auto-schedules recurring mowing contracts & coordinates multiple teams across all your accounts.'
  },
  // Cleaning cluster
  'cleaning-business-management-software.html': {
    title:'Cleaning Business Management Software: Routes, Staff & Billing',
    h1:'Cleaning Business Management Software: Schedule Staff, Track Quality & Bill Clients',
    desc:'Cleaning business management software for scheduling staff, optimizing routes, digital checklists with photos & automatic recurring billing. Free 14-day trial.'
  },
  'window-cleaning-software.html': {
    title:'Window Cleaning Software: Route Management, Quotes & Invoicing',
    h1:'Window Cleaning Software: Route Optimization, Digital Quotes & Auto-Invoicing',
    desc:'Purpose-built window cleaning software. Optimize routes, manage access requirements, send digital quotes & invoice automatically after every visit. Try FieldZenPro free.'
  },
  // HVAC cluster
  'hvac-field-service-software.html': {
    title:'HVAC Field Service Software: Dispatch, Maintenance & Invoicing',
    h1:'HVAC Field Service Software: Smart Dispatch, Maintenance Contracts & Invoicing',
    desc:'HVAC field service software for scheduling service calls, managing maintenance contracts, tracking equipment history & invoicing automatically. Built for HVAC businesses.'
  },
  'hvac-business-management-software.html': {
    title:'HVAC Business Management Software: Grow Your HVAC Company in 2026',
    h1:'HVAC Business Management Software: Dispatch, Contracts & Payroll in One Platform',
    desc:'Complete HVAC business management software. Manage technician scheduling, seasonal maintenance contracts, van inventory, invoicing & payroll all in one platform.'
  },
  'hvac-dispatch-software.html': {
    title:'HVAC Dispatch Software: GPS Assignment in Under 60 Seconds',
    h1:'HVAC Dispatch Software: Assign Emergency Calls in Under 60 Seconds',
    desc:'HVAC dispatch software with live GPS technician tracking, skills-based job matching & emergency call assignment in under 60 seconds. Cut response time by 40%.'
  },
  'hvac-field-service-management-software.html': {
    title:'HVAC Field Service Management Software: Complete Operations Platform',
    h1:'HVAC Field Service Management Software: Manage Your Entire HVAC Operation',
    desc:'End-to-end HVAC field service management software covering scheduling, dispatch, refrigerant tracking, maintenance contracts, inventory & automatic customer invoicing.'
  },
  // FSM/General cluster - deduplicate
  'field-service-management.html': {
    title:'Field Service Management: The Complete Guide for 2026',
    h1:'Field Service Management: What It Is, How It Works & How to Do It Right',
    desc:'The complete guide to field service management in 2026. Learn how to manage technicians, dispatch jobs, track inventory & invoice customers efficiently at any scale.'
  },
  'fsm-software.html': {
    title:'FSM Software: Best Field Service Management Software Reviewed',
    h1:'FSM Software: Top Field Service Management Platforms Compared for 2026',
    desc:'Compare the best FSM software platforms for 2026. Expert review of features, pricing, mobile apps & customer support for service businesses of all sizes.'
  },
  'fsm-field-service-management.html': {
    title:'FSM Field Service Management: Platform Comparison & Buyer Guide',
    h1:'FSM Field Service Management: How to Choose the Right Platform in 2026',
    desc:'FSM field service management platform comparison for 2026. Understand the difference between FSM tiers and find the right platform for your service business needs.'
  },
  'field-management-software.html': {
    title:'Field Management Software: Track, Schedule & Invoice Field Teams',
    h1:'Field Management Software: The All-in-One Platform for Mobile Workforces',
    desc:'Field management software that connects your office to your field team in real time. GPS tracking, job scheduling, digital work orders & automatic invoicing.'
  },
  'field-management-system.html': {
    title:'Field Management System: Real-Time Visibility for Service Operations',
    h1:'Field Management System: Real-Time Visibility Across Your Entire Field Operation',
    desc:'A field management system that gives dispatchers live GPS visibility, job status updates & route optimization to maximize productivity across every technician.'
  },
  'best-fsm-software.html': {
    title:'Best FSM Software 2026: Expert Review of Top Platforms',
    h1:'Best FSM Software in 2026: Top 10 Field Service Platforms Ranked',
    desc:'Our expert review of the best FSM software in 2026. Ranked by features, pricing, mobile app quality & support. Find the right field service platform for your team.'
  },
};

let fixed=0;
const files=fs.readdirSync(DIR).filter(function(f){return f.endsWith('.html');});

files.forEach(function(f){
  if(!UNIQUE[f]) return;
  var fp=path.join(DIR,f);
  var html=fs.readFileSync(fp,'utf8');
  var u=UNIQUE[f];

  // Fix title
  html=html.replace(/<title>[\s\S]*?<\/title>/i,'<title>'+u.title+'</title>');
  // Fix meta description
  html=html.replace(/(<meta name="description" content=")[^"]*"/i,'$1'+u.desc+'"');
  // Fix og:title
  html=html.replace(/(<meta property="og:title" content=")[^"]*"/i,'$1'+u.h1+'"');
  // Fix og:description
  html=html.replace(/(<meta property="og:description" content=")[^"]*"/i,'$1'+u.desc+'"');
  // Fix twitter:title
  html=html.replace(/(<meta name="twitter:title" content=")[^"]*"/i,'$1'+u.h1+'"');
  // Fix twitter:description
  html=html.replace(/(<meta name="twitter:description" content=")[^"]*"/i,'$1'+u.desc+'"');
  // Fix H1
  html=html.replace(/<h1>[\s\S]*?<\/h1>/i,'<h1>'+u.h1+'</h1>');
  // Fix Article schema headline
  html=html.replace(/"headline":"[^"]*"/,'"headline":"'+u.h1.replace(/"/g,'\\"')+'"');

  fs.writeFileSync(fp,html,'utf8');
  fixed++;
  process.stdout.write('.');
});
console.log('\nFixed unique metadata on '+fixed+' pages.');

// Now fix titles/meta desc that are too long (>75 chars for title, >165 for desc)
let truncated=0;
files.forEach(function(f){
  var fp=path.join(DIR,f);
  var html=fs.readFileSync(fp,'utf8');
  var changed=false;

  var titleM=html.match(/<title>([\s\S]*?)<\/title>/i);
  if(titleM && titleM[1].length>75){
    var short=titleM[1].substring(0,72)+'...';
    html=html.replace(/<title>[\s\S]*?<\/title>/i,'<title>'+short+'</title>');
    changed=true;
  }
  var descM=html.match(/<meta name="description" content="([^"]*)"/i);
  if(descM && descM[1].length>165){
    var shortD=descM[1].substring(0,162)+'...';
    html=html.replace(/(<meta name="description" content=")[^"]*"/i,'$1'+shortD+'"');
    changed=true;
  }
  if(changed){fs.writeFileSync(fp,html,'utf8');truncated++;process.stdout.write('t');}
});
console.log('\nTrimmed titles/descs on '+truncated+' pages.');
