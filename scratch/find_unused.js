const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'backend', 'services');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));

files.forEach(file => {
  const content = fs.readFileSync(path.join(dir, file), 'utf-8');
  const requireRegex = /const (?:\{?[\w\s,]+\}?)? *([\w\d_]+) *= *require\([^)]+\);?/g;
  let match;
  while ((match = requireRegex.exec(content)) !== null) {
    const varName = match[1].trim();
    // Count occurrences of the varName in the file
    // Need to match exact word boundary
    const regex = new RegExp(`\\b${varName}\\b`, 'g');
    const count = (content.match(regex) || []).length;
    if (count === 1) {
       console.log(`Unused import in ${file}: ${varName}`);
    }
  }
});
