import type {
  AsyncResult,
  UUID,
  TenantId,
  UserId,
  ISODateTime,
  Duration,
  Percentage,
} from "@odin/core-contracts";
import type { IService, OperationContext } from "./base";
import type { PaginatedResult, Pagination, DateRange } from "./common";

/**
 * Abstraction over file storage (local, S3, GCS, Azure Blob).
 */
export interface IFileStorageService extends IService {
  // Upload
  uploadFile(input: UploadFileInput, ctx: OperationContext): AsyncResult<StoredFile>;
  uploadChunked(input: UploadChunkedInput, ctx: OperationContext): AsyncResult<ChunkedUploadSession>;
  completeChunkedUpload(sessionId: UUID, ctx: OperationContext): AsyncResult<StoredFile>;
  abortChunkedUpload(sessionId: UUID, ctx: OperationContext): AsyncResult<void>;

  // Download
  downloadFile(fileId: UUID, ctx: OperationContext): AsyncResult<FileDownload>;
  getSignedUrl(input: SignedUrlInput, ctx: OperationContext): AsyncResult<SignedUrl>;

  // Management
  getFileMetadata(fileId: UUID, ctx: OperationContext): AsyncResult<StoredFile>;
  listFiles(input: ListFilesInput, ctx: OperationContext): AsyncResult<PaginatedResult<StoredFile>>;
  deleteFile(fileId: UUID, ctx: OperationContext): AsyncResult<void>;
  copyFile(input: CopyFileInput, ctx: OperationContext): AsyncResult<StoredFile>;
  moveFile(input: MoveFileInput, ctx: OperationContext): AsyncResult<StoredFile>;

  // Utilities
  getStorageUsage(ctx: OperationContext): AsyncResult<StorageUsage>;
  validateFile(input: ValidateFileInput, ctx: OperationContext): AsyncResult<FileValidation>;
}

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

export type FileCategory =
  | 'import'           // Data imports
  | 'export'           // Generated exports
  | 'attachment'       // User attachments
  | 'model'            // Process models
  | 'temp';            // Temporary files

export type FileVisibility = 'private' | 'internal' | 'public';

// ═══════════════════════════════════════════════════════════════
// DTOs
// ═══════════════════════════════════════════════════════════════

export interface UploadFileInput {
  readonly content: Buffer | ReadableStream;
  readonly filename: string;
  readonly mimeType: string;
  readonly category: FileCategory;
  readonly metadata?: Record<string, string>;
  readonly visibility?: FileVisibility;
}

export interface StoredFile {
  readonly id: UUID;
  readonly tenantId: TenantId;
  readonly filename: string;
  readonly originalFilename: string;
  readonly mimeType: string;
  readonly size: number;
  readonly category: FileCategory;
  readonly visibility: FileVisibility;
  readonly checksum: string;
  readonly storagePath: string;
  readonly metadata: Record<string, string>;
  readonly uploadedBy: UserId;
  readonly createdAt: ISODateTime;
  readonly expiresAt?: ISODateTime;
}

export interface UploadChunkedInput {
  readonly filename: string;
  readonly mimeType: string;
  readonly totalSize: number;
  readonly chunkSize: number;
  readonly category: FileCategory;
}

export interface ChunkedUploadSession {
  readonly sessionId: UUID;
  readonly uploadUrl: string;
  readonly expiresAt: ISODateTime;
  readonly chunkSize: number;
  readonly totalChunks: number;
}

export interface FileDownload {
  readonly file: StoredFile;
  readonly content: ReadableStream;
}

export interface SignedUrlInput {
  readonly fileId: UUID;
  readonly operation: 'read' | 'write';
  readonly expiresIn: Duration;
  readonly contentDisposition?: 'inline' | 'attachment';
}

export interface SignedUrl {
  readonly url: string;
  readonly expiresAt: ISODateTime;
  readonly headers?: Record<string, string>;
}

export interface ListFilesInput {
  readonly category?: FileCategory;
  readonly mimeTypes?: readonly string[];
  readonly uploadedBy?: UserId;
  readonly dateRange?: DateRange;
  readonly search?: string;
  readonly pagination?: Pagination;
}

export interface CopyFileInput {
  readonly sourceFileId: UUID;
  readonly newFilename?: string;
  readonly newCategory?: FileCategory;
}

export interface MoveFileInput {
  readonly fileId: UUID;
  readonly newCategory: FileCategory;
}

export interface StorageUsage {
  readonly totalBytes: number;
  readonly limitBytes: number;
  readonly usagePercentage: Percentage;
  readonly byCategory: Record<FileCategory, number>;
  readonly fileCount: number;
}

export interface ValidateFileInput {
  readonly fileId?: UUID;
  readonly content?: Buffer;
  readonly expectedMimeTypes?: readonly string[];
  readonly maxSize?: number;
  readonly validateContent?: boolean;
}

export interface FileValidation {
  readonly valid: boolean;
  readonly detectedMimeType: string;
  readonly size: number;
  readonly errors: readonly string[];
  readonly warnings: readonly string[];
}
