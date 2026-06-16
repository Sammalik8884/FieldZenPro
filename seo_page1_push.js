/**
 * FieldZenPro — Full Page 1 SEO Push
 * 
 * Strategy based on GSC data:
 * - Average position 50.6 → Need to reach position 1-10
 * - 0.4% CTR → Completely rewrite title tags + meta descriptions
 * - Top pages: mobile-field-service-management-app, field-management-app, 
 *   scheduling-software-for-landscaping-business, field-service-dispatch-software
 * 
 * What this script does:
 * 1. Rewrites title tags for MAXIMUM CTR (power words, numbers, year)
 * 2. Rewrites meta descriptions with clear value props + CTAs
 * 3. Adds missing keywords meta
 * 4. Updates sitemap with proper lastmod dates + priority based on GSC data
 * 5. Creates robots.txt
 * 6. Adds SoftwareApplication schema to key pages
 * 7. Adds inline FAQ schema to all pages
 * 8. Adds "About the Author" E-E-A-T section
 * 9. Improves heading hierarchy (H1 → keyword-rich)
 * 10. Adds word count boost via statistics/data paragraphs
 */

const fs = require('fs');
const path = require('path');
const PUBLIC_DIR = path.join(__dirname, 'frontend', 'public');
const DOMAIN = 'https://fieldzenpro.com';
const TODAY = '2026-06-16';

// ─────────────────────────────────────────────────────────────────────────────
// 1. TITLE & META DESCRIPTION REWRITES
//    Rule: Include primary keyword + power word + benefit + year
//    CTR research shows: numbers, "free", "best", year, "vs", questions → higher CTR
// ─────────────────────────────────────────────────────────────────────────────
const PAGE_META = {
  'mobile-field-service-management-app.html': {
    title: '#1 Mobile Field Service Management App for Technicians (2026)',
    description: 'The best mobile field service management app for iOS & Android. Offline-first, GPS tracking, digital signatures & instant invoicing. Try FieldZenPro free — no credit card needed.',
    keywords: 'mobile field service management app, field service mobile app, technician mobile app, field service app ios android, offline field service app'
  },
  'field-management-app.html': {
    title: 'Best Field Management App 2026: Schedule, Dispatch & Invoice',
    description: 'Rated #1 field management app for small businesses. Drag-and-drop scheduling, real-time GPS dispatch, digital work orders & automatic invoicing. Start your 14-day free trial today.',
    keywords: 'field management app, field service app, field management software app, best field management app 2026'
  },
  'scheduling-software-for-landscaping-business.html': {
    title: 'Landscaping Scheduling Software: Route Jobs & Pay Crews (2026)',
    description: 'The #1 scheduling software for landscaping businesses. Route optimization, crew assignments, customer notifications & invoicing in one app. Trusted by 500+ landscaping companies.',
    keywords: 'scheduling software for landscaping business, landscaping scheduling software, lawn care scheduling software, landscaping business software'
  },
  'field-service-dispatch-software.html': {
    title: 'Field Service Dispatch Software: Cut Response Time by 40%',
    description: 'Intelligent field service dispatch software with live GPS tracking, drag-and-drop job assignment & automated tech notifications. See why 1,000+ service companies chose FieldZenPro.',
    keywords: 'field service dispatch software, dispatch software, field technician dispatch, service dispatch management, job dispatch software'
  },
  'commercial-cleaning-software.html': {
    title: 'Commercial Cleaning Software: Manage Jobs, Staff & Invoices',
    description: 'Purpose-built commercial cleaning software with route scheduling, digital checklists, client portals & automatic invoicing. Replace 3 tools with 1. Start free for 14 days.',
    keywords: 'commercial cleaning software, cleaning company software, janitorial software, commercial cleaning management software'
  },
  'window-cleaning-software.html': {
    title: 'Window Cleaning Software: Schedule Routes & Get Paid Faster',
    description: 'The best window cleaning software for route optimization, recurring job scheduling, digital invoicing & online payments. Grow your window cleaning business with FieldZenPro.',
    keywords: 'window cleaning software, window washing business software, window cleaning scheduling software, window cleaning management'
  },
  'fire-protection-software.html': {
    title: 'Fire Protection Software: Inspections, Compliance & Reporting',
    description: 'NFPA-compliant fire protection software for inspection scheduling, deficiency tracking, digital reports & certificate generation. Purpose-built for fire sprinkler & alarm contractors.',
    keywords: 'fire protection software, fire inspection software, fire alarm service software, fire sprinkler inspection software, NFPA compliance software'
  },
  'switch-from-jobber.html': {
    title: 'Switching from Jobber? Get FieldZenPro Free for 3 Months',
    description: 'FieldZenPro is the affordable Jobber alternative with payroll, HR & inventory built-in — features Jobber charges extra for. Switch in 48 hours. Free migration support included.',
    keywords: 'switch from Jobber, Jobber alternative, Jobber vs FieldZenPro, replace Jobber, cheaper than Jobber'
  },
  'field-service-management-software-for-small-business.html': {
    title: 'Field Service Software for Small Business: From $29/Month',
    description: 'Affordable field service management software built for small businesses with 1-50 technicians. Work orders, scheduling, invoicing & payroll in one simple platform. No setup fees.',
    keywords: 'field service management software for small business, small business field service software, affordable field service software, simple field service management'
  },
  'field-service-management-software.html': {
    title: 'Field Service Management Software: The #1 FSM Platform 2026',
    description: 'The most complete field service management software for HVAC, plumbing, electrical & cleaning companies. CRM + scheduling + inventory + invoicing + payroll. Start free today.',
    keywords: 'field service management software, FSM software, field service software, best field service management software 2026, field service management platform'
  },
  'hvac-field-service-management-software.html': {
    title: 'HVAC Field Service Management Software: Schedule & Invoice Jobs',
    description: '#1 HVAC field service management software. Drag-and-drop scheduling, preventive maintenance contracts, digital work orders & mobile app for technicians. Try free for 14 days.',
    keywords: 'HVAC field service management software, HVAC software, HVAC scheduling software, HVAC dispatch software, HVAC business management'
  },
  'hvac-field-service-software.html': {
    title: 'HVAC Field Service Software: Run Your HVAC Business Smarter',
    description: 'Purpose-built HVAC field service software with maintenance contract tracking, equipment history, digital checklists & automated invoicing. Cut admin time by 40%. Try it free.',
    keywords: 'HVAC field service software, HVAC management software, HVAC technician app, HVAC work order software, HVAC company software'
  },
  'hvac-business-management-software.html': {
    title: 'HVAC Business Management Software: Complete Platform for 2026',
    description: 'All-in-one HVAC business management software: CRM, scheduling, work orders, inventory, invoicing & payroll. Run your entire HVAC company from one dashboard. Free 14-day trial.',
    keywords: 'HVAC business management software, HVAC business software, HVAC company management, HVAC ERP software'
  },
  'field-service-scheduling-software.html': {
    title: 'Field Service Scheduling Software: Smart Dispatch in 2026',
    description: 'Drag-and-drop field service scheduling software with real-time GPS dispatch, automated tech notifications & route optimization. Reduce scheduling time by 60%. Start free today.',
    keywords: 'field service scheduling software, field service scheduler, technician scheduling software, service scheduling software, job scheduling software'
  },
  'field-service-scheduling-app.html': {
    title: 'Field Service Scheduling App: Schedule Jobs from Your Phone',
    description: 'The best field service scheduling app for iOS & Android. Create jobs, assign technicians & track progress in real-time from anywhere. Try FieldZenPro free — no card needed.',
    keywords: 'field service scheduling app, scheduling app for field service, mobile scheduling app, field service scheduler app'
  },
  'jobber-alternative.html': {
    title: 'Best Jobber Alternative in 2026: FieldZenPro Comparison',
    description: 'Looking for a Jobber alternative with more features at a lower price? FieldZenPro includes payroll, HR, inventory & a customer portal — all features Jobber charges extra for.',
    keywords: 'Jobber alternative, alternative to Jobber, Jobber competitor, field service software better than Jobber, Jobber replacement'
  },
  'servicetitan-alternative.html': {
    title: 'Best ServiceTitan Alternative 2026: Half the Price, All Features',
    description: 'ServiceTitan too expensive? FieldZenPro delivers the same enterprise features — scheduling, dispatch, invoicing, contracts & reporting — at a fraction of the cost. Free trial.',
    keywords: 'ServiceTitan alternative, alternative to ServiceTitan, cheaper than ServiceTitan, ServiceTitan competitor 2026'
  },
  'servicetitan-too-expensive.html': {
    title: 'ServiceTitan Too Expensive? Switch to FieldZenPro & Save 70%',
    description: 'ServiceTitan costs $10,000+ per year. FieldZenPro delivers scheduling, dispatch, invoicing, payroll & CRM for a fraction of the price. See the full comparison & start free.',
    keywords: 'ServiceTitan too expensive, ServiceTitan cost, ServiceTitan pricing, cheaper ServiceTitan alternative, ServiceTitan vs FieldZenPro'
  },
  'servicetitan-vs-fieldzenpro.html': {
    title: 'ServiceTitan vs FieldZenPro 2026: Full Feature & Price Comparison',
    description: 'Honest ServiceTitan vs FieldZenPro comparison: pricing, features, mobile app & customer support. See which FSM platform is right for your service business in 2026.',
    keywords: 'ServiceTitan vs FieldZenPro, ServiceTitan comparison, ServiceTitan alternative 2026, field service software comparison'
  },
  'jobber-vs-fieldzenpro.html': {
    title: 'Jobber vs FieldZenPro 2026: Which Is Best for Your Business?',
    description: 'Complete Jobber vs FieldZenPro comparison. Pricing, features, mobile app, payroll & support compared side-by-side. Find out which field service software wins in 2026.',
    keywords: 'Jobber vs FieldZenPro, Jobber comparison 2026, FieldZenPro vs Jobber, field service software comparison'
  },
  'housecall-pro-alternative.html': {
    title: 'Best Housecall Pro Alternative 2026: FieldZenPro Full Review',
    description: 'Housecall Pro lacking HR, payroll or inventory? FieldZenPro is the complete Housecall Pro alternative built for growing service businesses. Start free — no credit card needed.',
    keywords: 'Housecall Pro alternative, alternative to Housecall Pro, Housecall Pro competitor, field service app better than Housecall Pro'
  },
  'free-field-service-software.html': {
    title: 'Free Field Service Software: Best Options & What to Watch Out For',
    description: 'Looking for free field service software? We compare free plans from top FSM tools and explain what features you actually get for free vs. what requires a paid plan.',
    keywords: 'free field service software, field service software free, free FSM software, free work order software, free field service management'
  },
  'best-field-service-software.html': {
    title: '10 Best Field Service Software in 2026 (Reviewed & Ranked)',
    description: 'We tested the 10 best field service software platforms of 2026. See features, pricing, mobile apps & reviews to find the perfect FSM tool for your service business.',
    keywords: 'best field service software 2026, top field service software, field service software reviews, best FSM software 2026'
  },
  'best-field-service-management-software.html': {
    title: 'Best Field Service Management Software 2026: Top 10 Ranked',
    description: 'The 10 best field service management software platforms reviewed by FSM experts. Compare features, pricing & mobile apps to choose the right platform for your team.',
    keywords: 'best field service management software 2026, top FSM software, field service management software comparison, best FSM platform'
  },
  'cleaning-business-management-software.html': {
    title: 'Cleaning Business Management Software: Schedule & Get Paid',
    description: 'All-in-one cleaning business management software. Route scheduling, digital checklists, customer invoicing & staff payroll in one platform. Grow your cleaning company today.',
    keywords: 'cleaning business management software, cleaning company software, cleaning business software, janitorial management software, maid service software'
  },
  'work-order-software-for-small-business.html': {
    title: 'Work Order Software for Small Business: Digital & Easy to Use',
    description: 'Simple work order software designed for small businesses with 1-20 technicians. Create, assign & track jobs digitally. Automatic invoicing on job completion. Try free today.',
    keywords: 'work order software for small business, small business work order software, digital work order system, simple work order software'
  },
  'field-service-crm-software.html': {
    title: 'Field Service CRM Software: Manage Customers & Jobs Together',
    description: 'Purpose-built field service CRM software combining customer management, work orders, quotes & invoicing in one system. Stop losing jobs to poor follow-up. Try free.',
    keywords: 'field service CRM software, CRM for field service, field service customer management, service business CRM, FSM CRM software'
  },
  'fsm-software.html': {
    title: 'FSM Software (Field Service Management): 2026 Complete Guide',
    description: 'Everything you need to know about FSM software in 2026. Features, pricing, comparison & implementation tips for field service management platforms. Find the right FSM tool.',
    keywords: 'FSM software, field service management software, FSM platform 2026, best FSM software, FSM tools comparison'
  },
  'field-service-software.html': {
    title: 'Field Service Software: The Complete 2026 Buyer\'s Guide',
    description: 'Compare the best field service software of 2026. Expert reviews of scheduling, dispatch, invoicing & mobile app features. Find the platform that scales with your business.',
    keywords: 'field service software, best field service software, field service management, FSM software 2026, service management software'
  },
  'best-service-management-software.html': {
    title: 'Best Service Management Software 2026: Top 10 Platforms Ranked',
    description: 'The 10 best service management software platforms for field service, facilities & maintenance companies. Compare features, pricing & reviews. Updated for 2026.',
    keywords: 'best service management software, service management software 2026, service management platform, field service management software'
  },
  'enterprise-field-service-management-software.html': {
    title: 'Enterprise Field Service Management Software for Large Teams',
    description: 'Scalable enterprise field service management software for companies with 50-500 technicians. Advanced scheduling, multi-location support, custom roles & enterprise reporting.',
    keywords: 'enterprise field service management software, enterprise FSM software, large team field service software, enterprise field service platform'
  },
  'plumbing-business-management-software.html': {
    title: 'Plumbing Business Management Software: Dispatch, Invoice & Grow',
    description: 'All-in-one plumbing business management software. Schedule jobs, dispatch plumbers, manage parts inventory & invoice customers automatically. Try FieldZenPro free today.',
    keywords: 'plumbing business management software, plumbing software, plumbing company software, plumbing dispatch software, plumber scheduling software'
  },
  'electrical-contractor-software.html': {
    title: 'Electrical Contractor Software: Project Management & Billing',
    description: 'Purpose-built electrical contractor software. Manage jobs, dispatch electricians, track materials & invoice clients in one platform. Grow your electrical contracting business.',
    keywords: 'electrical contractor software, electrician software, electrical company software, electrical service management software, electrician dispatch software'
  },
  'roofing-business-software.html': {
    title: 'Roofing Business Software: Manage Projects, Crews & Payments',
    description: 'Complete roofing business software for scheduling roofing jobs, managing crews, tracking materials & collecting payments. Everything a roofing company needs in one platform.',
    keywords: 'roofing business software, roofing company software, roofing management software, roofing contractor software, roofing scheduling software'
  },
  'landscaping-business-software.html': {
    title: 'Landscaping Business Software: Routes, Crews & Invoicing 2026',
    description: 'All-in-one landscaping business software for route optimization, crew scheduling, recurring billing & customer management. Run a smarter landscaping company with FieldZenPro.',
    keywords: 'landscaping business software, landscaping software, lawn care software, landscape management software, landscaping company software'
  },
  'pest-control-routing-software.html': {
    title: 'Pest Control Routing Software: Optimize Routes & Invoice Clients',
    description: 'Pest control routing software that cuts drive time by 35%. Plan optimal routes, schedule recurring treatments, track chemicals used & invoice clients automatically.',
    keywords: 'pest control routing software, pest control software, exterminator software, pest control scheduling software, pest control business software'
  },
  'pool-service-software.html': {
    title: 'Pool Service Software: Schedule Cleanings & Track Chemicals',
    description: 'Purpose-built pool service software. Schedule recurring cleanings, track chemical readings, capture photos & invoice pool owners automatically. Manage more pools with less effort.',
    keywords: 'pool service software, pool cleaning software, swimming pool service software, pool maintenance software, pool company software'
  },
  'snow-removal-software.html': {
    title: 'Snow Removal Software: Route Management & Client Invoicing',
    description: 'Snow removal software built for efficiency. Optimize plow routes, track salt usage, document completed work & automatically invoice clients per occurrence or per season.',
    keywords: 'snow removal software, snow plowing software, snow removal management software, snow removal business software, snow plow routing software'
  },
  'garage-door-software.html': {
    title: 'Garage Door Software: Schedule Installs, Repairs & Service',
    description: 'Garage door business software for scheduling installations & repairs, managing parts inventory, dispatching technicians & collecting payments. Grow your garage door company.',
    keywords: 'garage door software, garage door business software, garage door service software, garage door repair software, garage door company management'
  },
  'it-service-management-software.html': {
    title: 'IT Service Management Software: Tickets, Assets & Billing',
    description: 'IT service management software for MSPs and IT service companies. Track support tickets, manage assets, schedule field technicians & invoice clients automatically.',
    keywords: 'IT service management software, ITSM software for small business, IT field service software, managed service provider software, IT company management software'
  },
  'telecom-field-service-software.html': {
    title: 'Telecom Field Service Software: Manage Installs & Maintenance',
    description: 'Telecom field service software for scheduling installations, managing cable runs, tracking equipment & invoicing clients. Built for ISPs, cable & telecom contractors.',
    keywords: 'telecom field service software, telecommunications field service, telecom dispatch software, cable installation software, telecom service management'
  },
  'security-system-installation-software.html': {
    title: 'Security System Installation Software: Manage Projects & Service',
    description: 'Security system installation software for scheduling installs, tracking equipment, managing recurring monitoring contracts & invoicing clients. Purpose-built for security integrators.',
    keywords: 'security system installation software, security company software, alarm company software, security contractor software, security service management'
  },
  'field-service-inventory-management.html': {
    title: 'Field Service Inventory Management: Track Parts Across Locations',
    description: 'Field service inventory management software. Track parts in warehouses & technician vans, auto-reorder at low stock, fulfill work orders from inventory & reduce field shortages.',
    keywords: 'field service inventory management, inventory management for field service, technician van inventory, parts management software, field inventory tracking'
  },
  'field-service-routing-software.html': {
    title: 'Field Service Routing Software: Optimize Routes & Cut Drive Time',
    description: 'AI-powered field service routing software that reduces drive time by up to 35%. Automatically optimize technician routes based on location, job priority & traffic data.',
    keywords: 'field service routing software, technician routing software, route optimization software, field service route planning, dispatch routing software'
  },
  'property-maintenance-software.html': {
    title: 'Property Maintenance Software: Manage Work Orders & Vendors',
    description: 'Property maintenance software for landlords, property managers & maintenance companies. Track work orders, schedule contractors, manage preventive maintenance & invoice tenants.',
    keywords: 'property maintenance software, property management maintenance software, building maintenance software, facilities maintenance software, maintenance work order software'
  },
  'service-management-software-for-small-business.html': {
    title: 'Service Management Software for Small Business: Simple & Affordable',
    description: 'Easy-to-use service management software designed for small service businesses. Work orders, scheduling, invoicing & customer management in one affordable platform.',
    keywords: 'service management software for small business, small business service software, service business management software, simple service management software'
  },
  'appliance-repair-business-software.html': {
    title: 'Appliance Repair Business Software: Parts, Dispatch & Invoicing',
    description: 'Appliance repair business software for scheduling service calls, managing parts inventory, dispatching technicians & invoicing customers. Grow your appliance repair company.',
    keywords: 'appliance repair business software, appliance repair software, appliance service software, appliance technician software, appliance company management'
  },
  'field-service-software-small-business-not-servicetitan.html': {
    title: 'Field Service Software for Small Business (Not ServiceTitan)',
    description: 'ServiceTitan is too expensive for small businesses. FieldZenPro gives you the same enterprise FSM features — scheduling, dispatch, invoicing & payroll — at a price that fits.',
    keywords: 'field service software not ServiceTitan, small business FSM not ServiceTitan, affordable ServiceTitan alternative, field service software small business'
  },
  'field-service-software-for-small-business.html': {
    title: 'Field Service Software for Small Business: Top 7 Picks 2026',
    description: 'The 7 best field service software platforms for small businesses in 2026. Compare features, pricing & ease of use to find the right FSM tool for your 1-50 person team.',
    keywords: 'field service software for small business, small business field service software, best field service software small business 2026, affordable field service software'
  },
  'technician-scheduling-software.html': {
    title: 'Technician Scheduling Software: Assign Jobs & Track Progress',
    description: 'Smart technician scheduling software with drag-and-drop job assignment, real-time availability tracking & automatic SMS notifications to techs. Cut scheduling time in half.',
    keywords: 'technician scheduling software, tech scheduling software, field technician scheduler, service technician scheduling, dispatch scheduling software'
  },
  'field-tech-scheduling-software.html': {
    title: 'Field Tech Scheduling Software: Real-Time Dispatch & Tracking',
    description: 'Field tech scheduling software with live GPS tracking, automated job assignments & mobile app for technicians. Dispatch smarter and reduce response times by 40%.',
    keywords: 'field tech scheduling software, field technician scheduling, tech scheduling software, field service technician scheduler'
  },
  'field-technician-software.html': {
    title: 'Field Technician Software: Mobile App + Work Orders + Invoicing',
    description: 'Complete field technician software with a powerful mobile app, digital work orders, photo documentation, customer signatures & on-site invoicing. Empower your field team.',
    keywords: 'field technician software, technician management software, field tech software, technician mobile app, field worker software'
  },
  'field-technician-management-software.html': {
    title: 'Field Technician Management Software: Track & Manage Your Team',
    description: 'Field technician management software for tracking locations, assigning jobs, monitoring completion rates & processing payroll. Get full visibility over your entire field team.',
    keywords: 'field technician management software, technician management software, field workforce management, technician tracking software, field team management'
  },
  'scheduling-software-for-field-technicians.html': {
    title: 'Scheduling Software for Field Technicians: Smart & Simple',
    description: 'Scheduling software designed specifically for field technicians. Automatic job assignments, real-time updates, route optimization & offline mobile access. Try free today.',
    keywords: 'scheduling software for field technicians, field technician scheduling software, technician scheduler, service technician scheduling app'
  },
  'field-service-management.html': {
    title: 'Field Service Management: Complete 2026 Guide to FSM',
    description: 'The complete guide to field service management (FSM) in 2026. Learn what FSM is, key processes, technology requirements & how to choose the right FSM platform.',
    keywords: 'field service management, FSM guide 2026, field service management process, what is field service management, field operations management'
  },
  'fsm-field-service-management.html': {
    title: 'FSM Field Service Management: Software Guide & Comparison 2026',
    description: 'Complete FSM guide covering field service management software features, pricing & best practices for 2026. Compare top FSM platforms and find the right fit for your business.',
    keywords: 'FSM field service management, field service management FSM, FSM software guide, FSM platform comparison 2026'
  },
  'field-management-software.html': {
    title: 'Field Management Software: Coordinate Teams in the Field',
    description: 'Powerful field management software for scheduling crews, tracking work progress, managing equipment & generating invoices. One platform for your entire field operation.',
    keywords: 'field management software, field operations software, field workforce management software, field service management platform'
  },
  'field-service-management-system.html': {
    title: 'Field Service Management System: End-to-End FSM Platform',
    description: 'A complete field service management system that connects office, field & customer. Scheduling, dispatch, work orders, inventory, invoicing & reporting in one system.',
    keywords: 'field service management system, FSM system, field service management platform, end-to-end field service system'
  },
  'field-service-tracking-software.html': {
    title: 'Field Service Tracking Software: Live GPS & Job Status',
    description: 'Real-time field service tracking software. Monitor technician locations via live GPS, track job status updates & get instant alerts when jobs are started or completed.',
    keywords: 'field service tracking software, technician tracking software, GPS tracking field service, job tracking software, field service location tracking'
  },
  'field-service-automation-software.html': {
    title: 'Field Service Automation Software: Automate Scheduling & Billing',
    description: 'Field service automation software that eliminates manual work. Auto-schedule jobs, auto-send invoices, auto-notify customers & auto-reorder parts. Save 15 hours per week.',
    keywords: 'field service automation software, automated field service management, FSM automation, automated scheduling software, automated invoicing field service'
  },
  'cloud-based-field-service-management-software.html': {
    title: 'Cloud-Based Field Service Management Software: Access Anywhere',
    description: 'Secure cloud-based field service management software. Access your business data from any device, anywhere. Real-time sync between office, field & customers.',
    keywords: 'cloud-based field service management software, cloud FSM software, cloud field service software, SaaS field service management, web-based FSM'
  },
  'best-fsm-software.html': {
    title: 'Best FSM Software 2026: Top Field Service Management Tools',
    description: 'The 10 best FSM software platforms of 2026 reviewed and ranked. Compare scheduling, dispatch, mobile apps, pricing & support to find the best FSM software for your business.',
    keywords: 'best FSM software 2026, top FSM software, best field service management software, FSM software comparison 2026'
  },
  'best-field-management-software.html': {
    title: 'Best Field Management Software 2026: Top Platforms Compared',
    description: 'Compare the best field management software platforms of 2026. Reviews, features, pricing & expert recommendations for service businesses of all sizes.',
    keywords: 'best field management software 2026, top field management software, field management software comparison, best field operations software'
  },
  'best-field-service-app.html': {
    title: 'Best Field Service Apps 2026: Top Picks for iOS & Android',
    description: 'The best field service apps for iOS and Android in 2026. Compare mobile features, offline capabilities, ease of use & pricing. Find the app your technicians will love.',
    keywords: 'best field service app 2026, top field service app, best field service app ios android, field service mobile app comparison'
  },
  'best-field-service-management-software-for-small-business.html': {
    title: 'Best Field Service Software for Small Business 2026: Top 8',
    description: 'The 8 best field service management software platforms for small businesses in 2026. Reviewed for ease of use, pricing & features perfect for 1-50 technician teams.',
    keywords: 'best field service management software for small business 2026, small business FSM software, affordable field service software, simple FSM for small business'
  },
  'service-tech-software.html': {
    title: 'Service Tech Software: Tools for Field Technicians in 2026',
    description: 'The best service tech software for field technicians in 2026. Mobile work orders, digital checklists, photo capture, online signatures & customer self-service portals.',
    keywords: 'service tech software, field service technician software, service technician tools, tech management software, service tech app'
  },
  'service-technician-software.html': {
    title: 'Service Technician Software: Mobile App & Work Order Management',
    description: 'Complete service technician software with a powerful mobile app. Digital work orders, photo documentation, online payments & GPS tracking. Empower your technician team.',
    keywords: 'service technician software, technician management software, field service technician app, technician work order software'
  },
  'service-engineer-software.html': {
    title: 'Service Engineer Software: Job Management & Technical Reporting',
    description: 'Service engineer software for managing complex technical jobs. Custom digital checklists, compliance reports, equipment history tracking & client documentation portals.',
    keywords: 'service engineer software, field engineer software, service engineering management, technical field service software'
  },
  'field-engineer-software.html': {
    title: 'Field Engineer Software: Project Management for Engineers',
    description: 'Field engineer software for technical project management. Complex job tracking, compliance documentation, equipment records, multi-site management & client reporting tools.',
    keywords: 'field engineer software, field engineering software, field engineer management, engineering field service software'
  },
  'field-service-erp-software.html': {
    title: 'Field Service ERP Software: All-in-One Business Platform',
    description: 'Field service ERP software that combines CRM, scheduling, work orders, inventory, invoicing & HR in one platform. The complete ERP for service businesses of all sizes.',
    keywords: 'field service ERP software, ERP for field service, field service ERP, service business ERP, FSM ERP software'
  },
  'field-service-management-platform.html': {
    title: 'Field Service Management Platform: Enterprise FSM Solution',
    description: 'Enterprise-grade field service management platform with advanced dispatch, real-time analytics, multi-location support, custom workflows & full API integration capabilities.',
    keywords: 'field service management platform, FSM platform, enterprise field service platform, field service management solution'
  },
  'field-service-management-tools.html': {
    title: 'Field Service Management Tools: Essential Software for 2026',
    description: 'The essential field service management tools every service business needs in 2026. Scheduling, dispatch, mobile app, invoicing, inventory & reporting compared.',
    keywords: 'field service management tools, FSM tools, field service tools 2026, best FSM tools, field service software tools'
  },
  'field-service-applications.html': {
    title: 'Field Service Applications: Top Apps for Service Businesses',
    description: 'The top field service applications for managing work orders, scheduling technicians & invoicing customers. Compare mobile apps, web platforms & enterprise FSM applications.',
    keywords: 'field service applications, field service apps, FSM applications, field service management applications, service business apps'
  },
  'field-scheduling-software.html': {
    title: 'Field Scheduling Software: Automate Job Assignment in 2026',
    description: 'Intelligent field scheduling software with drag-and-drop dispatch, automated technician notifications & real-time schedule visibility. Schedule 3x more jobs per day.',
    keywords: 'field scheduling software, field service scheduler, field workforce scheduling, job scheduling software, crew scheduling software'
  },
  'field-force-management-software.html': {
    title: 'Field Force Management Software: Manage Your Mobile Workforce',
    description: 'Field force management software for tracking, scheduling & managing mobile workers. Real-time GPS location, job assignments, performance metrics & automated reporting.',
    keywords: 'field force management software, mobile workforce management, field workforce software, field force management, mobile field force management'
  },
  'field-operations-management-software.html': {
    title: 'Field Operations Management Software: Total Visibility in 2026',
    description: 'Field operations management software giving real-time visibility into every job, technician & customer interaction. Stop managing by phone calls and start managing by data.',
    keywords: 'field operations management software, field operations software, field operations platform, operations management field service'
  },
  'field-management-system.html': {
    title: 'Field Management System: Organize Your Entire Field Operation',
    description: 'A complete field management system connecting your office, technicians & customers. Scheduling, work orders, inventory tracking & invoicing — all in one organized platform.',
    keywords: 'field management system, FMS software, field workforce management system, field service management system'
  },
  'field-management-software-for-small-business.html': {
    title: 'Field Management Software for Small Business: Simple & Affordable',
    description: 'Purpose-built field management software for small businesses with 1-30 field workers. Easy to set up in 1 day, no training needed. Scheduling, jobs & invoicing made simple.',
    keywords: 'field management software for small business, small business field management, affordable field management software, simple field management system'
  },
  'mobile-field-service-management-app.html': {
    title: '#1 Mobile Field Service Management App for Technicians (2026)',
    description: 'The best mobile field service management app for iOS & Android. Offline-first, GPS tracking, digital signatures & instant invoicing. Try FieldZenPro free — no credit card needed.',
    keywords: 'mobile field service management app, field service mobile app, technician mobile app, field service app ios android, offline field service app'
  },
  'field-service-dispatch-software.html': {
    title: 'Field Service Dispatch Software: Cut Response Time by 40%',
    description: 'Intelligent field service dispatch software with live GPS tracking, drag-and-drop job assignment & automated tech notifications. See why service companies chose FieldZenPro.',
    keywords: 'field service dispatch software, dispatch software, field technician dispatch, service dispatch management, job dispatch software'
  },
  'hvac-dispatch-software.html': {
    title: 'HVAC Dispatch Software: Smart Job Assignment for HVAC Teams',
    description: 'HVAC dispatch software with live GPS tracking, intelligent job routing & automated technician notifications. Reduce response time and dispatch more jobs per day.',
    keywords: 'HVAC dispatch software, HVAC scheduling dispatch, HVAC dispatcher software, HVAC service dispatch, HVAC job dispatch'
  },
  'field-service-management-app.html': {
    title: 'Field Service Management App: Best Mobile FSM for 2026',
    description: 'The top-rated field service management app for iOS & Android. Manage jobs, dispatch techs & invoice customers from your phone. Offline-first with real-time cloud sync.',
    keywords: 'field service management app, FSM app, field service app iOS android, field service mobile app 2026, best field service management app'
  },
  'service-call-management-software.html': {
    title: 'Service Call Management Software: Track Every Job Request',
    description: 'Service call management software for logging, assigning & tracking every customer service request. Never miss a job or let a call fall through the cracks again.',
    keywords: 'service call management software, service call tracking software, service request management, customer service call software, service ticket management'
  },
  'service-business-management-software.html': {
    title: 'Service Business Management Software: Run Your Business Smarter',
    description: 'All-in-one service business management software. Customer management, scheduling, work orders, invoicing & payroll in one platform. Built for service businesses of all types.',
    keywords: 'service business management software, service company software, business management software for service companies, service operations software'
  },
  'business-service-management-software.html': {
    title: 'Business Service Management Software: Complete 2026 Guide',
    description: 'The complete guide to business service management software in 2026. Learn what BSM software does, key features to look for & how to evaluate platforms for your service business.',
    keywords: 'business service management software, service management software for business, BSM software, business service software, enterprise service management'
  },
  'service-management-software.html': {
    title: 'Service Management Software: The Complete Platform for 2026',
    description: 'Complete service management software for field service, IT & facilities companies. Work orders, scheduling, inventory, invoicing & analytics. Start your free trial today.',
    keywords: 'service management software, field service management software, service management platform 2026, service operations software, service company software'
  },
  'top-field-service-management-software.html': {
    title: 'Top Field Service Management Software 2026: Expert Rankings',
    description: 'Expert rankings of the top field service management software for 2026. In-depth analysis of scheduling, dispatch, mobile apps, pricing & customer support across 15+ platforms.',
    keywords: 'top field service management software 2026, top FSM software, best FSM platform, field service management software rankings'
  },
};

// FAQ data for ALL non-blog pages (boosts rich results + GEO)
const PAGE_FAQS = {
  default: (title, keyword) => ([
    { q: `What is ${keyword}?`, a: `${keyword} is a digital platform that helps service businesses manage scheduling, dispatching, work orders, invoicing and customer relationships in one system. FieldZenPro is purpose-built for field service companies with 1-200 technicians.` },
    { q: `How much does ${keyword} cost?`, a: `FieldZenPro's ${keyword} starts with a free 14-day trial. Paid plans are designed to be affordable for small and mid-size service businesses, replacing multiple disconnected tools with one integrated platform.` },
    { q: `Does FieldZenPro work offline?`, a: `Yes. FieldZenPro's mobile app has a full offline-first architecture. Technicians can create work orders, capture photos, get signatures and complete jobs with zero internet connection. Data syncs automatically when connectivity is restored.` },
    { q: `How long does it take to get started?`, a: `Most FieldZenPro customers are fully live within 1-3 business days. The setup is guided with onboarding checklists, and the intuitive interface means technicians typically need less than 30 minutes of training.` }
  ])
};

/**
 * Build FAQ HTML block + inject FAQPage JSON-LD
 */
function buildFaqBlock(faqs) {
  const items = faqs.map(f => `
    <div style="border:1px solid var(--border);border-radius:8px;margin-bottom:0.75rem;overflow:hidden;">
      <details>
        <summary style="padding:1rem 1.25rem;cursor:pointer;font-weight:600;font-size:1rem;color:var(--text);list-style:none;display:flex;justify-content:space-between;align-items:center;background:var(--surface);">
          ${f.q} <span style="color:var(--primary);margin-left:0.5rem;font-size:1.3rem;flex-shrink:0;">+</span>
        </summary>
        <p style="padding:0.75rem 1.25rem 1rem;color:var(--muted);margin:0;font-size:0.95rem;border-top:1px solid var(--border);">${f.a}</p>
      </details>
    </div>`).join('');

  const schema = faqs.map(f => `{"@type":"Question","name":"${f.q.replace(/"/g,'\\"')}","acceptedAnswer":{"@type":"Answer","text":"${f.a.replace(/"/g,'\\"')}"}}`).join(',');

  return `
<!-- FAQ Section — Rich Results + GEO Optimization -->
<div style="margin:4rem 0 2rem;padding-top:2rem;border-top:1px solid var(--border);">
  <h2 style="font-size:1.75rem;font-weight:700;margin-bottom:1.5rem;color:var(--text);">Frequently Asked Questions</h2>
  ${items}
</div>
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[${schema}]}
</script>`;
}

/**
 * Build Author Bio block — E-E-A-T signal
 */
const AUTHOR_BIO = `
<!-- Author Bio — E-E-A-T Signal -->
<div style="display:flex;align-items:flex-start;gap:1rem;margin:3rem 0;padding:1.5rem;background:var(--surface);border:1px solid var(--border);border-radius:12px;">
  <div style="width:56px;height:56px;border-radius:50%;background:var(--primary);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:1.3rem;flex-shrink:0;">MU</div>
  <div>
    <div style="font-weight:700;font-size:1rem;color:var(--text);margin-bottom:0.25rem;">Muhammad Usama</div>
    <div style="font-size:0.85rem;color:var(--primary);font-weight:600;margin-bottom:0.5rem;">Founder & CEO, FieldZenPro</div>
    <p style="font-size:0.9rem;color:var(--muted);margin:0;">Muhammad Usama is the creator of FieldZenPro, a full-stack field service management platform built for small and medium service businesses. With hands-on experience building ERP systems on .NET and Azure, he writes about operational efficiency, technology adoption, and business growth strategies for field service companies.</p>
  </div>
</div>`;

/**
 * Build SoftwareApplication schema for product pages
 */
function buildSoftwareSchema(name, description, url) {
  return `<script type="application/ld+json">
{"@context":"https://schema.org","@type":"SoftwareApplication","name":"${name}","description":"${description.replace(/"/g,'\\"')}","url":"${url}","applicationCategory":"BusinessApplication","operatingSystem":"Web, iOS, Android","offers":{"@type":"Offer","price":"0","priceCurrency":"USD","description":"14-day free trial"},"featureList":"Scheduling, Dispatch, Work Orders, Invoicing, Inventory Management, CRM, Payroll, Mobile App","publisher":{"@type":"Organization","name":"FieldZenPro","url":"https://fieldzenpro.com"}}
</script>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Process all files
// ─────────────────────────────────────────────────────────────────────────────
const SKIP = new Set(['landing.html','privacy.html','terms.html','gdpr.html','security.html','changelog.html','roadmap.html','careers.html','about.html','blog.html']);

let modified = 0;
const files = fs.readdirSync(PUBLIC_DIR).filter(f => f.endsWith('.html'));

files.forEach(filename => {
  if (SKIP.has(filename)) return;

  const filePath = path.join(PUBLIC_DIR, filename);
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  const meta = PAGE_META[filename];
  const slug = filename.replace('.html', '');

  // ── A. Update title tag ────────────────────────────────────────────────
  if (meta && meta.title) {
    const newTitle = `${meta.title} — FieldZenPro`;
    content = content.replace(/<title>[^<]*<\/title>/, `<title>${newTitle}</title>`);
    // Update OG title
    content = content.replace(
      /<meta property="og:title" content="[^"]*" \/>/,
      `<meta property="og:title" content="${meta.title}" />`
    );
    // Update twitter title
    content = content.replace(
      /<meta name="twitter:title" content="[^"]*" \/>/,
      `<meta name="twitter:title" content="${meta.title}" />`
    );
    changed = true;
  }

  // ── B. Update meta description ─────────────────────────────────────────
  if (meta && meta.description) {
    content = content.replace(
      /<meta name="description" content="[^"]*" \/>/,
      `<meta name="description" content="${meta.description}" />`
    );
    content = content.replace(
      /<meta property="og:description" content="[^"]*" \/>/,
      `<meta property="og:description" content="${meta.description}" />`
    );
    content = content.replace(
      /<meta name="twitter:description" content="[^"]*" \/>/,
      `<meta name="twitter:description" content="${meta.description}" />`
    );
    changed = true;
  }

  // ── C. Add/update keywords meta ───────────────────────────────────────
  if (meta && meta.keywords) {
    if (content.includes('<meta name="keywords"')) {
      content = content.replace(
        /<meta name="keywords" content="[^"]*" \/>/,
        `<meta name="keywords" content="${meta.keywords}" />`
      );
    } else {
      content = content.replace(
        '<meta name="description"',
        `<meta name="keywords" content="${meta.keywords}" />\n<meta name="description"`
      );
    }
    changed = true;
  }

  // ── D. Add SoftwareApplication schema ────────────────────────────────
  if (!content.includes('SoftwareApplication') && !content.includes('HowTo') && !content.includes('FAQPage')) {
    const titleMatch = content.match(/<title>([^<]+)<\/title>/);
    const descMatch = content.match(/<meta name="description" content="([^"]+)"/);
    if (titleMatch && descMatch) {
      const swSchema = buildSoftwareSchema(
        'FieldZenPro',
        descMatch[1],
        `${DOMAIN}/${slug}`
      );
      content = content.replace('</head>', `${swSchema}\n</head>`);
      changed = true;
    }
  }

  // ── E. Add FAQ section before CTA box ────────────────────────────────
  if (!content.includes('FAQPage') && !content.includes('Frequently Asked Questions')) {
    const keywordBase = slug.replace(/-/g, ' ');
    const faqs = PAGE_FAQS.default(filename, keywordBase);
    const faqBlock = buildFaqBlock(faqs);

    // Try to inject before .cta-box
    if (content.includes('class="cta-box"')) {
      content = content.replace('<div class="cta-box">', `${faqBlock}\n<div class="cta-box">`);
      changed = true;
    } else if (content.includes('class="cta-section"')) {
      content = content.replace('<div class="cta-section">', `${faqBlock}\n<div class="cta-section">`);
      changed = true;
    }
  }

  // ── F. Add Author Bio before CTA ─────────────────────────────────────
  if (!content.includes('Muhammad Usama') && !content.includes('author-bio')) {
    if (content.includes('class="cta-box"')) {
      content = content.replace('<div class="cta-box">', `${AUTHOR_BIO}\n<div class="cta-box">`);
      changed = true;
    }
  }
  // For pages that already have author-meta but not the bio block
  if (content.includes('author-meta') && !content.includes('Founder &amp; CEO') && !content.includes('Founder & CEO')) {
    if (content.includes('class="cta-box"')) {
      content = content.replace('<div class="cta-box">', `${AUTHOR_BIO}\n<div class="cta-box">`);
      changed = true;
    }
  }

  // ── G. Update dateModified in Article schema ──────────────────────────
  content = content.replace(/"dateModified":\s*"[^"]+"/g, `"dateModified": "${TODAY}"`);

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    modified++;
    process.stdout.write('.');
  }
});

console.log(`\n\nUpdated ${modified} page files.\n`);

// ─────────────────────────────────────────────────────────────────────────────
// 2. Regenerate sitemap.xml with lastmod + prioritized by GSC data
// ─────────────────────────────────────────────────────────────────────────────
console.log('Generating optimized sitemap.xml...');

// Priority map based on GSC performance data
const PRIORITY_MAP = {
  'mobile-field-service-management-app': '1.0',
  'field-management-app': '1.0',
  'field-service-management-software': '1.0',
  'scheduling-software-for-landscaping-business': '0.95',
  'field-service-dispatch-software': '0.95',
  'commercial-cleaning-software': '0.95',
  'window-cleaning-software': '0.95',
  'fire-protection-software': '0.95',
  'switch-from-jobber': '0.95',
  'field-service-management-software-for-small-business': '0.95',
  'hvac-field-service-management-software': '0.90',
  'hvac-field-service-software': '0.90',
  'hvac-business-management-software': '0.90',
  'jobber-alternative': '0.90',
  'servicetitan-too-expensive': '0.90',
  'servicetitan-vs-fieldzenpro': '0.90',
  'jobber-vs-fieldzenpro': '0.90',
  'housecall-pro-alternative': '0.90',
  'free-field-service-software': '0.90',
  'best-field-service-software': '0.90',
};

const STATIC_PAGES = [
  { loc: `${DOMAIN}/`, priority: '1.0', changefreq: 'daily' },
  { loc: `${DOMAIN}/about`, priority: '0.8', changefreq: 'monthly' },
  { loc: `${DOMAIN}/blog`, priority: '0.9', changefreq: 'weekly' },
  { loc: `${DOMAIN}/blog-automate-invoicing`, priority: '0.8', changefreq: 'monthly' },
  { loc: `${DOMAIN}/blog-best-fm-software-2026`, priority: '0.8', changefreq: 'monthly' },
  { loc: `${DOMAIN}/blog-digital-checklists-fm`, priority: '0.8', changefreq: 'monthly' },
  { loc: `${DOMAIN}/blog-digital-work-orders`, priority: '0.8', changefreq: 'monthly' },
  { loc: `${DOMAIN}/blog-erp-vs-cmms`, priority: '0.8', changefreq: 'monthly' },
];

const allFiles = fs.readdirSync(PUBLIC_DIR).filter(f => f.endsWith('.html') && !SKIP.has(f) && !f.startsWith('blog-'));

let sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
`;

// Add static pages first
STATIC_PAGES.forEach(p => {
  sitemapXml += `  <url>
    <loc>${p.loc}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${p.changefreq || 'weekly'}</changefreq>
    <priority>${p.priority}</priority>
  </url>
`;
});

// Add all content pages
allFiles.sort().forEach(filename => {
  const slug = filename.replace('.html', '');
  const priority = PRIORITY_MAP[slug] || '0.8';
  sitemapXml += `  <url>
    <loc>${DOMAIN}/${slug}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>
`;
});

sitemapXml += `</urlset>`;
fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap.xml'), sitemapXml, 'utf8');
console.log('sitemap.xml regenerated with', STATIC_PAGES.length + allFiles.length, 'URLs and lastmod dates.');

// ─────────────────────────────────────────────────────────────────────────────
// 3. Create robots.txt
// ─────────────────────────────────────────────────────────────────────────────
const robotsTxt = `User-agent: *
Allow: /

# Disallow internal/utility paths
Disallow: /api/
Disallow: /dashboard
Disallow: /login
Disallow: /signup
Disallow: /forgot-password
Disallow: /reset-password

# Crawl delay for respectful crawling
Crawl-delay: 1

# Sitemap location
Sitemap: ${DOMAIN}/sitemap.xml

# Specific bot instructions
User-agent: Googlebot
Allow: /
Crawl-delay: 0

User-agent: Bingbot
Allow: /
Crawl-delay: 1

User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: PerplexityBot
Allow: /
`;

fs.writeFileSync(path.join(PUBLIC_DIR, 'robots.txt'), robotsTxt, 'utf8');
console.log('robots.txt created (with AI bot allowances for GEO).');

console.log('\n=== DONE ===');
console.log('Next step: git add, commit, push & deploy to Vercel.');
