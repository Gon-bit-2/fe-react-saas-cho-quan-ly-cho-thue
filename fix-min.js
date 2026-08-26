const fs = require('fs');
const path = require('path');

function findFiles(dir, files = []) {
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      findFiles(fullPath, files);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.jsx')) {
      files.push(fullPath);
    }
  }
  return files;
}

const files = findFiles(path.join(__dirname, 'src'));

let modifiedCount = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let lines = content.split('\n');
  let modified = false;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('type="number"') && !lines[i].includes('min=')) {
      lines[i] = lines[i].replace('type="number"', 'type="number" min="0"');
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(file, lines.join('\n'), 'utf8');
    modifiedCount++;
    console.log(`Updated ${file}`);
  }
}

console.log(`Total files modified: ${modifiedCount}`);
