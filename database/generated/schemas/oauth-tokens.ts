/**
 * Zod schemas for oauth_tokens table
 * Source: 25_integration_layer.sql
 */

import { z } from "zod";

/** Schema for a oauth_tokens row */
export const OauthTokensSchema = z.object({
  id: z.string().uuid(),
  integration_id: z.string().uuid(),
  user_id: z.string().uuid().nullable(),
  access_token_enc: z.string(),
  refresh_token_enc: z.string().nullable(),
  token_type: z.string(),
  scope: z.string().nullable(),
  expires_at: z.string().datetime({ offset: true }).or(z.string()),
  created_at: z.string().datetime({ offset: true }).or(z.string()),
  updated_at: z.string().datetime({ offset: true }).or(z.string()),
});

export type OauthTokens = z.infer<typeof OauthTokensSchema>;

/** Schema for inserting a oauth_tokens row */
export const OauthTokensInsertSchema = z.object({
  integration_id: z.string().uuid(),
  user_id: z.string().uuid().nullable().optional(),
  access_token_enc: z.string(),
  refresh_token_enc: z.string().nullable().optional(),
  token_type: z.string().optional(),
  scope: z.string().nullable().optional(),
  expires_at: z.string().datetime({ offset: true }).or(z.string()),
});

export type OauthTokensInsert = z.infer<typeof OauthTokensInsertSchema>;

/** Schema for updating a oauth_tokens row */
export const OauthTokensUpdateSchema = OauthTokensInsertSchema.partial();

export type OauthTokensUpdate = z.infer<typeof OauthTokensUpdateSchema>;