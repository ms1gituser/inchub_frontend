const ExcelJS = require('exceljs');

async function readExcel() {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile('c:/Users/user/Desktop/Maheshh/CRM BLUEPRINT (1) (1).xlsx');
    
    // Find the Client Portal sheet regardless of emoji
    const worksheet = workbook.worksheets.find(sheet => sheet.name.includes('Client Portal'));
    if (!worksheet) {
      console.error('Sheet not found. Available sheets:', workbook.worksheets.map(s => s.name));
      process.exit(1);
    }
    
    // Convert worksheet rows to standard 0-indexed arrays
    const data = [];
    worksheet.eachRow({ includeEmpty: true }, (row) => {
      const rowValues = [];
      // row.values is 1-indexed (index 0 is empty). We extract cell values.
      const vals = Array.isArray(row.values) ? row.values : [];
      for (let i = 1; i < vals.length; i++) {
        const val = vals[i];
        // Handle RichText objects or object cell values if any
        if (val && typeof val === 'object' && val.richText) {
          rowValues.push(val.richText.map(t => t.text).join(''));
        } else if (val && typeof val === 'object' && val.result !== undefined) {
          rowValues.push(val.result);
        } else {
          rowValues.push(val !== undefined ? val : null);
        }
      }
      data.push(rowValues);
    });
    
    // Print header and first 20 rows
    console.log("Headers:");
    console.log(data[2]);
    
    console.log("\nData:");
    for(let i = 3; i < data.length && i < 25; i++) {
      const row = data[i];
      if (row && row.length > 0) {
        console.log(`[${i}] ${row[0]} | ${row[1]} | Tooltip: ${row[9] || row[8]}`);
        // Log the full row to be sure
        console.log(JSON.stringify(row));
      }
    }
  } catch (error) {
    console.error("Error reading excel:", error);
  }
}

readExcel();
