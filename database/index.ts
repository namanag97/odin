/**
 * Database Infrastructure - Main Export
 */

// Core Database
export {
  createDatabase,
  DatabaseConnection,
  type DatabaseConfig,
} from "./connection";

// Repository Factory
export {
  createRepositoryContainer,
  getRepositoryContainer,
  resetRepositoryContainer,
  type IRepositoryContainer,
} from "./repository-factory";

// Error Mapping
export { mapDatabaseError } from "./error-mapper";

// Database Utilities
export {
  DbTimestamp,
  JsonColumn,
  Pagination,
  WhereBuilder,
  buildPagination,
  buildOrderBy,
} from "./types";

// Repository Implementations

