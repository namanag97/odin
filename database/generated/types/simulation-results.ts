
/**
 * Represents a row in the simulation_results table
 * Source: 09_simulation.sql
 */
export interface SimulationResults {
  /** Primary key */
  id: string;
  simulation_run_id: string;
  tenant_id: string;
  replication_number: number | null;
  summary_statistics: string;
  activity_statistics: string;
  resource_statistics: string;
  /** JSON field */
  queue_statistics: Record<string, unknown> | null;
  /** JSON field */
  cost_analysis: Record<string, unknown> | null;
  raw_output_path: string | null;
}

/** Insert type for simulation_results (excludes auto-generated fields) */
export interface SimulationResultsInsert {
  simulation_run_id: string;
  tenant_id: string;
  replication_number?: number | null;
  summary_statistics: string;
  activity_statistics: string;
  resource_statistics: string;
  queue_statistics?: Record<string, unknown> | null;
  cost_analysis?: Record<string, unknown> | null;
  raw_output_path?: string | null;
}