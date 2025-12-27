export type VariablesScopeType = "knowledge_model" | "view" | "package";
export type VariablesDataType = "string" | "number" | "date" | "boolean" | "array" | "object";
export type VariablesUiComponent = "input_box" | "dropdown" | "date_picker" | "checkbox" | "slider";

/**
 * Represents a row in the variables table
 * Source: 16_semantic.sql
 */
export interface Variables {
  /** Primary key */
  id: string;
  tenant_id: string;
  scope_type: VariablesScopeType;
  scope_id: string;
  key: string;
  display_name: string | null;
  description: string | null;
  data_type: VariablesDataType;
  default_value: string | null;
  current_value: string | null;
  validation_pql: string | null;
  is_required: number;
  is_user_editable: number;
  ui_component: VariablesUiComponent | null;
  options_pql: string | null;
  created_at: string;
  updated_at: string;
}

/** Insert type for variables (excludes auto-generated fields) */
export interface VariablesInsert {
  tenant_id: string;
  scope_type: VariablesScopeType;
  scope_id: string;
  key: string;
  display_name?: string | null;
  description?: string | null;
  data_type: VariablesDataType;
  default_value?: string | null;
  current_value?: string | null;
  validation_pql?: string | null;
  is_required?: number;
  is_user_editable?: number;
  ui_component?: VariablesUiComponent | null;
  options_pql?: string | null;
}