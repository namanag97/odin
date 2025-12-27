export type ReasoningRulesRuleFormat = "swrl" | "sparql_construct" | "custom";

/**
 * Represents a row in the reasoning_rules table
 * Source: 04_ontology.sql
 */
export interface ReasoningRules {
  /** Primary key */
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  rule_body: string;
  rule_head: string;
  rule_format: ReasoningRulesRuleFormat | null;
  priority: number | null;
  is_active: number | null;
  last_executed_at: string | null;
  inferences_count: number | null;
  created_at: string;
}

/** Insert type for reasoning_rules (excludes auto-generated fields) */
export interface ReasoningRulesInsert {
  tenant_id: string;
  name: string;
  description?: string | null;
  rule_body: string;
  rule_head: string;
  rule_format?: ReasoningRulesRuleFormat | null;
  priority?: number | null;
  is_active?: number | null;
  last_executed_at?: string | null;
  inferences_count?: number | null;
}