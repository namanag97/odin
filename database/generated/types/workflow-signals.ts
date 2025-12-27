
/**
 * Represents a row in the workflow_signals table
 * Source: 14_workflow_eventsource.sql
 */
export interface WorkflowSignals {
  /** Primary key */
  id: string;
  execution_id: string;
  tenant_id: string;
  signal_name: string;
  signal_input: string | null;
  source_type: string | null;
  source_id: string | null;
  received_at: string;
  processed_at: string | null;
}

/** Insert type for workflow_signals (excludes auto-generated fields) */
export interface WorkflowSignalsInsert {
  execution_id: string;
  tenant_id: string;
  signal_name: string;
  signal_input?: string | null;
  source_type?: string | null;
  source_id?: string | null;
  received_at?: string;
  processed_at?: string | null;
}