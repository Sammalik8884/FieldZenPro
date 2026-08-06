const fs=require('fs'),path=require('path');
const files=['field-tech-scheduling-software.html','servicetitan-too-expensive.html','switch-from-jobber.html','field-scheduling-software.html','enterprise-field-service-management-software.html','field-service-erp-software.html','best-field-service-management-software.html'];
files.forEach(f=>{
  const html=fs.readFileSync(path.join('frontend','public',f),'utf8');
  const title=(html.match(/<title>([\s\S]*?)<\/title>/i)||['',''])[1].trim();
  const h1=(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)||['',''])[1].replace(/<[^>]+>/g,'').trim();
  const text=html.replace(/<script[\s\S]*?<\/script>/gi,'').replace(/<style[\s\S]*?<\/style>/gi,'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
  const wc=text.split(' ').filter(w=>w.length>2).length;
  const h2s=(html.match(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)||[]).map(h=>h.replace(/<[^>]+>/g,'').trim());
  console.log('\n'+f+' ('+wc+'w)');
  console.log('  TITLE: '+title);
  console.log('  H1: '+h1);
  console.log('  H2s: '+h2s.join(' | '));
});
