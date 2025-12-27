import type { UUID, ISODateTime, ViewId } from "@odin/core-contracts";

export type ComponentId = UUID;

export type ComponentType =
  | 'bar_chart' | 'line_chart' | 'pie_chart' | 'area_chart'
  | 'scatter_chart' | 'histogram' | 'heatmap' | 'funnel'
  | 'data_table' | 'pivot_table' | 'kpi_table'
  | 'process_explorer' | 'variant_explorer' | 'case_explorer'
  | 'dfg_view' | 'bpmn_view' | 'conformance_view'
  | 'dotted_chart' | 'performance_spectrum'
  | 'kpi_card' | 'kpi_list' | 'gauge' | 'sparkline'
  | 'filter_bar' | 'dropdown' | 'date_picker' | 'text_input'
  | 'button' | 'slider' | 'toggle'
  | 'container' | 'tab_container' | 'accordion' | 'card'
  | 'text' | 'image' | 'markdown' | 'iframe';

export interface ComponentPosition {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly zIndex?: number;
}

export interface ComponentConfig {
  readonly title?: string;
  readonly subtitle?: string;
  readonly style?: Record<string, unknown>;
  readonly chartConfig?: Record<string, unknown>;
  readonly tableConfig?: Record<string, unknown>;
  readonly processConfig?: Record<string, unknown>;
  readonly customConfig?: Record<string, unknown>;
}

export interface DataBinding {
  readonly type: BindingType;
  readonly kpis?: readonly string[];
  readonly recordId?: UUID;
  readonly attributes?: readonly string[];
  readonly filters?: readonly UUID[];
  readonly groupBy?: readonly string[];
  readonly sortBy?: readonly SortConfig[];
  readonly limit?: number;
}

export type BindingType = 'kpi' | 'record' | 'event_log' | 'process_model' | 'static';

export interface SortConfig {
  readonly field: string;
  readonly direction: 'asc' | 'desc';
}

export interface InteractivityConfig {
  readonly clickAction?: ClickAction;
  readonly hoverAction?: HoverAction;
  readonly selectionMode?: SelectionMode;
  readonly drilldownEnabled?: boolean;
  readonly linkedComponentIds?: readonly UUID[];
}

export type ClickAction =
  | { type: 'navigate'; viewId: ViewId; params?: Record<string, string> }
  | { type: 'filter'; filterId: UUID }
  | { type: 'drill_down'; dimension: string }
  | { type: 'trigger_action_flow'; actionFlowId: UUID };

export type HoverAction = {
  readonly type: 'tooltip' | 'highlight';
  readonly config?: Record<string, unknown>;
};

export type SelectionMode = 'single' | 'multiple' | 'range';

export interface VisibilityRule {
  readonly type: 'always' | 'conditional' | 'permission';
  readonly condition?: string;
  readonly permissionRequired?: string;
}

export interface Component {
  readonly id: ComponentId;
  readonly viewId: ViewId;
  readonly tabId?: UUID;
  readonly type: ComponentType;
  readonly name?: string;
  readonly position: ComponentPosition;
  readonly config: ComponentConfig;
  readonly dataBinding?: DataBinding;
  readonly interactivity?: InteractivityConfig;
  readonly visibility?: VisibilityRule;
  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
}

export interface CreateComponentData {
  readonly viewId: ViewId;
  readonly tabId?: UUID;
  readonly type: ComponentType;
  readonly name?: string;
  readonly position: ComponentPosition;
  readonly config: ComponentConfig;
  readonly dataBinding?: DataBinding;
  readonly interactivity?: InteractivityConfig;
  readonly visibility?: VisibilityRule;
}

export interface UpdateComponentData {
  readonly name?: string;
  readonly position?: ComponentPosition;
  readonly config?: ComponentConfig;
  readonly dataBinding?: DataBinding;
  readonly interactivity?: InteractivityConfig;
  readonly visibility?: VisibilityRule;
}
