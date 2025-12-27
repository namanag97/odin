export type ActionsActionType = "webhook" | "email" | "slack" | "create_task" | "update_attribute" | "log";

/**
 * Represents a row in the actions table
 * Source: 10_automation.sql
 */
export interface Actions {
  /** Primary key */
  id: string;
  tenant_id: string;
  rule_id: string;
  action_type: ActionsActionType;
  action_order: number | null;
  /** JSON field */
  configuration: Record<string, unknown>;
  is_active: number | null;
  created_at: string;
}

/** Insert type for actions (excludes auto-generated fields) */
export interface ActionsInsert {
  tenant_id: string;
  rule_id: string;
  action_type: ActionsActionType;
  action_order?: number | null;
  configuration: Record<string, unknown>;
  is_active?: number | null;
}