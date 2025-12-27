/**
 * Domain Enums
 * L0 Core Contract - All domain-specific enumerations
 */

// ============================================================================
// Data Types
// ============================================================================

/**
 * Data types for schema definitions and column types
 */
export enum DataType {
  STRING = 'string',
  INTEGER = 'integer',
  FLOAT = 'float',
  DATE = 'date',
  DATETIME = 'datetime',
  BOOLEAN = 'boolean',
  JSON = 'json',
  TEXT = 'text',
  BLOB = 'blob',
}

// ============================================================================
// Connection & Data Integration
// ============================================================================

/**
 * Types of data connections
 */
export enum ConnectionType {
  CSV = 'csv',
  XLSX = 'xlsx',
  JDBC = 'jdbc',
  API = 'api',
  PARQUET = 'parquet',
  JSON = 'json',
  DATABASE = 'database',
}

/**
 * Connection health status
 */
export enum ConnectionStatus {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  ERROR = 'error',
  UNKNOWN = 'unknown',
  CONNECTING = 'connecting',
}

/**
 * Data load status
 */
export enum LoadStatus {
  IDLE = 'idle',
  LOADING = 'loading',
  LOADED = 'loaded',
  FAILED = 'failed',
  STALE = 'stale',
}

/**
 * Data load type
 */
export enum LoadType {
  FULL = 'full',
  DELTA = 'delta',
  INCREMENTAL = 'incremental',
}

// ============================================================================
// Process Mining
// ============================================================================

/**
 * Data model type
 */
export enum DataModelType {
  CASE_CENTRIC = 'case_centric',
  OBJECT_CENTRIC = 'object_centric',
}

/**
 * Knowledge model type
 */
export enum KMType {
  BASE = 'base',
  EXTENSION = 'extension',
}

// ============================================================================
// Automation
// ============================================================================

/**
 * Action flow lifecycle status
 */
export enum ActionFlowStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  DEACTIVATED = 'deactivated',
  ARCHIVED = 'archived',
}

/**
 * Trigger types for automation
 */
export enum TriggerType {
  MANUAL = 'manual',
  SCHEDULED = 'scheduled',
  EVENT = 'event',
  SENSOR = 'sensor',
  WEBHOOK = 'webhook',
}

/**
 * Execution status for jobs and tasks
 */
export enum ExecutionStatus {
  PENDING = 'pending',
  QUEUED = 'queued',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  PAUSED = 'paused',
  RETRYING = 'retrying',
}

/**
 * Task status for action items
 */
export enum TaskStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

/**
 * Signal status for alerts and notifications
 */
export enum SignalStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  SNOOZED = 'snoozed',
  RESOLVED = 'resolved',
  DISMISSED = 'dismissed',
}

// ============================================================================
// Studio & UI
// ============================================================================

/**
 * Dashboard layout type
 */
export enum LayoutType {
  SCALE_TO_FIT = 'scale_to_fit',
  CUSTOM_HEIGHT = 'custom_height',
  FIXED = 'fixed',
  RESPONSIVE = 'responsive',
}

/**
 * Component types for dashboards and views
 */
export enum ComponentType {
  // Charts
  BAR_CHART = 'bar_chart',
  LINE_CHART = 'line_chart',
  PIE_CHART = 'pie_chart',
  DONUT_CHART = 'donut_chart',
  AREA_CHART = 'area_chart',
  SCATTER_CHART = 'scatter_chart',
  COMBO_CHART = 'combo_chart',
  FUNNEL_CHART = 'funnel_chart',
  GAUGE_CHART = 'gauge_chart',
  HEATMAP = 'heatmap',
  TREEMAP = 'treemap',
  SANKEY = 'sankey',
  
  // Tables
  TABLE = 'table',
  PIVOT_TABLE = 'pivot_table',
  
  // Process
  PROCESS_MAP = 'process_map',
  VARIANT_EXPLORER = 'variant_explorer',
  THROUGHPUT_ANALYSIS = 'throughput_analysis',
  CONFORMANCE_VIEW = 'conformance_view',
  
  // KPIs & Metrics
  KPI_CARD = 'kpi_card',
  METRIC_TILE = 'metric_tile',
  SCOREBOARD = 'scoreboard',
  
  // Inputs
  DROPDOWN = 'dropdown',
  DATE_PICKER = 'date_picker',
  DATE_RANGE_PICKER = 'date_range_picker',
  TEXT_INPUT = 'text_input',
  CHECKBOX = 'checkbox',
  RADIO_GROUP = 'radio_group',
  SLIDER = 'slider',
  BUTTON = 'button',
  
  // Layout
  CONTAINER = 'container',
  TAB_CONTAINER = 'tab_container',
  ACCORDION = 'accordion',
  MARKDOWN = 'markdown',
  IMAGE = 'image',
  IFRAME = 'iframe',
}

// ============================================================================
// Process Mining Enums (PM4Py Aligned)
// ============================================================================

/**
 * Process discovery algorithms (PM4Py compatible)
 */
export type DiscoveryAlgorithm =
  | 'alpha'
  | 'alpha_plus'
  | 'inductive'
  | 'inductive_infrequent'
  | 'inductive_dfg'
  | 'heuristic'
  | 'ilp'
  | 'correlation';

/**
 * Conformance checking methods (PM4Py compatible)
 */
export type ConformanceMethod =
  | 'token_replay'
  | 'alignments'
  | 'footprints';

/**
 * Process model types
 */
export type ProcessModelType =
  | 'petri_net'
  | 'process_tree'
  | 'bpmn'
  | 'dfg'
  | 'causal_net'
  | 'powl'
  | 'ocel_net';

/**
 * Process mining metric types
 */
export type MetricType =
  | 'fitness'
  | 'precision'
  | 'generalization'
  | 'simplicity';

/**
 * Publish status for models and packages
 */
export type PublishStatus = 'draft' | 'published' | 'deprecated';

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Check if a value is a valid enum member
 */
export const isEnumValue = <T extends Record<string, string>>(
  enumObj: T,
  value: unknown
): value is T[keyof T] => {
  return Object.values(enumObj).includes(value as T[keyof T]);
};
