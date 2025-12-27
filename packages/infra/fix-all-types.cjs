const fs = require('fs');
const path = require('path');

console.log('🔧 Bulk Type Error Fixer\n');

// Find all repository files
const repoFiles = [];
function findRepos(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      findRepos(fullPath);
    } else if (file.endsWith('.repository.ts')) {
      repoFiles.push(fullPath);
    }
  }
}

findRepos('./database/repositories');

let totalFixes = 0;

for (const file of repoFiles) {
  let content = fs.readFileSync(file, 'utf8');
  let fixes = 0;

  // 1. Fix domain imports - use main package export
  const domainImportRegex = /import\s+(?:type\s+)?\{([^}]+)\}\s+from\s+["']@odin\/domain\/(?:entities|repositories)\/[^"']+["'];/g;
  const matches = Array.from(content.matchAll(domainImportRegex));

  if (matches.length > 0) {
    // Collect all imports
    const allImports = new Set();
    let hasTypeImport = false;

    matches.forEach(match => {
      if (match[0].includes('import type')) {
        hasTypeImport = true;
      }
      const imports = match[1].split(',').map(s => s.trim());
      imports.forEach(imp => allImports.add(imp));
    });

    // Remove old imports
    content = content.replace(domainImportRegex, '');

    // Add consolidated import after core-contracts import
    const consolidatedImport = hasTypeImport
      ? `import type {\n  ${Array.from(allImports).join(',\n  ')}\n} from "@odin/domain";\n`
      : `import {\n  ${Array.from(allImports).join(',\n  ')}\n} from "@odin/domain";\n`;

    const coreContractsImportPos = content.indexOf('from "@odin/core-contracts";');
    if (coreContractsImportPos > 0) {
      const insertPos = content.indexOf('\n', coreContractsImportPos) + 1;
      content = content.slice(0, insertPos) + consolidatedImport + content.slice(insertPos);
      fixes++;
    }
  }

  // 2. Add Pagination import if missing but used
  if (content.includes('Pagination.') && !content.includes('import.*Pagination')) {
    content = content.replace(
      /from "\.\.\/\.\.\/types";/,
      'from "../../types";\nimport { Pagination } from "../../types";'
    );
    fixes++;
  }

  // 3. Fix crypto usage - use globalThis with cast
  content = content.replace(
    /\bcrypto\.randomUUID\(\)/g,
    '(globalThis as any).crypto.randomUUID()'
  );
  if (content.includes('globalThis')) fixes++;

  // 4. Fix FORBIDDEN error code
  if (content.includes('"FORBIDDEN"')) {
    content = content.replace(/"FORBIDDEN"/g, '"INSUFFICIENT_PERMISSIONS"');
    fixes++;
  }

  // 5. Fix "Expected 1 arguments, but got 2" for createNotFoundError
  // This usually means passing extra context parameter
  content = content.replace(
    /createNotFoundError\(([^,]+),\s*[^)]+\)/g,
    'createNotFoundError($1)'
  );

  if (fixes > 0) {
    fs.writeFileSync(file, content);
    console.log(`✅ ${file} (${fixes} fixes)`);
    totalFixes += fixes;
  }
}

console.log(`\n🎉 Applied ${totalFixes} fixes across ${repoFiles.length} files!`);

// Also fix any remaining issues in other files
console.log('\n🔧 Fixing connection.ts and other core files...');

// Fix connection.ts crypto usage
const connectionFile = './database/connection.ts';
if (fs.existsSync(connectionFile)) {
  let content = fs.readFileSync(connectionFile, 'utf8');
  const before = content.length;
  content = content.replace(/\bcrypto\.randomUUID\(\)/g, '(globalThis as any).crypto.randomUUID()');
  if (content.length !== before) {
    fs.writeFileSync(connectionFile, content);
    console.log('✅ Fixed connection.ts');
  }
}

console.log('\n✨ All fixes complete!');
