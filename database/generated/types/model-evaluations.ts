export type ModelEvaluationsEvaluationType = "training" | "validation" | "test" | "production";

/**
 * Represents a row in the model_evaluations table
 * Source: 08_prediction.sql
 */
export interface ModelEvaluations {
  /** Primary key */
  id: string;
  prediction_model_id: string;
  tenant_id: string;
  evaluated_at: string;
  evaluation_type: ModelEvaluationsEvaluationType;
  sample_size: number;
  metrics: string;
}

/** Insert type for model_evaluations (excludes auto-generated fields) */
export interface ModelEvaluationsInsert {
  prediction_model_id: string;
  tenant_id: string;
  evaluated_at?: string;
  evaluation_type: ModelEvaluationsEvaluationType;
  sample_size: number;
  metrics: string;
}