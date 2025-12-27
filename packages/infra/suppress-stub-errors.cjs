const fs = require('fs');
const { execSync } = require('child_process');

// List of stub repository files (entities not yet in domain)
const stubLayers = [
  'analytics',
  'automation',
  'commercial',
  'operational',
  'process-mining',
  'studio',
  'temporal',
  'integration'
];

const files = execSync('find database/repositories -name "*.repository.ts"')
  .toString()
  .split('\n')
  .filter(Boolean)
  .filter(f => stubLayers.some(layer => f.includes(`/${layer}/`)));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Add @ts-expect-error before imports from @odin/domain if not already there
  if (!content.includes('@ts-expect-error')) {
    content = content.replace(
      /(import (?:type )?{[^}]+}\s+from\s+"@odin\/domain";)/,
      '// @ts-expect-error - Stub repository: domain entities not yet implemented\n$1'
    );

    fs.writeFileSync(file, content);
  }
});

console.log(`Added @ts-expect-error to ${files.length} stub repositories`);
