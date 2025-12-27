/**
 * Cache Contract
 * L0 Core Contract - Caching interface
 */

// ============================================================================
// Cache Options
// ============================================================================

/**
 * Options for setting cache values
 */
export interface CacheSetOptions {
  /** Time-to-live in seconds */
  ttl?: number;
  /** Tags for cache invalidation */
  tags?: string[];
}

/**
 * Options for getting cache values
 */
export interface CacheGetOptions {
  /** Return stale value while revalidating */
  allowStale?: boolean;
}

// ============================================================================
// Cache Interface
// ============================================================================

/**
 * Cache interface for key-value caching
 * Abstracted from concrete implementations (memory, Redis, etc.)
 */
export interface Cache {
  /**
   * Get a value from cache
   * @param key Cache key
   * @param options Get options
   * @returns Cached value or null if not found
   */
  get<T>(key: string, options?: CacheGetOptions): Promise<T | null>;
  
  /**
   * Set a value in cache
   * @param key Cache key
   * @param value Value to cache
   * @param options Set options (ttl, tags)
   */
  set<T>(key: string, value: T, options?: CacheSetOptions): Promise<void>;
  
  /**
   * Delete a value from cache
   * @param key Cache key
   */
  delete(key: string): Promise<void>;
  
  /**
   * Check if a key exists in cache
   * @param key Cache key
   */
  has(key: string): Promise<boolean>;
  
  /**
   * Clear all cache entries
   */
  clear(): Promise<void>;
  
  /**
   * Invalidate cache entries by tag
   * @param tag Tag to invalidate
   */
  invalidateTag(tag: string): Promise<void>;
  
  /**
   * Invalidate cache entries by pattern
   * @param pattern Key pattern (glob-style)
   */
  invalidatePattern(pattern: string): Promise<void>;
  
  /**
   * Get or set a value (cache-aside pattern)
   * @param key Cache key
   * @param factory Function to compute value if not cached
   * @param options Set options
   */
  getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    options?: CacheSetOptions
  ): Promise<T>;
  
  /**
   * Get multiple values
   * @param keys Array of cache keys
   */
  getMany<T>(keys: string[]): Promise<Map<string, T | null>>;
  
  /**
   * Set multiple values
   * @param entries Map of key-value pairs
   * @param options Set options
   */
  setMany<T>(entries: Map<string, T>, options?: CacheSetOptions): Promise<void>;
  
  /**
   * Delete multiple values
   * @param keys Array of cache keys
   */
  deleteMany(keys: string[]): Promise<void>;
}

// ============================================================================
// Cache Key Utilities
// ============================================================================

/**
 * Build a namespaced cache key
 */
export const buildCacheKey = (namespace: string, ...parts: string[]): string => {
  return [namespace, ...parts].join(':');
};

/**
 * Build a tenant-scoped cache key
 */
export const buildTenantCacheKey = (
  tenantId: string,
  namespace: string,
  ...parts: string[]
): string => {
  return ['tenant', tenantId, namespace, ...parts].join(':');
};

// ============================================================================
// Cache Tags
// ============================================================================

/**
 * Common cache tag builders
 */
export const CacheTags = {
  /** Tag for a specific entity */
  entity: (type: string, id: string) => `${type}:${id}`,
  
  /** Tag for all entities of a type */
  entityType: (type: string) => `${type}:*`,
  
  /** Tag for a tenant's data */
  tenant: (tenantId: string) => `tenant:${tenantId}`,
  
  /** Tag for a user's data */
  user: (userId: string) => `user:${userId}`,
};
