/**
 * Storage Contract
 * L0 Core Contract - File storage interface
 */

// ============================================================================
// Storage Types
// ============================================================================

/**
 * File metadata
 */
export interface FileMetadata {
  /** File name */
  name: string;
  /** File size in bytes */
  size: number;
  /** MIME type */
  contentType: string;
  /** Last modified timestamp */
  lastModified: Date;
  /** Additional metadata */
  metadata?: Record<string, string>;
}

/**
 * Upload options
 */
export interface UploadOptions {
  /** Content type override */
  contentType?: string;
  /** Custom metadata */
  metadata?: Record<string, string>;
  /** Enable public access */
  public?: boolean;
  /** Cache control header */
  cacheControl?: string;
}

/**
 * Download options
 */
export interface DownloadOptions {
  /** Byte range start */
  rangeStart?: number;
  /** Byte range end */
  rangeEnd?: number;
}

/**
 * List options
 */
export interface ListOptions {
  /** Path prefix to filter by */
  prefix?: string;
  /** Delimiter for hierarchy */
  delimiter?: string;
  /** Maximum results */
  limit?: number;
  /** Continuation token */
  cursor?: string;
}

/**
 * List result
 */
export interface ListResult {
  /** Files in the result */
  files: FileMetadata[];
  /** Folders/prefixes in the result */
  prefixes: string[];
  /** Continuation token for pagination */
  nextCursor?: string;
}

/**
 * Signed URL options
 */
export interface SignedUrlOptions {
  /** URL expiry in seconds */
  expiresIn: number;
  /** HTTP method for the URL */
  method?: 'GET' | 'PUT';
  /** Content type for PUT */
  contentType?: string;
}

// ============================================================================
// Storage Interface
// ============================================================================

/**
 * Storage interface for file operations
 * Abstracted from concrete implementations (local, S3, GCS, etc.)
 */
export interface Storage {
  /**
   * Upload a file
   * @param path Destination path
   * @param content File content (Buffer, Blob, or stream)
   * @param options Upload options
   */
  upload(
    path: string,
    content: Buffer | Blob | ReadableStream,
    options?: UploadOptions
  ): Promise<FileMetadata>;
  
  /**
   * Download a file
   * @param path File path
   * @param options Download options
   */
  download(path: string, options?: DownloadOptions): Promise<Buffer>;
  
  /**
   * Get file as a readable stream
   * @param path File path
   */
  getStream(path: string): Promise<ReadableStream>;
  
  /**
   * Check if a file exists
   * @param path File path
   */
  exists(path: string): Promise<boolean>;
  
  /**
   * Get file metadata
   * @param path File path
   */
  getMetadata(path: string): Promise<FileMetadata | null>;
  
  /**
   * Delete a file
   * @param path File path
   */
  delete(path: string): Promise<void>;
  
  /**
   * Copy a file
   * @param source Source path
   * @param destination Destination path
   */
  copy(source: string, destination: string): Promise<void>;
  
  /**
   * Move a file
   * @param source Source path
   * @param destination Destination path
   */
  move(source: string, destination: string): Promise<void>;
  
  /**
   * List files in a directory
   * @param path Directory path
   * @param options List options
   */
  list(path: string, options?: ListOptions): Promise<ListResult>;
  
  /**
   * Generate a signed URL for direct access
   * @param path File path
   * @param options Signed URL options
   */
  getSignedUrl(path: string, options: SignedUrlOptions): Promise<string>;
}

// ============================================================================
// Storage Path Utilities
// ============================================================================

/**
 * Build a tenant-scoped storage path
 */
export const buildTenantPath = (tenantId: string, ...segments: string[]): string => {
  return ['tenants', tenantId, ...segments].join('/');
};

/**
 * Build a user-scoped storage path
 */
export const buildUserPath = (tenantId: string, userId: string, ...segments: string[]): string => {
  return ['tenants', tenantId, 'users', userId, ...segments].join('/');
};
