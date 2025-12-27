/**
 * Schema Introspection Utility
 * Parses SQLite schema files and extracts table definitions
 */

import { readdir, readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCHEMA_DIR = resolve(__dirname, "../schema");

// Types for schema representation
export interface ColumnDef {
  name: string;
  type: string;
  sqliteType: string;
  isNullable: boolean;
  isPrimaryKey: boolean;
  isUnique: boolean;
  defaultValue: string | null;
  checkConstraint: string | null;
  foreignKey: ForeignKeyDef | null;
  isJson: boolean;
}

export interface ForeignKeyDef {
  table: string;
  column: string;
  onDelete: string | null;
}

export interface IndexDef {
  name: string;
  columns: string[];
  isUnique: boolean;
}

export interface TableDef {
  name: string;
  columns: ColumnDef[];
  primaryKey: string[];
  indexes: IndexDef[];
  foreignKeys: ForeignKeyDef[];
  uniqueConstraints: string[][];
  sourceFile: string;
}

export interface SchemaInfo {
  tables: TableDef[];
  generatedAt: string;
}

// SQLite to TypeScript type mapping
function sqliteToTsType(sqliteType: string, isJson: boolean): string {
  if (isJson) return "Record<string, unknown>";
  
  const normalized = sqliteType.toUpperCase();
  if (normalized.includes("INT")) return "number";
  if (normalized.includes("REAL") || normalized.includes("FLOAT") || normalized.includes("DOUBLE")) return "number";
  if (normalized.includes("BOOL")) return "boolean";
  if (normalized.includes("BLOB")) return "Buffer";
  return "string"; // TEXT, VARCHAR, etc.
}

// Parse CHECK constraint to extract enum values
function parseCheckConstraint(check: string): string[] | null {
  // Match patterns like: CHECK (status IN ('active', 'inactive', 'archived'))
  const inMatch = check.match(/IN\s*\(\s*([^)]+)\s*\)/i);
  if (inMatch) {
    const values = inMatch[1].match(/'([^']+)'/g);
    if (values) {
      return values.map(v => v.replace(/'/g, ""));
    }
  }
  return null;
}

// Parse a CREATE TABLE statement
function parseCreateTable(sql: string, sourceFile: string): TableDef | null {
  // Match: CREATE TABLE IF NOT EXISTS table_name ( ... )
  const tableMatch = sql.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?["']?(\w+)["']?\s*\(/is);
  if (!tableMatch) return null;

  const tableName = tableMatch[1];
  const bodyStart = sql.indexOf("(", tableMatch.index || 0) + 1;
  
  // Find matching closing paren
  let depth = 1;
  let bodyEnd = bodyStart;
  for (let i = bodyStart; i < sql.length; i++) {
    if (sql[i] === "(") depth++;
    if (sql[i] === ")") depth--;
    if (depth === 0) {
      bodyEnd = i;
      break;
    }
  }
  
  const body = sql.substring(bodyStart, bodyEnd);
  const columns: ColumnDef[] = [];
  const foreignKeys: ForeignKeyDef[] = [];
  const uniqueConstraints: string[][] = [];
  let primaryKey: string[] = [];

  // Split by comma, but handle nested parens
  const lines: string[] = [];
  let current = "";
  let parenDepth = 0;
  
  for (const char of body) {
    if (char === "(") parenDepth++;
    if (char === ")") parenDepth--;
    if (char === "," && parenDepth === 0) {
      lines.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  if (current.trim()) lines.push(current.trim());

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Table-level constraints
    if (trimmed.match(/^\s*(PRIMARY\s+KEY|FOREIGN\s+KEY|UNIQUE|CHECK)\s*\(/i)) {
      // Primary key constraint
      const pkMatch = trimmed.match(/PRIMARY\s+KEY\s*\(\s*([^)]+)\s*\)/i);
      if (pkMatch) {
        primaryKey = pkMatch[1].split(",").map(c => c.trim().replace(/["']/g, ""));
      }
      
      // Unique constraint
      const uqMatch = trimmed.match(/UNIQUE\s*\(\s*([^)]+)\s*\)/i);
      if (uqMatch) {
        uniqueConstraints.push(uqMatch[1].split(",").map(c => c.trim().replace(/["']/g, "")));
      }
      
      // Foreign key constraint
      const fkMatch = trimmed.match(/FOREIGN\s+KEY\s*\(\s*(\w+)\s*\)\s+REFERENCES\s+["']?(\w+)["']?\s*\(\s*(\w+)\s*\)(?:\s+ON\s+DELETE\s+(\w+(?:\s+\w+)?))?/i);
      if (fkMatch) {
        foreignKeys.push({
          table: fkMatch[2],
          column: fkMatch[3],
          onDelete: fkMatch[4] || null,
        });
      }
      continue;
    }

    // Column definition
    const colMatch = trimmed.match(/^["']?(\w+)["']?\s+(\w+(?:\([^)]+\))?)/i);
    if (!colMatch) continue;

    const colName = colMatch[1];
    const colType = colMatch[2];
    
    const isPK = /PRIMARY\s+KEY/i.test(trimmed);
    const isUnique = /\sUNIQUE(?:\s|$|,)/i.test(trimmed);
    const isNotNull = /NOT\s+NULL/i.test(trimmed);
    const isNullable = !isNotNull && !isPK;
    
    // Default value
    const defaultMatch = trimmed.match(/DEFAULT\s+(?:'([^']*)'|([^\s,)]+))/i);
    const defaultValue = defaultMatch ? (defaultMatch[1] ?? defaultMatch[2]) : null;
    
    // Check constraint
    const checkMatch = trimmed.match(/CHECK\s*\([^)]+\)/i);
    const checkConstraint = checkMatch ? checkMatch[0] : null;
    
    // Inline foreign key
    const fkInlineMatch = trimmed.match(/REFERENCES\s+["']?(\w+)["']?\s*\(\s*(\w+)\s*\)(?:\s+ON\s+DELETE\s+(\w+(?:\s+\w+)?))?/i);
    const foreignKey = fkInlineMatch ? {
      table: fkInlineMatch[1],
      column: fkInlineMatch[2],
      onDelete: fkInlineMatch[3] || null,
    } : null;
    
    // Detect JSON fields (common patterns)
    const isJson = /DEFAULT\s*'?\{\}'?/i.test(trimmed) || 
                   /DEFAULT\s*'?\[\]'?/i.test(trimmed) ||
                   colName.toLowerCase().includes("config") ||
                   colName.toLowerCase().includes("metadata") ||
                   colName.toLowerCase().includes("settings") ||
                   colName.toLowerCase().includes("attributes");

    if (isPK) {
      primaryKey.push(colName);
    }

    columns.push({
      name: colName,
      type: sqliteToTsType(colType, isJson),
      sqliteType: colType,
      isNullable,
      isPrimaryKey: isPK,
      isUnique,
      defaultValue,
      checkConstraint,
      foreignKey,
      isJson,
    });
  }

  return {
    name: tableName,
    columns,
    primaryKey,
    indexes: [],
    foreignKeys,
    uniqueConstraints,
    sourceFile,
  };
}

// Parse CREATE INDEX statements
function parseCreateIndex(sql: string): IndexDef | null {
  const match = sql.match(/CREATE\s+(UNIQUE\s+)?INDEX\s+(?:IF\s+NOT\s+EXISTS\s+)?["']?(\w+)["']?\s+ON\s+["']?(\w+)["']?\s*\(\s*([^)]+)\s*\)/i);
  if (!match) return null;

  return {
    name: match[2],
    columns: match[4].split(",").map(c => c.trim().replace(/["']/g, "").split(/\s/)[0]),
    isUnique: !!match[1],
  };
}

// Strip SQL comments from a statement
function stripComments(sql: string): string {
  // Remove single-line comments (-- ...)
  let result = sql.replace(/--[^\n]*/g, "");
  // Remove multi-line comments (/* ... */)
  result = result.replace(/\/\*[\s\S]*?\*\//g, "");
  return result.trim();
}

// Parse a schema file
async function parseSchemaFile(filePath: string): Promise<{ tables: TableDef[]; indexes: Map<string, IndexDef[]> }> {
  const content = await readFile(filePath, "utf-8");
  const fileName = filePath.split("/").pop() || "";
  
  const tables: TableDef[] = [];
  const indexes = new Map<string, IndexDef[]>();

  // Split by statements
  const statements = content.split(";").map((s: string) => s.trim()).filter(Boolean);

  for (const stmt of statements) {
    // Strip comments before testing
    const cleanStmt = stripComments(stmt);
    
    if (/^CREATE\s+TABLE/i.test(cleanStmt)) {
      // Pass original statement for parsing (preserves structure)
      const table = parseCreateTable(cleanStmt, fileName);
      if (table) {
        tables.push(table);
      }
    } else if (/^CREATE\s+(UNIQUE\s+)?INDEX/i.test(cleanStmt)) {
      const indexMatch = cleanStmt.match(/ON\s+["']?(\w+)["']?/i);
      if (indexMatch) {
        const tableName = indexMatch[1];
        const index = parseCreateIndex(cleanStmt);
        if (index) {
          if (!indexes.has(tableName)) {
            indexes.set(tableName, []);
          }
          indexes.get(tableName)!.push(index);
        }
      }
    }
  }

  return { tables, indexes };
}

// Main introspection function
export async function introspectSchema(): Promise<SchemaInfo> {
  const files = await readdir(SCHEMA_DIR);
  const sqlFiles = files.filter(f => f.endsWith(".sql")).sort();

  const allTables: TableDef[] = [];
  const allIndexes = new Map<string, IndexDef[]>();

  for (const file of sqlFiles) {
    const { tables, indexes } = await parseSchemaFile(join(SCHEMA_DIR, file));
    allTables.push(...tables);
    
    indexes.forEach((idxList, tableName) => {
      if (!allIndexes.has(tableName)) {
        allIndexes.set(tableName, []);
      }
      allIndexes.get(tableName)!.push(...idxList);
    });
  }

  // Associate indexes with tables
  for (const table of allTables) {
    table.indexes = allIndexes.get(table.name) || [];
  }

  return {
    tables: allTables,
    generatedAt: new Date().toISOString(),
  };
}

// CLI execution
if (import.meta.main) {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const output = args.includes("--output") ? args[args.indexOf("--output") + 1] : null;

  try {
    const schema = await introspectSchema();
    
    console.log(`📊 Introspected ${schema.tables.length} tables from schema files\n`);
    
    if (dryRun) {
      for (const table of schema.tables) {
        console.log(`  📋 ${table.name} (${table.columns.length} columns) - ${table.sourceFile}`);
      }
    } else {
      const json = JSON.stringify(schema, null, 2);
      
      if (output) {
        const { writeFile } = await import("node:fs/promises");
        await writeFile(output, json);
        console.log(`✅ Schema written to ${output}`);
      } else {
        console.log(json);
      }
    }
  } catch (error) {
    console.error("❌ Introspection failed:", error);
    process.exit(1);
  }
}
