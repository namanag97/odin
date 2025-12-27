/**
 * Zod schemas for compliance_records table
 * Source: 24_temporal_layer.sql
 */

import { z } from "zod";

/** Schema for a compliance_records row */
export const ComplianceRecordsSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  framework: z.enum(["gdpr", "hipaa", "soc2", "iso27001", "ccpa", "custom"]),
  requirement_id: z.string().uuid(),
  status: z.enum(["pending", "in_progress", "compliant", "non_compliant", "not_applicable"]),
  evidence_type: z.string().nullable(),
  evidence: z.record(z.string(), z.unknown()).nullable(),
  assessed_at: z.string().datetime({ offset: true }).or(z.string()),
  assessed_by: z.string(),
  next_review_at: z.string().datetime({ offset: true }).or(z.string()).nullable(),
  notes: z.string().nullable(),
  created_at: z.string().datetime({ offset: true }).or(z.string()),
});

export type ComplianceRecords = z.infer<typeof ComplianceRecordsSchema>;

/** Schema for inserting a compliance_records row */
export const ComplianceRecordsInsertSchema = z.object({
  tenant_id: z.string().uuid(),
  framework: z.enum(["gdpr", "hipaa", "soc2", "iso27001", "ccpa", "custom"]),
  requirement_id: z.string().uuid(),
  status: z.enum(["pending", "in_progress", "compliant", "non_compliant", "not_applicable"]).optional(),
  evidence_type: z.string().nullable().optional(),
  evidence: z.record(z.string(), z.unknown()).nullable().optional(),
  assessed_at: z.string().datetime({ offset: true }).or(z.string()),
  assessed_by: z.string(),
  next_review_at: z.string().datetime({ offset: true }).or(z.string()).nullable().optional(),
  notes: z.string().nullable().optional(),
});

export type ComplianceRecordsInsert = z.infer<typeof ComplianceRecordsInsertSchema>;

/** Schema for updating a compliance_records row */
export const ComplianceRecordsUpdateSchema = ComplianceRecordsInsertSchema.partial();

export type ComplianceRecordsUpdate = z.infer<typeof ComplianceRecordsUpdateSchema>;