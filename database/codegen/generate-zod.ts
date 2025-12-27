/**
 * Zod Schema Generator
 * Generates Zod validation schemas from introspected schema
 */

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { introspectSchema, type ColumnDef, type TableDef } from "./introspect-schema";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = resolve(__dirname, "../generated/schemas");

// Convert snake_case to PascalCase
function toPascalCase(str: string): string {
  return str
    .split("_")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("");
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

// Get Zod type for a column
function getZodType(col: ColumnDef): string {
  // Check for enum values first
  const enumValues = extractEnumValues(col.checkConstraint);
  if (enumValues && enumValues.length > 0) {
    const enumStr = enumValues.map(v => `"${v}"`).join(", ");
    return `z.enum([${enumStr}])`;
  }
  
  // Handle by SQLite type
  const sqlType = col.sqliteType.toUpperCase();
  
  // Primary key UUID
  if (col.isPrimaryKey && col.name === "id") {
    return "z.string().uuid()";
  }
  
  // Foreign key UUIDs
  if (col.foreignKey || col.name.endsWith("_id")) {
    return "z.string().uuid()";
  }
  
  // JSON fields
  if (col.isJson) {
    if (col.defaultValue?.includes("[]")) {
      return "z.array(z.unknown())";
    }
    return "z.record(z.string(), z.unknown())";
  }
  
  // Datetime fields
  if (col.name === "created_at" || col.name === "updated_at" || 
      col.name.endsWith("_at") || col.name.includes("timestamp")) {
    return "z.string().datetime({ offset: true }).or(z.string())";
  }
  
  // Numeric types
  if (sqlType.includes("INT")) {
    return "z.number().int()";
  }
  if (sqlType.includes("REAL") || sqlType.includes("FLOAT") || sqlType.includes("DOUBLE")) {
    return "z.number()";
  }
  
  // Boolean
  if (sqlType.includes("BOOL")) {
    return "z.boolean()";
  }
  
  // Default to string
  return "z.string()";
}

// Generate Zod schema for a table
function generateZodSchema(table: TableDef): string {
  const typeName = toPascalCase(table.name);
  const schemaName = `${typeName}Schema`;
  const insertSchemaName = `${typeName}InsertSchema`;
  
  const lines: string[] = [];
  
  // Header
  lines.push(`/**`);
  lines.push(` * Zod schemas for ${table.name} table`);
  lines.push(` * Source: ${table.sourceFile}`);
  lines.push(` */`);
  lines.push(``);
  lines.push(`import { z } from "zod";`);
  lines.push(``);
  
  // Main schema (for SELECT)
  lines.push(`/** Schema for a ${table.name} row */`);
  lines.push(`export const ${schemaName} = z.object({`);
  
  for (const col of table.columns) {
    let zodType = getZodType(col);
    
    // Handle nullable
    if (col.isNullable) {
      zodType = `${zodType}.nullable()`;
    }
    
    lines.push(`  ${col.name}: ${zodType},`);
  }
  
  lines.push(`});`);
  lines.push(``);
  
  // Inferred type
  lines.push(`export type ${typeName} = z.infer<typeof ${schemaName}>;`);
  lines.push(``);
  
  // Insert schema (for CREATE)
  const insertFields = table.columns.filter(col => {
    // Exclude auto-generated fields
    if (col.name === "created_at" || col.name === "updated_at") return false;
    if (col.isPrimaryKey && col.name === "id") return false;
    return true;
  });
  
  lines.push(`/** Schema for inserting a ${table.name} row */`);
  lines.push(`export const ${insertSchemaName} = z.object({`);
  
  for (const col of insertFields) {
    let zodType = getZodType(col);
    
    // Make fields with defaults optional
    const hasDefault = col.defaultValue !== null;
    const isOptional = hasDefault || col.isNullable;
    
    if (col.isNullable) {
      zodType = `${zodType}.nullable()`;
    }
    
    if (isOptional) {
      zodType = `${zodType}.optional()`;
    }
    
    lines.push(`  ${col.name}: ${zodType},`);
  }
  
  lines.push(`});`);
  lines.push(``);
  
  // Inferred insert type
  lines.push(`export type ${typeName}Insert = z.infer<typeof ${insertSchemaName}>;`);
  lines.push(``);
  
  // Update schema (partial of insert)
  lines.push(`/** Schema for updating a ${table.name} row */`);
  lines.push(`export const ${typeName}UpdateSchema = ${insertSchemaName}.partial();`);
  lines.push(``);
  lines.push(`export type ${typeName}Update = z.infer<typeof ${typeName}UpdateSchema>;`);
  
  return lines.join("\n");
}

// Generate index file that exports all schemas
function generateIndexFile(tables: TableDef[]): string {
  const exports = tables.map(t => {
    const fileName = t.name.replace(/_/g, "-");
    return `export * from "./${fileName}";`;
  });
  
  return `/**
 * Auto-generated Zod schema exports
 * Generated at: ${new Date().toISOString()}
 */

${exports.join("\n")}
`;
}

// Main generation function
export async function generateZodSchemas(): Promise<{ files: string[]; tableCount: number }> {
  const schema = await introspectSchema();
  const files: string[] = [];
  
  // Ensure output directory exists
  await mkdir(OUTPUT_DIR, { recursive: true });
  
  // Generate schema file for each table
  for (const table of schema.tables) {
    const content = generateZodSchema(table);
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
    console.log("🔧 Generating Zod schemas from database schema...\n");
    
    const { files, tableCount } = await generateZodSchemas();
    
    console.log(`✅ Generated ${files.length} files for ${tableCount} tables`);
    console.log(`📁 Output: ${OUTPUT_DIR}`);
    
  } catch (error) {
    console.error("❌ Schema generation failed:", error);
    process.exit(1);
  }
}
