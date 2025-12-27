/**
 * Zod schemas for copilot_feedback table
 * Source: 13_copilot.sql
 */

import { z } from "zod";

/** Schema for a copilot_feedback row */
export const CopilotFeedbackSchema = z.object({
  id: z.string().uuid(),
  message_id: z.string().uuid(),
  session_id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  user_id: z.string().uuid(),
  rating: z.number().int().nullable(),
  feedback_type: z.enum(["thumbs_up", "thumbs_down", "correction", "report"]).nullable(),
  comment: z.string().nullable(),
  correction: z.string().nullable(),
  created_at: z.string().datetime({ offset: true }).or(z.string()),
});

export type CopilotFeedback = z.infer<typeof CopilotFeedbackSchema>;

/** Schema for inserting a copilot_feedback row */
export const CopilotFeedbackInsertSchema = z.object({
  message_id: z.string().uuid(),
  session_id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  user_id: z.string().uuid(),
  rating: z.number().int().nullable().optional(),
  feedback_type: z.enum(["thumbs_up", "thumbs_down", "correction", "report"]).nullable().optional(),
  comment: z.string().nullable().optional(),
  correction: z.string().nullable().optional(),
});

export type CopilotFeedbackInsert = z.infer<typeof CopilotFeedbackInsertSchema>;

/** Schema for updating a copilot_feedback row */
export const CopilotFeedbackUpdateSchema = CopilotFeedbackInsertSchema.partial();

export type CopilotFeedbackUpdate = z.infer<typeof CopilotFeedbackUpdateSchema>;