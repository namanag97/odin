export type SimulationRunsStatus = "running" | "completed" | "failed" | "cancelled";

/**
 * Represents a row in the simulation_runs table
 * Source: 09_simulation.sql
 */
export interface SimulationRuns {
  /** Primary key */
  id: string;
  simulation_model_id: string;
  tenant_id: string;
  name: string | null;
  /** JSON field */
  scenario_config: Record<string, unknown> | null;
  random_seed: number | null;
  started_at: string;
  completed_at: string | null;
  status: SimulationRunsStatus;
  replications: number | null;
  error_message: string | null;
}

/** Insert type for simulation_runs (excludes auto-generated fields) */
export interface SimulationRunsInsert {
  simulation_model_id: string;
  tenant_id: string;
  name?: string | null;
  scenario_config?: Record<string, unknown> | null;
  random_seed?: number | null;
  started_at?: string;
  completed_at?: string | null;
  status: SimulationRunsStatus;
  replications?: number | null;
  error_message?: string | null;
}