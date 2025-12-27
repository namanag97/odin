/**
 * Database initialization script for Odin Process Mining Platform
 * Uses Bun's native SQLite support
 */

import { Database } from "bun:sqlite";
import { readdir, readFile } from "node:fs/promises";
import { join, resolve } from "node:path";

const DB_PATH = process.env.DATABASE_PATH || "./odin.db";
const SCHEMA_DIR = resolve(import.meta.dir, "schema");

interface InitOptions {
  seed?: boolean;
  force?: boolean;
  verbose?: boolean;
}

async function loadSchemaFiles(): Promise<string[]> {
  const files = await readdir(SCHEMA_DIR);
  return files
    .filter((f) => f.endsWith(".sql"))
    .sort() // Files are numbered 00_, 01_, etc.
    .map((f) => join(SCHEMA_DIR, f));
}

async function initDatabase(options: InitOptions = {}): Promise<Database> {
  const { seed = false, force = false, verbose = false } = options;

  if (force) {
    try {
      const fs = await import("node:fs");
      if (fs.existsSync(DB_PATH)) {
        fs.unlinkSync(DB_PATH);
        if (verbose) console.log(`🗑️  Removed existing database: ${DB_PATH}`);
      }
    } catch (e) {
      // Database doesn't exist, continue
    }
  }

  const db = new Database(DB_PATH);

  // Enable foreign keys
  db.run("PRAGMA foreign_keys = ON");
  db.run("PRAGMA journal_mode = WAL");

  if (verbose) console.log(`📂 Database: ${DB_PATH}`);

  // Load and execute schema files
  const schemaFiles = await loadSchemaFiles();

  for (const file of schemaFiles) {
    const sql = await readFile(file, "utf-8");
    try {
      db.run(sql);
      if (verbose) console.log(`✅ Executed: ${file.split("/").pop()}`);
    } catch (error) {
      console.error(`❌ Error in ${file}:`, error);
      throw error;
    }
  }

  // Seed data if requested
  if (seed) {
    const seedPath = join(import.meta.dir, "seed.sql");
    try {
      const seedSql = await readFile(seedPath, "utf-8");
      db.run(seedSql);
      if (verbose) console.log("🌱 Seed data loaded");
    } catch (error) {
      console.warn("⚠️  No seed.sql found or error loading seed data");
    }
  }

  // Print table count
  const tables = db
    .query<{ name: string }, []>(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
    )
    .all();

  console.log(`\n🎉 Database initialized with ${tables.length} tables`);

  if (verbose) {
    console.log("\nTables created:");
    tables.forEach((t) => console.log(`  - ${t.name}`));
  }

  return db;
}

// Generate UUID v4
function uuid(): string {
  return crypto.randomUUID();
}

// CLI execution
if (import.meta.main) {
  const args = process.argv.slice(2);
  const options: InitOptions = {
    seed: args.includes("--seed"),
    force: args.includes("--force"),
    verbose: args.includes("--verbose") || args.includes("-v"),
  };

  if (args.includes("--help") || args.includes("-h")) {
    console.log(`
Odin Database Initialization

Usage: bun run database/init.ts [options]

Options:
  --seed      Load seed data after creating tables
  --force     Delete existing database before creating
  --verbose   Print detailed output
  --help      Show this help message
`);
    process.exit(0);
  }

  try {
    await initDatabase(options);
    process.exit(0);
  } catch (error) {
    console.error("Failed to initialize database:", error);
    process.exit(1);
  }
}

export { initDatabase, uuid, DB_PATH };
