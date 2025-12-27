export type SimulationModelsSimulationType = "discrete_event" | "monte_carlo" | "agent_based";

/**
 * Represents a row in the simulation_models table
 * Source: 09_simulation.sql
 */
export interface SimulationModels {
  /** Primary key */
  id: string;
  tenant_id: string;
  discovered_model_id: string | null;
  event_log_id: string | null;
  name: string;
  description: string | null;
  simulation_type: SimulationModelsSimulationType;
  /** JSON field */
  base_configuration: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

/** Insert type for simulation_models (excludes auto-generated fields) */
export interface SimulationModelsInsert {
  tenant_id: string;
  discovered_model_id?: string | null;
  event_log_id?: string | null;
  name: string;
  description?: string | null;
  simulation_type: SimulationModelsSimulationType;
  base_configuration: Record<string, unknown>;
}