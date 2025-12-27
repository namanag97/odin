/**
 * ComplianceRecord Entity - Temporal Layer
 * 
 * Tracks compliance-related events and certifications.
 */

import type { 
  UUID, 
  TenantId, 
  UserId, 
  ISODateTime,
  URL
} from '@odin/core-contracts';

// ============================================================================
// Compliance Types
// ============================================================================

/** Type of compliance record */
export type ComplianceType = 
  | 'data_processing_agreement'
  | 'data_retention_policy'
  | 'access_review'
  | 'security_assessment'
  | 'privacy_impact_assessment';

/** Status of compliance record */
export type ComplianceStatus = 'pending' | 'approved' | 'expired' | 'revoked';

/** Compliance framework */
export type ComplianceFramework = 'gdpr' | 'ccpa' | 'hipaa' | 'soc2' | 'iso27001';

// ============================================================================
// Findings & Assessments
// ============================================================================

/** Severity of a compliance finding */
export type FindingSeverity = 'low' | 'medium' | 'high' | 'critical';

/** Status of a compliance finding */
export type FindingStatus = 'open' | 'remediated' | 'accepted';

/**
 * A specific compliance finding
 */
export interface ComplianceFinding {
  readonly id: string;
  readonly severity: FindingSeverity;
  readonly description: string;
  readonly remediation?: string;
  readonly status: FindingStatus;
}

/**
 * Control assessment result
 */
export interface ControlAssessment {
  readonly controlId: string;
  readonly controlName: string;
  readonly status: 'passed' | 'failed' | 'not_applicable';
  readonly evidence?: string;
  readonly notes?: string;
}

/**
 * Detailed compliance information
 */
export interface ComplianceDetails {
  readonly documentUrl?: URL;
  readonly findings?: readonly ComplianceFinding[];
  readonly controls?: readonly ControlAssessment[];
  readonly notes?: string;
}

// ============================================================================
// Entity
// ============================================================================

/**
 * ComplianceRecord - Tracks compliance events and certifications
 */
export interface ComplianceRecord {
  readonly id: UUID;
  readonly tenantId: TenantId;
  readonly type: ComplianceType;
  readonly status: ComplianceStatus;
  readonly framework: ComplianceFramework;
  readonly details: ComplianceDetails;
  readonly attestedBy?: UserId;
  readonly attestedAt?: ISODateTime;
  readonly expiresAt?: ISODateTime;
  readonly createdAt: ISODateTime;
}

// ============================================================================
// DTOs
// ============================================================================

/**
 * Data required to create a compliance record
 */
export interface CreateComplianceRecordData {
  readonly tenantId: TenantId;
  readonly type: ComplianceType;
  readonly framework: ComplianceFramework;
  readonly details: ComplianceDetails;
  readonly expiresAt?: ISODateTime;
}

/**
 * Data for updating a compliance record
 */
export interface UpdateComplianceRecordData {
  readonly status?: ComplianceStatus;
  readonly details?: ComplianceDetails;
  readonly attestedBy?: UserId;
  readonly expiresAt?: ISODateTime;
}
