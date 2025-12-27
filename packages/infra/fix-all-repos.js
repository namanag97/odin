#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

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

console.log(`Found ${repoFiles.length} repository files`);

for (const file of repoFiles) {
  console.log(`Fixing ${file}...`);
  let content = fs.readFileSync(file, 'utf8');

  // 1. Add Pagination import if using pagination
  if (content.includes('PageRequest') && !content.includes('Pagination')) {
    content = content.replace(
      /import.*from "\.\.\/\.\.\/types";/,
      match => match.replace('} from', ', Pagination } from')
    );
  }

  // 2. Fix pagination pattern - replace manual offset calculation
  content = content.replace(
    /const limit = request\?\.limit \|\| 20;\s*const offset = request\?\.offset \|\| 0;/g,
    'const { limit, offset } = Pagination.toOffset(request);'
  );

  // 3. Fix PageResponse construction - replace manual object with Pagination.buildResponse
  content = content.replace(
    /return \{\s*success: true,\s*data: \{\s*(items|data): data\.map\([^}]+\),\s*page: request\?\.page \|\| 1,\s*limit,\s*total: totalCount,\s*totalPages: Math\.ceil\(totalCount \/ limit\),\s*hasNext: [^,]+,\s*hasPrev: [^}]+\s*\},\s*\};/gs,
    (match) => {
      const dataMapping = match.match(/data\.map\([^)]+\)/)[0];
      return `const result = Pagination.buildResponse(${dataMapping}, totalCount, request);\n      return { success: true, data: result };`;
    }
  );

  // 4. Fix AsyncResult return type issues - remove "as AsyncResult"
  content = content.replace(/ as AsyncResult<[^>]+>/g, '');

  // 5. Fix row parameter types
  content = content.replace(/\(row\) =>/g, '(row: any) =>');

  fs.writeFileSync(file, content, 'utf8');
  console.log(`  ✓ Fixed ${file}`);
}

console.log(`\nAll ${repoFiles.length} files fixed!`);
