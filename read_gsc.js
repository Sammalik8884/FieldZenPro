const XLSX = require('xlsx');

const wb = XLSX.readFile('https___fieldzenpro.com_-Performance-on-Search-2026-06-24.xlsx');
console.log('Sheets:', wb.SheetNames);

wb.SheetNames.forEach(name => {
  const ws = wb.Sheets[name];
  const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
  console.log('\n\n===========================================');
  console.log('Sheet:', name, '| Total rows:', data.length);
  console.log('===========================================');
  data.slice(0, 50).forEach((row, i) => console.log(`Row ${i}:`, JSON.stringify(row)));
});
