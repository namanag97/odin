const fs = require('fs');
const {execSync} = require('child_process');

// Find all repo files
const files = execSync('find database/repositories -name "*.repository.ts"').toString().split('\n').filter(Boolean);

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  const fixed = lines.filter(line => !/^\s*,\s*$/.test(line));
  fs.writeFileSync(file, fixed.join('\n'));
});

console.log(`Fixed ${files.length} files`);
