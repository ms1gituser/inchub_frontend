const xlsx = require('xlsx');

try {
  const workbook = xlsx.readFile('c:/Users/user/Desktop/Maheshh/CRM BLUEPRINT (1) (1).xlsx');
  
  // Find the Client Portal sheet regardless of emoji
  const sheetName = workbook.SheetNames.find(n => n.includes('Client Portal'));
  if (!sheetName) {
    console.error('Sheet not found. Available sheets:', workbook.SheetNames);
    process.exit(1);
  }
  
  const worksheet = workbook.Sheets[sheetName];
  
  // Convert to JSON
  // Header is probably row 3 (skip 2 rows)
  const data = xlsx.utils.sheet_to_json(worksheet, { header: 1, blankrows: false });
  
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
