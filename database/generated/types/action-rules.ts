export type ActionRulesRuleType = "pattern" | "threshold" | "anomaly" | "schedule" | "new_case" | "case_completed";

/**
 * Represents a row in the action_rules table
 * Source: 10_automation.sql
 */
export interface ActionRules {
  /** Primary key */
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  event_log_id: string | null;
  data_pool_id: string | null;
  rule_type: ActionRulesRuleType;
  condition: string;
  is_active: number | null;
  cooldown_seconds: number | null;
  last_triggered_at: string | null;
  trigger_count: number | null;
  created_at: string;
  updated_at: string;
}

/** Insert type for action_rules (excludes auto-generated fields) */
export interface ActionRulesInsert {
  tenant_id: string;
  name: string;
  description?: string | null;
  event_log_id?: string | null;
  data_pool_id?: string | null;
  rule_type: ActionRulesRuleType;
  condition: string;
  is_active?: number | null;
  cooldown_seconds?: number | null;
  last_triggered_at?: string | null;
  trigger_count?: number | null;
}