/**
 * Schema-Driven Code Generator
 * Master script to run all generators
 */

import { introspectSchema } from "./introspect-schema";
import { generateTypes } from "./generate-types";
import { generateZodSchemas } from "./generate-zod";
import { generateRepositories } from "./generate-repos";

async function main() {
  const startTime = Date.now();
  
  console.log("🚀 Schema-Driven Code Generator\n");
  console.log("=".repeat(50));
  
  // Step 1: Introspect schema
  console.log("\n📊 Step 1: Introspecting schema...");
  const schema = await introspectSchema();
  console.log(`   Found ${schema.tables.length} tables\n`);
  
  // Step 2: Generate TypeScript types
  console.log("📝 Step 2: Generating TypeScript types...");
  const types = await generateTypes();
  console.log(`   Generated ${types.files.length} type files\n`);
  
  // Step 3: Generate Zod schemas
  console.log("✅ Step 3: Generating Zod validation schemas...");
  const zod = await generateZodSchemas();
  console.log(`   Generated ${zod.files.length} schema files\n`);
  
  // Step 4: Generate repositories
  console.log("🗃️  Step 4: Generating CRUD repositories...");
  const repos = await generateRepositories();
  console.log(`   Generated ${repos.files.length} repository files\n`);
  
  // Summary
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  const totalFiles = types.files.length + zod.files.length + repos.files.length;
  
  console.log("=".repeat(50));
  console.log("\n🎉 Code generation complete!\n");
  console.log(`   📋 Tables processed: ${schema.tables.length}`);
  console.log(`   📁 Files generated:  ${totalFiles}`);
  console.log(`   ⏱️  Duration:         ${duration}s`);
  console.log(`\n   Output directories:`);
  console.log(`   - database/generated/types/`);
  console.log(`   - database/generated/schemas/`);
  console.log(`   - database/generated/repos/`);
}

// CLI execution
if (import.meta.main) {
  main().catch((error) => {
    console.error("❌ Generation failed:", error);
    process.exit(1);
  });
}
