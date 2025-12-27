/**
 * Zod schemas for tenant_settings table
 * Source: 23_operational_layer.sql
 */

import { z } from "zod";

/** Schema for a tenant_settings row */
export const TenantSettingsSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  timezone: z.string(),
  date_format: z.string(),
  locale: z.string(),
  currency: z.string(),
  branding: z.record(z.string(), z.unknown()).nullable(),
  security_settings: z.record(z.string(), z.unknown()).nullable(),
  notification_settings: z.record(z.string(), z.unknown()).nullable(),
  feature_flags: z.record(z.string(), z.unknown()).nullable(),
  custom_fields_schema: z.record(z.string(), z.unknown()).nullable(),
  updated_at: z.string().datetime({ offset: true }).or(z.string()),
});

export type TenantSettings = z.infer<typeof TenantSettingsSchema>;

/** Schema for inserting a tenant_settings row */
export const TenantSettingsInsertSchema = z.object({
  tenant_id: z.string().uuid(),
  timezone: z.string().optional(),
  date_format: z.string().optional(),
  locale: z.string().optional(),
  currency: z.string().optional(),
  branding: z.record(z.string(), z.unknown()).nullable().optional(),
  security_settings: z.record(z.string(), z.unknown()).nullable().optional(),
  notification_settings: z.record(z.string(), z.unknown()).nullable().optional(),
  feature_flags: z.record(z.string(), z.unknown()).nullable().optional(),
  custom_fields_schema: z.record(z.string(), z.unknown()).nullable().optional(),
});

export type TenantSettingsInsert = z.infer<typeof TenantSettingsInsertSchema>;

/** Schema for updating a tenant_settings row */
export const TenantSettingsUpdateSchema = TenantSettingsInsertSchema.partial();

export type TenantSettingsUpdate = z.infer<typeof TenantSettingsUpdateSchema>;