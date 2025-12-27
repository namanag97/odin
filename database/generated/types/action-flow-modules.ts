export type ActionFlowModulesModuleType = "trigger" | "action" | "transformer" | "aggregator" | "router" | "error_handler" | "iterator" | "repeater";
export type ActionFlowModulesErrorHandlerType = "break" | "resume" | "rollback" | "ignore" | "commit";

/**
 * Represents a row in the action_flow_modules table
 * Source: 18_automation_enhanced.sql
 */
export interface ActionFlowModules {
  /** Primary key */
  id: string;
  tenant_id: string;
  action_flow_id: string;
  parent_module_id: string | null;
  module_type: ActionFlowModulesModuleType;
  app_name: string;
  action_name: string;
  connection_id: string | null;
  position: number;
  /** JSON field */
  configuration: Record<string, unknown>;
  /** JSON field */
  input_mapping: Record<string, unknown> | null;
  /** JSON field */
  output_mapping: Record<string, unknown> | null;
  error_handler_type: ActionFlowModulesErrorHandlerType | null;
  is_acid: number;
  /** JSON field */
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

/** Insert type for action_flow_modules (excludes auto-generated fields) */
export interface ActionFlowModulesInsert {
  tenant_id: string;
  action_flow_id: string;
  parent_module_id?: string | null;
  module_type: ActionFlowModulesModuleType;
  app_name: string;
  action_name: string;
  connection_id?: string | null;
  position: number;
  configuration: Record<string, unknown>;
  input_mapping?: Record<string, unknown> | null;
  output_mapping?: Record<string, unknown> | null;
  error_handler_type?: ActionFlowModulesErrorHandlerType | null;
  is_acid?: number;
  metadata?: Record<string, unknown> | null;
}