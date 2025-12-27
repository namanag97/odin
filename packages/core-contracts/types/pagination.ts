/**
 * Pagination Types
 * L0 Core Contract - Shared pagination primitives
 */

// ============================================================================
// Sort Direction
// ============================================================================

export type SortDirection = 'asc' | 'desc';

// ============================================================================
// Page Request
// ============================================================================

/**
 * Standard page request parameters
 * Used by all list/query endpoints
 */
export interface PageRequest {
  /** Page number (1-indexed) */
  page?: number;
  /** Items per page */
  limit?: number;
  /** Field to sort by */
  sortBy?: string;
  /** Sort direction */
  sortDir?: SortDirection;
}

/**
 * Extended page request with filtering
 */
export interface FilteredPageRequest<TFilter = Record<string, unknown>> extends PageRequest {
  /** Filter criteria */
  filter?: TFilter;
  /** Search query string */
  search?: string;
}

// ============================================================================
// Page Response
// ============================================================================

/**
 * Standard paginated response
 * Returned by all list/query endpoints
 */
export interface PageResponse<T> {
  /** Array of items for this page */
  data: T[];
  /** Current page number (1-indexed) */
  page: number;
  /** Items per page */
  limit: number;
  /** Total number of items across all pages */
  total: number;
  /** Total number of pages */
  totalPages: number;
  /** Whether there is a next page */
  hasNext: boolean;
  /** Whether there is a previous page */
  hasPrev: boolean;
}

// ============================================================================
// Cursor-based Pagination (alternative)
// ============================================================================

/**
 * Cursor-based page request
 * More efficient for large datasets
 */
export interface CursorPageRequest {
  /** Cursor pointing to the last item of the previous page */
  cursor?: string;
  /** Number of items to fetch */
  limit?: number;
  /** Direction to paginate */
  direction?: 'forward' | 'backward';
}

/**
 * Cursor-based page response
 */
export interface CursorPageResponse<T> {
  /** Array of items */
  data: T[];
  /** Cursor for the next page */
  nextCursor: string | null;
  /** Cursor for the previous page */
  prevCursor: string | null;
  /** Whether there are more items */
  hasMore: boolean;
}

// ============================================================================
// Defaults
// ============================================================================

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;
export const DEFAULT_SORT_DIR: SortDirection = 'desc';
