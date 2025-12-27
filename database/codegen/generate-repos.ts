/**
 * Repository Generator
 * Generates CRUD repository scaffolds from introspected schema
 */

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { introspectSchema, type ColumnDef, type TableDef } from "./introspect-schema";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = resolve(__dirname, "../generated/repos");

// Convert snake_case to PascalCase
function toPascalCase(str: string): string {
  return str
    .split("_")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("");
}

// Convert snake_case to camelCase
function toCamelCase(str: string): string {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

// Check if table has tenant_id column
function hasTenantId(table: TableDef): boolean {
  return table.columns.some(col => col.name === "tenant_id");
}

// Get primary key column(s)
function getPrimaryKey(table: TableDef): string[] {
  return table.primaryKey.length > 0 
    ? table.primaryKey 
    : table.columns.filter(c => c.isPrimaryKey).map(c => c.name);
}

// Generate base repository
function generateBaseRepository(): string {
  return `/**
 * Base Repository
 * Provides common CRUD operations for all entities
 */

import { Database } from "bun:sqlite";

export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDir?: "asc" | "desc";
}

export interface BaseRepository<T, TInsert, TUpdate> {
  findById(id: string, tenantId?: string): T | null;
  findAll(tenantId?: string, options?: QueryOptions): T[];
  create(data: TInsert): T;
  update(id: string, data: TUpdate, tenantId?: string): T | null;
  delete(id: string, tenantId?: string): boolean;
  count(tenantId?: string): number;
}

export function createBaseQueries(tableName: string, hasTenant: boolean) {
  const tenantFilter = hasTenant ? "tenant_id = ?" : "";
  
  return {
    selectById: hasTenant 
      ? \`SELECT * FROM \${tableName} WHERE id = ? AND tenant_id = ?\`
      : \`SELECT * FROM \${tableName} WHERE id = ?\`,
    
    selectAll: (options: QueryOptions = {}) => {
      const { limit, offset, orderBy, orderDir = "asc" } = options;
      let sql = \`SELECT * FROM \${tableName}\`;
      if (hasTenant) sql += " WHERE tenant_id = ?";
      if (orderBy) sql += \` ORDER BY \${orderBy} \${orderDir.toUpperCase()}\`;
      if (limit) sql += \` LIMIT \${limit}\`;
      if (offset) sql += \` OFFSET \${offset}\`;
      return sql;
    },
    
    count: hasTenant
      ? \`SELECT COUNT(*) as count FROM \${tableName} WHERE tenant_id = ?\`
      : \`SELECT COUNT(*) as count FROM \${tableName}\`,
    
    deleteById: hasTenant
      ? \`DELETE FROM \${tableName} WHERE id = ? AND tenant_id = ?\`
      : \`DELETE FROM \${tableName} WHERE id = ?\`,
  };
}
`;
}

// Generate repository for a table
function generateRepository(table: TableDef): string {
  const typeName = toPascalCase(table.name);
  const tableName = table.name;
  const hasTenant = hasTenantId(table);
  const pk = getPrimaryKey(table);
  const fileName = table.name.replace(/_/g, "-");
  
  // Columns for insert (excluding auto-generated)
  const insertColumns = table.columns.filter(col => {
    if (col.name === "created_at" || col.name === "updated_at") return false;
    if (col.isPrimaryKey && col.name === "id") return false;
    return true;
  });
  
  // Build column lists for SQL
  const allColumnNames = table.columns.map(c => c.name);
  const insertColumnNames = insertColumns.map(c => c.name);
  
  const lines: string[] = [];
  
  // Header
  lines.push(`/**`);
  lines.push(` * Repository for ${table.name}`);
  lines.push(` * Source: ${table.sourceFile}`);
  lines.push(` */`);
  lines.push(``);
  lines.push(`import { Database } from "bun:sqlite";`);
  lines.push(`import type { ${typeName}, ${typeName}Insert, ${typeName}Update } from "../types/${fileName}";`);
  lines.push(`import type { QueryOptions } from "./base-repository";`);
  lines.push(``);
  
  // SQL queries
  lines.push(`// SQL Queries`);
  lines.push(`const TABLE_NAME = "${tableName}";`);
  lines.push(``);
  
  const selectById = hasTenant 
    ? `SELECT * FROM ${tableName} WHERE id = ? AND tenant_id = ?`
    : `SELECT * FROM ${tableName} WHERE id = ?`;
  lines.push(`const SELECT_BY_ID = "${selectById}";`);
  
  const deleteById = hasTenant
    ? `DELETE FROM ${tableName} WHERE id = ? AND tenant_id = ?`
    : `DELETE FROM ${tableName} WHERE id = ?`;
  lines.push(`const DELETE_BY_ID = "${deleteById}";`);
  
  const countSql = hasTenant
    ? `SELECT COUNT(*) as count FROM ${tableName} WHERE tenant_id = ?`
    : `SELECT COUNT(*) as count FROM ${tableName}`;
  lines.push(`const COUNT_SQL = "${countSql}";`);
  lines.push(``);
  
  // Build select all function
  lines.push(`function buildSelectAll(${hasTenant ? "tenantId: string, " : ""}options: QueryOptions = {}): string {`);
  lines.push(`  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;`);
  lines.push(`  let sql = \`SELECT * FROM ${tableName}\`;`);
  if (hasTenant) {
    lines.push(`  sql += " WHERE tenant_id = '" + tenantId + "'";`);
  }
  lines.push(`  if (orderBy) sql += \` ORDER BY \${orderBy} \${orderDir.toUpperCase()}\`;`);
  lines.push(`  if (limit) sql += \` LIMIT \${limit}\`;`);
  lines.push(`  if (offset) sql += \` OFFSET \${offset}\`;`);
  lines.push(`  return sql;`);
  lines.push(`}`);
  lines.push(``);
  
  // Build insert function
  lines.push(`function buildInsert(data: ${typeName}Insert): { sql: string; params: unknown[] } {`);
  lines.push(`  const columns: string[] = ["id", "created_at", "updated_at"];`);
  lines.push(`  const values: unknown[] = [crypto.randomUUID(), new Date().toISOString(), new Date().toISOString()];`);
  lines.push(`  const placeholders: string[] = ["?", "?", "?"];`);
  lines.push(``);
  
  for (const col of insertColumns) {
    const propName = col.name;
    lines.push(`  if (data.${propName} !== undefined) {`);
    lines.push(`    columns.push("${propName}");`);
    if (col.isJson) {
      lines.push(`    values.push(JSON.stringify(data.${propName}));`);
    } else {
      lines.push(`    values.push(data.${propName});`);
    }
    lines.push(`    placeholders.push("?");`);
    lines.push(`  }`);
  }
  
  lines.push(``);
  lines.push(`  const sql = \`INSERT INTO ${tableName} (\${columns.join(", ")}) VALUES (\${placeholders.join(", ")}) RETURNING *\`;`);
  lines.push(`  return { sql, params: values };`);
  lines.push(`}`);
  lines.push(``);
  
  // Build update function
  lines.push(`function buildUpdate(id: string, data: ${typeName}Update${hasTenant ? ", tenantId: string" : ""}): { sql: string; params: unknown[] } {`);
  lines.push(`  const sets: string[] = ["updated_at = ?"];`);
  lines.push(`  const values: unknown[] = [new Date().toISOString()];`);
  lines.push(``);
  
  for (const col of insertColumns) {
    if (col.name === "tenant_id") continue; // Don't update tenant_id
    const propName = col.name;
    lines.push(`  if (data.${propName} !== undefined) {`);
    lines.push(`    sets.push("${propName} = ?");`);
    if (col.isJson) {
      lines.push(`    values.push(JSON.stringify(data.${propName}));`);
    } else {
      lines.push(`    values.push(data.${propName});`);
    }
    lines.push(`  }`);
  }
  
  lines.push(``);
  lines.push(`  values.push(id);`);
  if (hasTenant) {
    lines.push(`  values.push(tenantId);`);
    lines.push(`  const sql = \`UPDATE ${tableName} SET \${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *\`;`);
  } else {
    lines.push(`  const sql = \`UPDATE ${tableName} SET \${sets.join(", ")} WHERE id = ? RETURNING *\`;`);
  }
  lines.push(`  return { sql, params: values };`);
  lines.push(`}`);
  lines.push(``);
  
  // Repository class
  lines.push(`export class ${typeName}Repository {`);
  lines.push(`  constructor(private db: Database) {}`);
  lines.push(``);
  
  // findById
  if (hasTenant) {
    lines.push(`  findById(id: string, tenantId: string): ${typeName} | null {`);
    lines.push(`    return this.db.query<${typeName}, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;`);
  } else {
    lines.push(`  findById(id: string): ${typeName} | null {`);
    lines.push(`    return this.db.query<${typeName}, [string]>(SELECT_BY_ID).get(id) ?? null;`);
  }
  lines.push(`  }`);
  lines.push(``);
  
  // findAll
  if (hasTenant) {
    lines.push(`  findAll(tenantId: string, options: QueryOptions = {}): ${typeName}[] {`);
    lines.push(`    return this.db.query<${typeName}, []>(buildSelectAll(tenantId, options)).all();`);
  } else {
    lines.push(`  findAll(options: QueryOptions = {}): ${typeName}[] {`);
    lines.push(`    return this.db.query<${typeName}, []>(buildSelectAll(options)).all();`);
  }
  lines.push(`  }`);
  lines.push(``);
  
  // create
  lines.push(`  create(data: ${typeName}Insert): ${typeName} {`);
  lines.push(`    const { sql, params } = buildInsert(data);`);
  lines.push(`    return this.db.query<${typeName}, unknown[]>(sql).get(...params)!;`);
  lines.push(`  }`);
  lines.push(``);
  
  // update
  if (hasTenant) {
    lines.push(`  update(id: string, data: ${typeName}Update, tenantId: string): ${typeName} | null {`);
    lines.push(`    const { sql, params } = buildUpdate(id, data, tenantId);`);
  } else {
    lines.push(`  update(id: string, data: ${typeName}Update): ${typeName} | null {`);
    lines.push(`    const { sql, params } = buildUpdate(id, data);`);
  }
  lines.push(`    return this.db.query<${typeName}, unknown[]>(sql).get(...params) ?? null;`);
  lines.push(`  }`);
  lines.push(``);
  
  // delete
  if (hasTenant) {
    lines.push(`  delete(id: string, tenantId: string): boolean {`);
    lines.push(`    this.db.query(DELETE_BY_ID).run(id, tenantId);`);
  } else {
    lines.push(`  delete(id: string): boolean {`);
    lines.push(`    this.db.query(DELETE_BY_ID).run(id);`);
  }
  lines.push(`    return true;`);
  lines.push(`  }`);
  lines.push(``);
  
  // count
  if (hasTenant) {
    lines.push(`  count(tenantId: string): number {`);
    lines.push(`    const result = this.db.query<{ count: number }, [string]>(COUNT_SQL).get(tenantId);`);
  } else {
    lines.push(`  count(): number {`);
    lines.push(`    const result = this.db.query<{ count: number }, []>(COUNT_SQL).get();`);
  }
  lines.push(`    return result?.count ?? 0;`);
  lines.push(`  }`);
  lines.push(`}`);
  
  return lines.join("\n");
}

// Generate index file that exports all repositories
function generateIndexFile(tables: TableDef[]): string {
  const exports = tables.map(t => {
    const fileName = t.name.replace(/_/g, "-");
    return `export * from "./${fileName}.repository";`;
  });
  
  return `/**
 * Auto-generated repository exports
 * Generated at: ${new Date().toISOString()}
 */

export * from "./base-repository";
${exports.join("\n")}
`;
}

// Main generation function
export async function generateRepositories(): Promise<{ files: string[]; tableCount: number }> {
  const schema = await introspectSchema();
  const files: string[] = [];
  
  // Ensure output directory exists
  await mkdir(OUTPUT_DIR, { recursive: true });
  
  // Generate base repository
  const baseContent = generateBaseRepository();
  const basePath = join(OUTPUT_DIR, "base-repository.ts");
  await writeFile(basePath, baseContent);
  files.push(basePath);
  
  // Generate repository for each table
  for (const table of schema.tables) {
    const content = generateRepository(table);
    const fileName = `${table.name.replace(/_/g, "-")}.repository.ts`;
    const filePath = join(OUTPUT_DIR, fileName);
    
    await writeFile(filePath, content);
    files.push(filePath);
  }
  
  // Generate index file
  const indexContent = generateIndexFile(schema.tables);
  const indexPath = join(OUTPUT_DIR, "index.ts");
  await writeFile(indexPath, indexContent);
  files.push(indexPath);
  
  return { files, tableCount: schema.tables.length };
}

// CLI execution
if (import.meta.main) {
  try {
    console.log("🔧 Generating repositories from database schema...\n");
    
    const { files, tableCount } = await generateRepositories();
    
    console.log(`✅ Generated ${files.length} files for ${tableCount} tables`);
    console.log(`📁 Output: ${OUTPUT_DIR}`);
    
  } catch (error) {
    console.error("❌ Repository generation failed:", error);
    process.exit(1);
  }
}
