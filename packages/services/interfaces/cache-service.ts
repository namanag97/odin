import type {
  AsyncResult,
  UUID,
  Duration,
  Percentage,
  ISODateTime,
  DataModelId,
} from "@odin/core-contracts";
import type { IService, OperationContext } from "./base";

/**
 * Distributed caching abstraction (Redis, Memcached).
 */
export interface ICacheService extends IService {
  // Basic Operations
  get<T>(key: string, ctx: OperationContext): AsyncResult<T | null>;
  set<T>(input: CacheSetInput<T>, ctx: OperationContext): AsyncResult<void>;
  delete(key: string, ctx: OperationContext): AsyncResult<boolean>;
  exists(key: string, ctx: OperationContext): AsyncResult<boolean>;

  // Batch Operations
  getMany<T>(keys: readonly string[], ctx: OperationContext): AsyncResult<Map<string, T>>;
  setMany<T>(items: readonly CacheItem<T>[], ctx: OperationContext): AsyncResult<void>;
  deleteMany(keys: readonly string[], ctx: OperationContext): AsyncResult<number>;

  // Pattern Operations
  deletePattern(pattern: string, ctx: OperationContext): AsyncResult<number>;
  getKeys(pattern: string, ctx: OperationContext): AsyncResult<readonly string[]>;

  // Cache-aside Pattern
  getOrSet<T>(input: CacheOrSetInput<T>, ctx: OperationContext): AsyncResult<T>;

  // Invalidation
  invalidateByTags(tags: readonly string[], ctx: OperationContext): AsyncResult<number>;
  invalidateByPrefix(prefix: string, ctx: OperationContext): AsyncResult<number>;

  // Locking
  acquireLock(key: string, ttl: Duration, ctx: OperationContext): AsyncResult<CacheLock | null>;
  releaseLock(lock: CacheLock, ctx: OperationContext): AsyncResult<boolean>;

  // Stats
  getStats(ctx: OperationContext): AsyncResult<CacheStats>;
}

// ═══════════════════════════════════════════════════════════════
// DTOs
// ═══════════════════════════════════════════════════════════════

export interface CacheSetInput<T> {
  readonly key: string;
  readonly value: T;
  readonly ttl?: Duration;
  readonly tags?: readonly string[];
}

export interface CacheItem<T> {
  readonly key: string;
  readonly value: T;
  readonly ttl?: Duration;
}

export interface CacheOrSetInput<T> {
  readonly key: string;
  readonly factory: () => AsyncResult<T>;
  readonly ttl?: Duration;
  readonly tags?: readonly string[];
  readonly staleWhileRevalidate?: boolean;
}

export interface CacheLock {
  readonly key: string;
  readonly token: string;
  readonly acquiredAt: ISODateTime;
  readonly expiresAt: ISODateTime;
}

export interface CacheStats {
  readonly hits: number;
  readonly misses: number;
  readonly hitRate: Percentage;
  readonly memoryUsed: number;
  readonly memoryLimit: number;
  readonly keyCount: number;
}

// ═══════════════════════════════════════════════════════════════
// Cache Key Builder
// ═══════════════════════════════════════════════════════════════

/**
 * Cache Key Conventions for standardized key generation.
 */
export interface CacheKeyBuilder {
  /** Entity caching: e.g., "entity:data_pool:550e8400-..." */
  entity: (type: string, id: UUID) => string;

  /** Query result caching: e.g., "query:case_analytics:get_cases:abc123" */
  query: (service: string, method: string, hash: string) => string;

  /** User session data */
  session: (sessionId: UUID) => string;

  /** Computed results: e.g., "computed:dfg:model123:filterHash" */
  computed: (type: string, modelId: DataModelId, hash: string) => string;

  /** Rate limiting */
  rateLimit: (key: string, window: string) => string;
}
