#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

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

for (const file of repoFiles) {
  console.log(`Fixing ${file}...`);
  let content = fs.readFileSync(file, 'utf8');

  // Fix manual pagination destructuring
  content = content.replace(
    /const limit = (?:options|request)\?\.limit \|\| (\d+);\s*const offset = (?:options|request)\?\.offset \|\| 0;/g,
    'const { limit, offset } = Pagination.toOffset($1);'
      .replace('$1', content.includes('request') ? 'request' : 'options')
  );

  // Simpler pattern for each file
  if (content.includes('const limit =') && content.includes('const offset =')) {
    content = content.replace(
      /(const limit = (?:options|request)\?\.limit \|\| \d+;)\s*(const offset = (?:options|request)\?\.offset \|\| 0;)/g,
      (match, limit, offset) => {
        const varName = match.includes('request') ? 'request' : 'options';
        return `const { limit, offset } = Pagination.toOffset(${varName});`;
      }
    );
  }

  // Fix manual PageResponse construction with items field
  content = content.replace(
    /return \{\s*success: true,\s*data: \{\s*items,\s*total,\s*limit,\s*offset,\s*hasMore:[^}]+\},\s*\};/gs,
    (match) => {
      // Extract variable name for items
      return `const result = Pagination.buildResponse(items, total, ${content.includes('request') ? 'request' : 'options'});\n      return { success: true, data: result };`;
    }
  );

  // Fix FORBIDDEN error code
  content = content.replace(/'FORBIDDEN'/g, "'INSUFFICIENT_PERMISSIONS'");

  // Fix "items" variable to "data" in map operations - but be careful not to break actual items
  // Only fix in context of pagination responses

  fs.writeFileSync(file, content, 'utf8');
  console.log(`  ✓ Fixed ${file}`);
}

console.log(`\nAll ${repoFiles.length} files processed!`);
