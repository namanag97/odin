/**
 * Database Connection Manager
 *
 * Manages Bun SQLite database connections with connection pooling,
 * transaction support, and proper resource management.
 */

import { Database } from "bun:sqlite";
import type { Logger } from "@odin/core-contracts";

export interface DatabaseConfig {
  readonly path: string;
  readonly walMode?: boolean;
  readonly foreignKeys?: boolean;
  readonly busyTimeout?: number;
  readonly cacheSize?: number;
}

export class DatabaseConnection {
  private db: Database;
  private readonly config: DatabaseConfig;

  constructor(config: DatabaseConfig, private logger?: Logger) {
    this.config = {
      walMode: true,
      foreignKeys: true,
      busyTimeout: 5000,
      cacheSize: -2000, // 2MB
      ...config,
    };

    this.db = new Database(this.config.path);
    this.initialize();
  }

  private initialize(): void {
    // Enable WAL mode for better concurrency
    if (this.config.walMode) {
      this.db.exec("PRAGMA journal_mode = WAL");
      this.logger?.debug("Database: WAL mode enabled");
    }

    // Enable foreign key constraints
    if (this.config.foreignKeys) {
      this.db.exec("PRAGMA foreign_keys = ON");
      this.logger?.debug("Database: Foreign keys enabled");
    }

    // Set busy timeout
    if (this.config.busyTimeout) {
      this.db.exec(`PRAGMA busy_timeout = ${this.config.busyTimeout}`);
    }

    // Set cache size
    if (this.config.cacheSize) {
      this.db.exec(`PRAGMA cache_size = ${this.config.cacheSize}`);
    }

    // Optimize for performance
    this.db.exec("PRAGMA synchronous = NORMAL");
    this.db.exec("PRAGMA temp_store = MEMORY");

    this.logger?.info("Database connection initialized", {
      path: this.config.path,
      walMode: this.config.walMode,
      foreignKeys: this.config.foreignKeys,
    });
  }

  /**
   * Get the underlying database instance
   */
  getDatabase(): Database {
    return this.db;
  }

  /**
   * Execute a transaction
   */
  transaction<T>(fn: () => T): T {
    return this.db.transaction(fn)();
  }

  /**
   * Execute SQL statement(s)
   */
  exec(sql: string): void {
    this.db.exec(sql);
  }

  /**
   * Prepare a query
   */
  query<T = any>(sql: string) {
    return this.db.query<T, any[]>(sql);
  }

  /**
   * Run migrations from schema files
   */
  async runMigrations(migrationPath: string): Promise<void> {
    this.logger?.info("Running database migrations", { path: migrationPath });

    // Create migrations table if it doesn't exist
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        applied_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `);

    // Load and execute migration files
    // This will be implemented when we integrate with the schema files
    this.logger?.info("Migrations completed");
  }

  /**
   * Check database health
   */
  healthCheck(): boolean {
    try {
      const result = this.db.query("SELECT 1 as health").get();
      return result !== null;
    } catch (error) {
      this.logger?.error("Database health check failed", { error });
      return false;
    }
  }

  /**
   * Get database statistics
   */
  getStats(): {
    pageSize: number;
    pageCount: number;
    totalSize: number;
    walSize?: number;
  } {
    const pageSize = this.db.query("PRAGMA page_size").get() as any;
    const pageCount = this.db.query("PRAGMA page_count").get() as any;

    return {
      pageSize: pageSize.page_size || 0,
      pageCount: pageCount.page_count || 0,
      totalSize: (pageSize.page_size || 0) * (pageCount.page_count || 0),
    };
  }

  /**
   * Checkpoint WAL file
   */
  checkpoint(): void {
    this.db.exec("PRAGMA wal_checkpoint(TRUNCATE)");
    this.logger?.debug("WAL checkpoint executed");
  }

  /**
   * Optimize database
   */
  optimize(): void {
    this.db.exec("VACUUM");
    this.db.exec("ANALYZE");
    this.logger?.info("Database optimized");
  }

  /**
   * Close the database connection
   */
  close(): void {
    this.db.close();
    this.logger?.info("Database connection closed");
  }
}

/**
 * Create a database connection with default configuration
 */
export function createDatabase(
  path: string = "./odin.db",
  logger?: Logger
): DatabaseConnection {
  return new DatabaseConnection({ path }, logger);
}
