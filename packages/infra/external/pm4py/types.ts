/**
 * PM4Py Type Mappings
 *
 * Type definitions for PM4Py Python library integration
 */

/**
 * Discovery algorithm options
 */
export type DiscoveryAlgorithm = "alpha" | "inductive" | "heuristic" | "split";

/**
 * Model export formats
 */
export type ExportFormat = "pnml" | "bpmn" | "dot" | "svg";

/**
 * Conformance metrics
 */
export interface ConformanceMetrics {
  fitness: number; // [0,1] - How well log fits model
  precision: number; // [0,1] - How precise the model is
  generalization: number; // [0,1] - How general the model is
  simplicity: number; // [0,1] - How simple the model is
}

/**
 * Event log entry (XES format)
 */
export interface XESEvent {
  "concept:name": string; // Activity name
  "time:timestamp": string; // ISO timestamp
  "org:resource"?: string; // Resource
  [key: string]: any; // Additional attributes
}

/**
 * Event log trace
 */
export interface XESTrace {
  "concept:name": string; // Case ID
  events: XESEvent[];
  [key: string]: any; // Additional case attributes
}

/**
 * Event log (XES format)
 */
export interface XESLog {
  traces: XESTrace[];
  attributes?: Record<string, any>;
}
