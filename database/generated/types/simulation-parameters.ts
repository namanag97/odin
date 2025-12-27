export type SimulationParametersElementType = "activity" | "gateway" | "resource";
export type SimulationParametersSource = "mined" | "manual" | "estimated";

/**
 * Represents a row in the simulation_parameters table
 * Source: 09_simulation.sql
 */
export interface SimulationParameters {
  /** Primary key */
  id: string;
  simulation_model_id: string;
  element_type: SimulationParametersElementType;
  element_name: string;
  parameter_name: string;
  distribution: string;
  distribution_params: string;
  source: SimulationParametersSource | null;
}

/** Insert type for simulation_parameters (excludes auto-generated fields) */
export interface SimulationParametersInsert {
  simulation_model_id: string;
  element_type: SimulationParametersElementType;
  element_name: string;
  parameter_name: string;
  distribution: string;
  distribution_params: string;
  source?: SimulationParametersSource | null;
}