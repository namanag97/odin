-- ============================================================================
-- PHASE 8: PREDICTION & ML (4 tables)
-- ============================================================================

-- -----------------------------------------------------------------------------
-- Table: prediction_features
-- Purpose: Feature definitions for ML models
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS prediction_features (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    feature_type TEXT NOT NULL CHECK (feature_type IN ('case_attribute', 'event_attribute', 'derived', 'temporal', 'sequence')),
    data_type TEXT NOT NULL CHECK (data_type IN ('numeric', 'categorical', 'boolean', 'embedding')),
    source_column TEXT,
    derivation_formula TEXT,
    encoding_method TEXT CHECK (encoding_method IN ('one_hot', 'label', 'embedding', 'none')),
    normalization TEXT CHECK (normalization IN ('standard', 'minmax', 'none')),
    missing_strategy TEXT DEFAULT 'mean' CHECK (missing_strategy IN ('mean', 'median', 'mode', 'zero', 'drop')),
    statistics TEXT DEFAULT '{}',  -- JSON
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE INDEX idx_prediction_features_tenant ON prediction_features(tenant_id, feature_type);

-- -----------------------------------------------------------------------------
-- Table: prediction_models
-- Purpose: Store trained ML models for process prediction
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS prediction_models (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    event_log_id TEXT,
    data_pool_id TEXT,
    name TEXT NOT NULL,
    description TEXT,
    prediction_type TEXT NOT NULL CHECK (prediction_type IN ('next_activity', 'remaining_time', 'outcome', 'next_timestamp')),
    algorithm TEXT NOT NULL,
    hyperparameters TEXT DEFAULT '{}',  -- JSON
    feature_ids TEXT NOT NULL,  -- JSON array
    model_binary BLOB,
    model_file_path TEXT,
    training_date TEXT NOT NULL,
    training_samples INTEGER,
    status TEXT DEFAULT 'trained' CHECK (status IN ('training', 'trained', 'deployed', 'retired')),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (event_log_id) REFERENCES event_logs(id) ON DELETE CASCADE,
    FOREIGN KEY (data_pool_id) REFERENCES data_pools(id) ON DELETE CASCADE
);

CREATE INDEX idx_prediction_models_tenant ON prediction_models(tenant_id, prediction_type, status);
CREATE INDEX idx_prediction_models_log ON prediction_models(event_log_id);

-- -----------------------------------------------------------------------------
-- Table: predictions
-- Purpose: Store prediction outputs
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS predictions (
    id TEXT PRIMARY KEY,
    prediction_model_id TEXT NOT NULL,
    tenant_id TEXT NOT NULL,
    case_id TEXT,
    predicted_at TEXT NOT NULL DEFAULT (datetime('now')),
    input_features TEXT NOT NULL,  -- JSON
    prediction_value TEXT NOT NULL,
    confidence REAL,
    probabilities TEXT,  -- JSON
    actual_value TEXT,
    is_correct INTEGER,
    FOREIGN KEY (prediction_model_id) REFERENCES prediction_models(id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE SET NULL
);

CREATE INDEX idx_predictions_model ON predictions(prediction_model_id, predicted_at DESC);
CREATE INDEX idx_predictions_case ON predictions(case_id);
CREATE INDEX idx_predictions_accuracy ON predictions(prediction_model_id, is_correct);

-- -----------------------------------------------------------------------------
-- Table: model_evaluations
-- Purpose: Track model performance over time
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS model_evaluations (
    id TEXT PRIMARY KEY,
    prediction_model_id TEXT NOT NULL,
    tenant_id TEXT NOT NULL,
    evaluated_at TEXT NOT NULL DEFAULT (datetime('now')),
    evaluation_type TEXT NOT NULL CHECK (evaluation_type IN ('training', 'validation', 'test', 'production')),
    sample_size INTEGER NOT NULL,
    metrics TEXT NOT NULL,  -- JSON
    FOREIGN KEY (prediction_model_id) REFERENCES prediction_models(id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE INDEX idx_model_evaluations_model ON model_evaluations(prediction_model_id, evaluated_at DESC);
