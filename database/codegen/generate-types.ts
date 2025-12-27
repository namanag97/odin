/**
 * TypeScript Type Generator
 * Generates TypeScript interfaces from introspected schema
 */

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { introspectSchema, type ColumnDef, type TableDef } from "./introspect-schema";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = resolve(__dirname, "../generated/types");

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

// Get TypeScript type for a column
function getTypeScriptType(col: ColumnDef): string {
  let tsType = col.type;
  
  // Handle JSON types more specifically
  if (col.isJson) {
    // Check if it's an array default
    if (col.defaultValue?.includes("[]")) {
      tsType = "unknown[]";
    } else {
      tsType = "Record<string, unknown>";
    }
  }
  
  // Add null if nullable
  if (col.isNullable) {
    tsType = `${tsType} | null`;
  }
  
  return tsType;
}

// Extract enum values from CHECK constraint
function extractEnumValues(checkConstraint: string | null): string[] | null {
  if (!checkConstraint) return null;
  
  const match = checkConstraint.match(/IN\s*\(\s*([^)]+)\s*\)/i);
  if (match) {
    const values = match[1].match(/'([^']+)'/g);
    if (values && values.length > 0) {
      return values.map(v => v.replace(/'/g, ""));
    }
  }
  return null;
}

// Generate TypeScript interface for a table
function generateInterface(table: TableDef): string {
  const typeName = toPascalCase(table.name);
  const lines: string[] = [];
  
  // Collect enums from CHECK constraints
  const enums: { name: string; values: string[] }[] = [];
  
  lines.push(`/**`);
  lines.push(` * Represents a row in the ${table.name} table`);
  lines.push(` * Source: ${table.sourceFile}`);
  lines.push(` */`);
  lines.push(`export interface ${typeName} {`);
  
  for (const col of table.columns) {
    const propName = col.name;
    let tsType = getTypeScriptType(col);
    
    // Check for enum values
    const enumValues = extractEnumValues(col.checkConstraint);
    if (enumValues && enumValues.length > 0) {
      const enumTypeName = `${typeName}${toPascalCase(col.name)}`;
      enums.push({ name: enumTypeName, values: enumValues });
      tsType = col.isNullable ? `${enumTypeName} | null` : enumTypeName;
    }
    
    // Add JSDoc comment for special fields
    if (col.foreignKey) {
      lines.push(`  /** FK -> ${col.foreignKey.table}.${col.foreignKey.column} */`);
    } else if (col.isJson) {
      lines.push(`  /** JSON field */`);
    } else if (col.isPrimaryKey) {
      lines.push(`  /** Primary key */`);
    }
    
    lines.push(`  ${propName}: ${tsType};`);
  }
  
  lines.push(`}`);
  
  // Generate enum types
  const enumDefs = enums.map(e => {
    const values = e.values.map(v => `"${v}"`).join(" | ");
    return `export type ${e.name} = ${values};`;
  });
  
  // Generate Insert type (without auto-generated fields)
  const insertTypeName = `${typeName}Insert`;
  const insertFields = table.columns.filter(col => {
    // Exclude auto-generated fields
    if (col.name === "created_at" || col.name === "updated_at") return false;
    if (col.isPrimaryKey && col.name === "id") return false;
    return true;
  });
  
  const insertLines: string[] = [];
  insertLines.push(`\n/** Insert type for ${table.name} (excludes auto-generated fields) */`);
  insertLines.push(`export interface ${insertTypeName} {`);
  
  for (const col of insertFields) {
    const propName = col.name;
    let tsType = getTypeScriptType(col);
    
    // Check for enum values
    const enumValues = extractEnumValues(col.checkConstraint);
    if (enumValues && enumValues.length > 0) {
      const enumTypeName = `${typeName}${toPascalCase(col.name)}`;
      tsType = col.isNullable ? `${enumTypeName} | null` : enumTypeName;
    }
    
    // Make fields with defaults optional
    const isOptional = col.defaultValue !== null || col.isNullable;
    const optionalMark = isOptional ? "?" : "";
    
    insertLines.push(`  ${propName}${optionalMark}: ${tsType};`);
  }
  
  insertLines.push(`}`);
  
  // Combine all
  const result = [...enumDefs, "", ...lines, ...insertLines].join("\n");
  return result;
}

// Generate index file that exports all types
function generateIndexFile(tables: TableDef[]): string {
  const exports = tables.map(t => {
    const fileName = t.name.replace(/_/g, "-");
    return `export * from "./${fileName}";`;
  });
  
  return `/**
 * Auto-generated type exports
 * Generated at: ${new Date().toISOString()}
 */

${exports.join("\n")}
`;
}

// Main generation function
export async function generateTypes(): Promise<{ files: string[]; tableCount: number }> {
  const schema = await introspectSchema();
  const files: string[] = [];
  
  // Ensure output directory exists
  await mkdir(OUTPUT_DIR, { recursive: true });
  
  // Generate type file for each table
  for (const table of schema.tables) {
    const content = generateInterface(table);
    const fileName = `${table.name.replace(/_/g, "-")}.ts`;
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
    console.log("🔧 Generating TypeScript types from schema...\n");
    
    const { files, tableCount } = await generateTypes();
    
    console.log(`✅ Generated ${files.length} files for ${tableCount} tables`);
    console.log(`📁 Output: ${OUTPUT_DIR}`);
    
  } catch (error) {
    console.error("❌ Type generation failed:", error);
    process.exit(1);
  }
}
