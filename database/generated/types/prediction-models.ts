export type PredictionModelsPredictionType = "next_activity" | "remaining_time" | "outcome" | "next_timestamp";
export type PredictionModelsStatus = "training" | "trained" | "deployed" | "retired";

/**
 * Represents a row in the prediction_models table
 * Source: 08_prediction.sql
 */
export interface PredictionModels {
  /** Primary key */
  id: string;
  tenant_id: string;
  event_log_id: string | null;
  data_pool_id: string | null;
  name: string;
  description: string | null;
  prediction_type: PredictionModelsPredictionType;
  algorithm: string;
  /** JSON field */
  hyperparameters: Record<string, unknown> | null;
  feature_ids: string;
  model_binary: Buffer | null;
  model_file_path: string | null;
  training_date: string;
  training_samples: number | null;
  status: PredictionModelsStatus | null;
  created_at: string;
}

/** Insert type for prediction_models (excludes auto-generated fields) */
export interface PredictionModelsInsert {
  tenant_id: string;
  event_log_id?: string | null;
  data_pool_id?: string | null;
  name: string;
  description?: string | null;
  prediction_type: PredictionModelsPredictionType;
  algorithm: string;
  hyperparameters?: Record<string, unknown> | null;
  feature_ids: string;
  model_binary?: Buffer | null;
  model_file_path?: string | null;
  training_date: string;
  training_samples?: number | null;
  status?: PredictionModelsStatus | null;
}