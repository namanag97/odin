/**
 * ID Generator Contract
 * L0 Core Contract - Interface for generating unique identifiers
 */

// ============================================================================
// ID Generator Interface
// ============================================================================

/**
 * ID generation interface
 * Abstracted from concrete implementations (UUID, ULID, nanoid, etc.)
 */
export interface IdGenerator {
  /**
   * Generate a new unique identifier
   * @returns Generated ID string
   */
  generate(): string;
  
  /**
   * Generate a new unique identifier with a prefix
   * @param prefix Prefix to prepend to the ID
   * @returns Generated ID string with prefix
   */
  generateWithPrefix(prefix: string): string;
  
  /**
   * Validate an identifier format
   * @param id ID to validate
   * @returns Whether the ID is valid
   */
  validate(id: string): boolean;
  
  /**
   * Extract timestamp from a time-sortable ID (if supported)
   * @param id ID to extract timestamp from
   * @returns Timestamp in milliseconds, or null if not supported
   */
  extractTimestamp?(id: string): number | null;
}

// ============================================================================
// ID Format Options
// ============================================================================

/**
 * Options for ID generation
 */
export interface IdGeneratorOptions {
  /** ID format type */
  format: 'uuid' | 'ulid' | 'nanoid' | 'cuid' | 'snowflake';
  /** Alphabet for nanoid (only for nanoid format) */
  alphabet?: string;
  /** Length for nanoid (only for nanoid format) */
  length?: number;
  /** Node ID for snowflake (only for snowflake format) */
  nodeId?: number;
}

// ============================================================================
// ID Utilities
// ============================================================================

/**
 * UUID v4 regex pattern
 */
export const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * ULID regex pattern
 */
export const ULID_PATTERN = /^[0-9A-HJKMNP-TV-Z]{26}$/i;

/**
 * Check if a string is a valid UUID v4
 */
export const isValidUUID = (id: string): boolean => UUID_PATTERN.test(id);

/**
 * Check if a string is a valid ULID
 */
export const isValidULID = (id: string): boolean => ULID_PATTERN.test(id);
