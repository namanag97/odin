-- ============================================================================
-- PHASE 12: PM4PY COMPATIBILITY LAYER
-- Purpose: Views with XES-compliant column names for direct PM4Py import
-- ============================================================================

-- -----------------------------------------------------------------------------
-- View: pm4py_event_log
-- Purpose: XES-compliant event log view for pm4py.read_csv() / pm4py.format_dataframe()
-- Usage: SELECT * FROM pm4py_event_log WHERE event_log_id = ?
-- -----------------------------------------------------------------------------
CREATE VIEW IF NOT EXISTS pm4py_event_log AS
SELECT 
    e.id AS _internal_id,
    e.event_log_id AS _event_log_id,
    e.tenant_id AS _tenant_id,
    
    -- PM4Py REQUIRED columns (XES standard naming)
    c.case_id AS "case:concept:name",
    e.activity_name AS "concept:name",
    e.timestamp AS "time:timestamp",
    
    -- PM4Py STANDARD columns
    e.resource_name AS "org:resource",
    e.lifecycle AS "lifecycle:transition",
    
    -- PM4Py computed columns
    v.sequence AS "case:variant",
    c.duration_seconds AS "case:duration",
    e.cost AS "cost:total",
    
    -- Additional attributes as JSON
    e.attributes AS _attributes
FROM events e
JOIN cases c ON e.case_id = c.id
LEFT JOIN variants v ON c.variant_id = v.id;

-- -----------------------------------------------------------------------------
-- View: pm4py_case_attributes
-- Purpose: Case-level attributes in PM4Py format
-- -----------------------------------------------------------------------------
CREATE VIEW IF NOT EXISTS pm4py_case_attributes AS
SELECT 
    c.id AS _internal_id,
    c.event_log_id AS _event_log_id,
    c.tenant_id AS _tenant_id,
    
    c.case_id AS "case:concept:name",
    c.start_time AS "case:start_time",
    c.end_time AS "case:end_time",
    c.duration_seconds AS "case:duration",
    c.event_count AS "case:event_count",
    c.status AS "case:status",
    v.sequence AS "case:variant",
    c.attributes AS _case_attributes
FROM cases c
LEFT JOIN variants v ON c.variant_id = v.id;

-- -----------------------------------------------------------------------------
-- View: ocel_export_events
-- Purpose: OCEL 2.0 JSON-compliant event view
-- -----------------------------------------------------------------------------
CREATE VIEW IF NOT EXISTS ocel_export_events AS
SELECT 
    oe.ocel_id AS "ocel:id",
    oe.event_type_name AS "ocel:activity",
    oe.timestamp AS "ocel:timestamp",
    oe.attributes AS "ocel:vmap",
    (
        SELECT json_group_array(o.ocel_id)
        FROM ocel_e2o e2o
        JOIN ocel_objects o ON e2o.object_id = o.id
        WHERE e2o.event_id = oe.id
    ) AS "ocel:omap"
FROM ocel_events oe;

-- -----------------------------------------------------------------------------
-- View: ocel_export_objects
-- Purpose: OCEL 2.0 JSON-compliant object view
-- -----------------------------------------------------------------------------
CREATE VIEW IF NOT EXISTS ocel_export_objects AS
SELECT 
    oo.ocel_id AS "ocel:id",
    oo.object_type_name AS "ocel:type",
    oo.attributes AS "ocel:ovmap"
FROM ocel_objects oo;

-- -----------------------------------------------------------------------------
-- View: ocel_export_o2o
-- Purpose: OCEL 2.0 object-to-object relationships
-- -----------------------------------------------------------------------------
CREATE VIEW IF NOT EXISTS ocel_export_o2o AS
SELECT 
    src.ocel_id AS "ocel:source",
    tgt.ocel_id AS "ocel:target",
    o2o.relationship_type AS "ocel:qualifier"
FROM ocel_o2o o2o
JOIN ocel_objects src ON o2o.source_object_id = src.id
JOIN ocel_objects tgt ON o2o.target_object_id = tgt.id;

-- -----------------------------------------------------------------------------
-- Index hints for view performance
-- -----------------------------------------------------------------------------
-- Ensure these indexes exist (already in base schema, but verify)
CREATE INDEX IF NOT EXISTS idx_events_case_id ON events(case_id);
CREATE INDEX IF NOT EXISTS idx_cases_variant_id ON cases(variant_id);
CREATE INDEX IF NOT EXISTS idx_ocel_e2o_event_id ON ocel_e2o(event_id);
