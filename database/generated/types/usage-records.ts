
/**
 * Represents a row in the usage_records table
 * Source: 22_commercial_layer.sql
 */
export interface UsageRecords {
  /** Primary key */
  id: string;
  tenant_id: string;
  subscription_id: string;
  resource_type: string;
  quantity: number;
  unit: string;
  timestamp: string;
  idempotency_key: string | null;
  /** JSON field */
  metadata: Record<string, unknown> | null;
}

/** Insert type for usage_records (excludes auto-generated fields) */
export interface UsageRecordsInsert {
  tenant_id: string;
  subscription_id: string;
  resource_type: string;
  quantity: number;
  unit: string;
  timestamp?: string;
  idempotency_key?: string | null;
  metadata?: Record<string, unknown> | null;
}