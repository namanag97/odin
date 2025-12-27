export type ComplianceRecordsFramework = "gdpr" | "hipaa" | "soc2" | "iso27001" | "ccpa" | "custom";
export type ComplianceRecordsStatus = "pending" | "in_progress" | "compliant" | "non_compliant" | "not_applicable";

/**
 * Represents a row in the compliance_records table
 * Source: 24_temporal_layer.sql
 */
export interface ComplianceRecords {
  /** Primary key */
  id: string;
  tenant_id: string;
  framework: ComplianceRecordsFramework;
  requirement_id: string;
  status: ComplianceRecordsStatus;
  evidence_type: string | null;
  /** JSON field */
  evidence: Record<string, unknown> | null;
  assessed_at: string;
  assessed_by: string;
  next_review_at: string | null;
  notes: string | null;
  created_at: string;
}

/** Insert type for compliance_records (excludes auto-generated fields) */
export interface ComplianceRecordsInsert {
  tenant_id: string;
  framework: ComplianceRecordsFramework;
  requirement_id: string;
  status?: ComplianceRecordsStatus;
  evidence_type?: string | null;
  evidence?: Record<string, unknown> | null;
  assessed_at: string;
  assessed_by: string;
  next_review_at?: string | null;
  notes?: string | null;
}