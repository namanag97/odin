export type WorkflowStepsStepType = "action" | "condition" | "wait" | "parallel" | "loop";

/**
 * Represents a row in the workflow_steps table
 * Source: 10_automation.sql
 */
export interface WorkflowSteps {
  /** Primary key */
  id: string;
  workflow_id: string;
  step_order: number;
  step_type: WorkflowStepsStepType;
  /** JSON field */
  configuration: Record<string, unknown>;
  on_success_step_id: string | null;
  on_failure_step_id: string | null;
  timeout_seconds: number | null;
}

/** Insert type for workflow_steps (excludes auto-generated fields) */
export interface WorkflowStepsInsert {
  workflow_id: string;
  step_order: number;
  step_type: WorkflowStepsStepType;
  configuration: Record<string, unknown>;
  on_success_step_id?: string | null;
  on_failure_step_id?: string | null;
  timeout_seconds?: number | null;
}