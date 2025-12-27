// Type declarations for bun:sqlite
declare module "bun:sqlite" {
  export class Database {
    constructor(filename: string, options?: any);
    query<T = any, P = any[]>(sql: string): {
      get(...params: P): T | null;
      all(...params: P): T[];
      run(...params: P): void;
      values(...params: P): any[][];
    };
    exec(sql: string): void;
    close(): void;
    transaction<T>(fn: () => T): () => T;
  }
}
