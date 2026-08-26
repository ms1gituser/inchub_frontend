const fs = require('fs');
const ExcelJS = require('exceljs');
async function read() {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile('d:/mahesh/CRM BLUEPRINT (1).xlsx');
  const sheets = ['🟧 Accounting Sales', '🟪 Accounting Operations', '🤖 AI Doc Processing', '🤖 AI Chatbot Module'];
  for (const s of sheets) {
    const ws = wb.getWorksheet(s);
    if (!ws) {
        console.log("Not found:", s);
        continue;
    }
    let out = `--- ${s} ---\n`;
    ws.eachRow((r) => {
      const vals = Array.isArray(r.values) ? r.values.slice(1) : [];
      const rowText = vals.map(v => {
          if (v && v.richText) return v.richText.map(rt => rt.text).join('');
          return v;
      }).join(' | ');
      out += rowText + '\n';
    });
    console.log(out.substring(0, 500) + '...');
    fs.writeFileSync('d:/mahesh/CRM_Frontend/' + s.replace(/[^a-zA-Z]/g, '') + '.txt', out, 'utf8');
  }
}
read();
