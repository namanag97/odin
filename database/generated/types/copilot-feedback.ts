export type CopilotFeedbackFeedbackType = "thumbs_up" | "thumbs_down" | "correction" | "report";

/**
 * Represents a row in the copilot_feedback table
 * Source: 13_copilot.sql
 */
export interface CopilotFeedback {
  /** Primary key */
  id: string;
  message_id: string;
  session_id: string;
  tenant_id: string;
  user_id: string;
  rating: number | null;
  feedback_type: CopilotFeedbackFeedbackType | null;
  comment: string | null;
  correction: string | null;
  created_at: string;
}

/** Insert type for copilot_feedback (excludes auto-generated fields) */
export interface CopilotFeedbackInsert {
  message_id: string;
  session_id: string;
  tenant_id: string;
  user_id: string;
  rating?: number | null;
  feedback_type?: CopilotFeedbackFeedbackType | null;
  comment?: string | null;
  correction?: string | null;
}