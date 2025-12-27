#!/usr/bin/env node
/**
 * Comprehensive fix for all new repository errors
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing all new repository errors...\n');

let fixed = 0;

// ====================================
// Fix 1: Update database/index.ts to use -repository.ts instead of .repository.ts
// ====================================
const indexPath = './database/index.ts';
let indexContent = fs.readFileSync(indexPath, 'utf8');

// Fix the import paths
indexContent = indexContent
  .replace(/\.repository'/g, '-repository\'')
  .replace(/\.repository"/g, '-repository"');

fs.writeFileSync(indexPath, indexContent);
console.log('✓ Fixed database/index.ts import paths');
fixed++;

// ====================================
// Fix 2: Update repository-factory.ts
// ====================================
const factoryPath = './database/repository-factory.ts';
let factoryContent = fs.readFileSync(factoryPath, 'utf8');

factoryContent = factoryContent
  .replace(/\.repository/g, '-repository');

fs.writeFileSync(factoryPath, factoryContent);
console.log('✓ Fixed repository-factory.ts import paths');
fixed++;

// ====================================
// Fix 3: Fix all new repository files
// ====================================
const layers = ['commercial', 'operational', 'temporal', 'integration', 'process-mining'];

for (const layer of layers) {
  const layerPath = `./database/repositories/${layer}`;
  if (!fs.existsSync(layerPath)) continue;

  const files = fs.readdirSync(layerPath).filter(f => f.endsWith('-repository.ts'));

  for (const file of files) {
    const filePath = path.join(layerPath, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // Fix 1: Replace crypto.randomUUID() with globalThis.crypto.randomUUID()
    if (content.includes('crypto.randomUUID()') && !content.includes('globalThis.crypto.randomUUID()')) {
      content = content.replace(/(?<!globalThis\.)crypto\.randomUUID\(\)/g, 'globalThis.crypto.randomUUID()');
      changed = true;
    }

    // Fix 2: Fix async/await issues - make update method async
    if (content.includes('return await this.findById') && !content.match(/async update\(/)) {
      content = content.replace(/(\s+)update\(/, '$1async update(');
      changed = true;
    }

    // Fix 3: Fix return type - ensure we return Promise for AsyncResult
    // Replace patterns like: return await this.findById(...) as AsyncResult<X>
    content = content.replace(/return await this\.findById\(([^)]+)\) as AsyncResult<([^>]+)>/g,
      (match, p1, p2) => `const result = await this.findById(${p1});\n      return result as AsyncResult<${p2}>`
    );

    if (changed) {
      fs.writeFileSync(filePath, content);
      console.log(`✓ Fixed ${layer}/${file}`);
      fixed++;
    }
  }
}

console.log(`\n✅ Applied ${fixed} fixes!`);
console.log('\n📝 Next steps:');
console.log('1. Build domain package: cd ../domain && pnpm typecheck');
console.log('2. Run typecheck again: pnpm typecheck');
console.log('3. Use bulk-fix-all-errors.cjs for remaining errors');
