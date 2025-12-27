
/**
 * Represents a row in the predictions table
 * Source: 08_prediction.sql
 */
export interface Predictions {
  /** Primary key */
  id: string;
  prediction_model_id: string;
  tenant_id: string;
  case_id: string | null;
  predicted_at: string;
  input_features: string;
  prediction_value: string;
  confidence: number | null;
  probabilities: string | null;
  actual_value: string | null;
  is_correct: number | null;
}

/** Insert type for predictions (excludes auto-generated fields) */
export interface PredictionsInsert {
  prediction_model_id: string;
  tenant_id: string;
  case_id?: string | null;
  predicted_at?: string;
  input_features: string;
  prediction_value: string;
  confidence?: number | null;
  probabilities?: string | null;
  actual_value?: string | null;
  is_correct?: number | null;
}