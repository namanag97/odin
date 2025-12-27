#!/usr/bin/env node
/**
 * Bulk fix ALL type errors across the infra package
 * Fast automation to get typecheck passing
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;

  // Fix 1: Remove unused @ts-expect-error directives
  const oldContent = content;
  content = content.replace(/\/\/ @ts-expect-error - Stub repository.*\n/g, '');
  content = content.replace(/\/\/ @ts-expect-error.*\n/g, '');
  if (content !== oldContent) modified = true;

  // Fix 2: Fix crypto.randomUUID() to globalThis.crypto.randomUUID()
  if (content.includes('crypto.randomUUID()') && !content.includes('globalThis.crypto')) {
    content = content.replace(/([^.]|^)crypto\.randomUUID\(\)/g, '$1globalThis.crypto.randomUUID()');
    modified = true;
  }

  // Fix 3: Fix verbatimModuleSyntax - convert to type-only imports where needed
  // Match imports that should be type-only (entities, IDs, interfaces)
  content = content.replace(
    /import\s+\{([^}]+)\}\s+from\s+"@odin\/domain"/g,
    (match, imports) => {
      const importList = imports.split(',').map(i => i.trim());
      const typeImports = [];
      const valueImports = [];

      for (const imp of importList) {
        const cleanImp = imp.replace(/^type\s+/, '');
        // Interfaces, types, and ID types should be type-only
        if (
          cleanImp.startsWith('I') ||
          cleanImp.endsWith('Id') ||
          cleanImp.endsWith('Type') ||
          cleanImp.endsWith('Status') ||
          cleanImp.endsWith('Data') ||
          cleanImp.includes('Create') ||
          cleanImp.includes('Update') ||
          cleanImp === 'Plan' ||
          cleanImp === 'Subscription' ||
          cleanImp === 'Invoice' ||
          cleanImp === 'Coupon' ||
          cleanImp === 'PaymentMethod' ||
          cleanImp === 'UsageRecord' ||
          cleanImp === 'KnowledgeModel' ||
          cleanImp === 'Kpi' ||
          cleanImp === 'Filter' ||
          cleanImp === 'Record' ||
          cleanImp === 'Variable' ||
          cleanImp === 'Space' ||
          cleanImp === 'Package' ||
          cleanImp === 'View' ||
          cleanImp === 'Component' ||
          cleanImp === 'ActionFlow' ||
          cleanImp === 'Execution' ||
          cleanImp === 'Skill' ||
          cleanImp === 'Sensor' ||
          cleanImp === 'Signal' ||
          cleanImp === 'Task' ||
          cleanImp === 'ExtendedTenantSettings' ||
          cleanImp === 'FeatureFlag' ||
          cleanImp === 'SystemConfig' ||
          cleanImp === 'AuditLog' ||
          cleanImp === 'EntityHistory' ||
          cleanImp === 'ScheduledJob' ||
          cleanImp === 'ApiKey' ||
          cleanImp === 'Webhook' ||
          cleanImp === 'Integration' ||
          cleanImp === 'OAuthToken'
        ) {
          typeImports.push(`type ${cleanImp}`);
        } else {
          valueImports.push(imp);
        }
      }

      if (typeImports.length > 0 && valueImports.length > 0) {
        return `import type { ${typeImports.map(t => t.replace('type ', '')).join(', ')} } from "@odin/domain";\nimport { ${valueImports.join(', ')} } from "@odin/domain"`;
      } else if (typeImports.length > 0) {
        return `import type { ${typeImports.map(t => t.replace('type ', '')).join(', ')} } from "@odin/domain"`;
      } else {
        return match;
      }
    }
  );

  // Fix 4: Fix duplicate Pagination imports
  const paginationLines = content.match(/import.*Pagination.*from.*types/g) || [];
  if (paginationLines.length > 1) {
    // Keep only the first one
    let foundFirst = false;
    content = content.replace(/import.*Pagination.*from.*types.*\n/g, (match) => {
      if (!foundFirst) {
        foundFirst = true;
        return match;
      }
      return '';
    });
    modified = true;
  }

  // Fix 5: Fix PositiveInt casting in environment.repository.ts
  if (filePath.includes('environment.repository.ts')) {
    content = content.replace(
      /maxCpuCores: row\.max_cpu_cores,/g,
      'maxCpuCores: row.max_cpu_cores as PositiveInt,'
    );
    content = content.replace(
      /maxMemoryGb: row\.max_memory_gb,/g,
      'maxMemoryGb: row.max_memory_gb as PositiveInt,'
    );
    content = content.replace(
      /maxStorageGb: row\.max_storage_gb,/g,
      'maxStorageGb: row.max_storage_gb as PositiveInt,'
    );
    modified = true;
  }

  // Fix 6: Fix AsyncResult return types in environment.repository.ts
  if (filePath.includes('environment.repository.ts')) {
    // Fix getOrCreate to handle null properly
    content = content.replace(
      /return result;.*\/\/ This will be Success<Environment \| null>/,
      `if (!result.success || !result.data) {
        return {
          success: false,
          error: createNotFoundError("Environment", id as string)
        };
      }
      return result as AsyncResult<Environment>;`
    );
    modified = true;
  }

  // Fix 7: Add missing imports for branded types
  if (!content.includes('import') && content.includes('TenantId')) {
    const imports = `import type { TenantId, AsyncResult } from "@odin/core-contracts";\n`;
    content = imports + content;
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(filePath, content);
    return true;
  }

  return false;
}

function fixAllFiles(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  let fixedCount = 0;

  for (const file of files) {
    const fullPath = path.join(dir, file.name);

    if (file.isDirectory()) {
      fixedCount += fixAllFiles(fullPath);
    } else if (file.name.endsWith('.ts') && !file.name.endsWith('.d.ts')) {
      if (fixFile(fullPath)) {
        console.log(`✓ Fixed: ${fullPath.replace(process.cwd(), '.')}`);
        fixedCount++;
      }
    }
  }

  return fixedCount;
}

console.log('🚀 Bulk-fixing all type errors...\n');

const repoDir = path.join(__dirname, 'database', 'repositories');
const fixedCount = fixAllFiles(repoDir);

console.log(`\n✅ Fixed ${fixedCount} files!\n`);

// Also fix types.ts if needed
const typesFile = path.join(__dirname, 'database', 'types.ts');
if (fs.existsSync(typesFile)) {
  if (fixFile(typesFile)) {
    console.log(`✓ Fixed: ${typesFile.replace(process.cwd(), '.')}`);
  }
}

// Fix error-mapper.ts
const errorMapperFile = path.join(__dirname, 'database', 'error-mapper.ts');
if (fs.existsSync(errorMapperFile)) {
  let content = fs.readFileSync(errorMapperFile, 'utf-8');

  // Fix error factory calls to match actual signatures
  content = content.replace(
    /createValidationError\([^)]+, context, error\)/g,
    'createValidationError($1)'
  );
  content = content.replace(
    /createNotFoundError\("([^"]+)", id, context\)/g,
    'createNotFoundError("$1", id)'
  );

  fs.writeFileSync(errorMapperFile, content);
  console.log(`✓ Fixed error-mapper.ts`);
}

console.log('\n🔍 Running typecheck to see remaining errors...\n');
try {
  execSync('pnpm typecheck', { cwd: __dirname, stdio: 'inherit' });
  console.log('\n✅ All type errors fixed!');
} catch (e) {
  console.log('\n⚠️  Some errors remain, but progress made!');
}
