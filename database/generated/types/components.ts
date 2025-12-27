export type ComponentsComponentType = "chart" | "table" | "kpi_list" | "process_explorer" | "variant_explorer" | "text" | "button" | "input" | "filter_bar" | "tab" | "container" | "action_button" | "image" | "custom";

/**
 * Represents a row in the components table
 * Source: 17_studio.sql
 */
export interface Components {
  /** Primary key */
  id: string;
  tenant_id: string;
  view_id: string;
  parent_id: string | null;
  component_type: ComponentsComponentType;
  key: string;
  title: string | null;
  description: string | null;
  layout_position: string;
  /** JSON field */
  data_config: Record<string, unknown> | null;
  /** JSON field */
  visual_config: Record<string, unknown> | null;
  /** JSON field */
  interaction_config: Record<string, unknown> | null;
  is_visible: number;
  visibility_expression: string | null;
  sort_order: number | null;
  /** JSON field */
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

/** Insert type for components (excludes auto-generated fields) */
export interface ComponentsInsert {
  tenant_id: string;
  view_id: string;
  parent_id?: string | null;
  component_type: ComponentsComponentType;
  key: string;
  title?: string | null;
  description?: string | null;
  layout_position: string;
  data_config?: Record<string, unknown> | null;
  visual_config?: Record<string, unknown> | null;
  interaction_config?: Record<string, unknown> | null;
  is_visible?: number;
  visibility_expression?: string | null;
  sort_order?: number | null;
  metadata?: Record<string, unknown> | null;
}