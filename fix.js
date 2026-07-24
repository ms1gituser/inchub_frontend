/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.resolve(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk(path.join(__dirname, 'src/app'));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes("currentBrand === 'IncHub Financial'")) {
    content = content.replace(/currentBrand === 'IncHub Financial'/g, "currentBrand === 'financial'");
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed', file);
  }
});
