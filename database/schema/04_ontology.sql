-- ============================================================================
-- PHASE 4: ONTOLOGY & SEMANTICS (5 tables)
-- ============================================================================

-- -----------------------------------------------------------------------------
-- Table: ontologies
-- Purpose: Storage for OWL/RDF ontologies
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ontologies (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    name TEXT NOT NULL,
    version TEXT NOT NULL,
    iri TEXT NOT NULL,
    description TEXT,
    format TEXT DEFAULT 'owl/xml' CHECK (format IN ('owl/xml', 'turtle', 'rdf/xml', 'jsonld')),
    content TEXT NOT NULL,
    imported_iris TEXT DEFAULT '[]',  -- JSON array
    statistics TEXT DEFAULT '{}',  -- JSON
    is_active INTEGER DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    UNIQUE (tenant_id, name, version)
);

CREATE INDEX idx_ontologies_iri ON ontologies(iri);

-- -----------------------------------------------------------------------------
-- Table: concepts
-- Purpose: Domain concepts extracted from ontologies or user-defined
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS concepts (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    ontology_id TEXT,
    iri TEXT NOT NULL,
    local_name TEXT NOT NULL,
    label TEXT,
    definition TEXT,
    concept_type TEXT NOT NULL CHECK (concept_type IN ('class', 'property', 'individual')),
    parent_concept_id TEXT,
    domain_concept_id TEXT,
    range_concept_id TEXT,
    metadata TEXT DEFAULT '{}',  -- JSON (OWL axioms)
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (ontology_id) REFERENCES ontologies(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_concept_id) REFERENCES concepts(id) ON DELETE SET NULL,
    FOREIGN KEY (domain_concept_id) REFERENCES concepts(id) ON DELETE SET NULL,
    FOREIGN KEY (range_concept_id) REFERENCES concepts(id) ON DELETE SET NULL,
    UNIQUE (tenant_id, iri)
);

CREATE INDEX idx_concepts_ontology ON concepts(ontology_id);
CREATE INDEX idx_concepts_parent ON concepts(parent_concept_id);
CREATE INDEX idx_concepts_type ON concepts(tenant_id, concept_type);
CREATE INDEX idx_concepts_label ON concepts(tenant_id, label);

-- -----------------------------------------------------------------------------
-- Table: concept_relations
-- Purpose: Semantic relationships between concepts
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS concept_relations (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    source_concept_id TEXT NOT NULL,
    target_concept_id TEXT NOT NULL,
    relation_type TEXT NOT NULL,
    relation_iri TEXT,
    cardinality TEXT,
    metadata TEXT DEFAULT '{}',  -- JSON
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (source_concept_id) REFERENCES concepts(id) ON DELETE CASCADE,
    FOREIGN KEY (target_concept_id) REFERENCES concepts(id) ON DELETE CASCADE
);

CREATE INDEX idx_concept_relations_source ON concept_relations(source_concept_id, relation_type);
CREATE INDEX idx_concept_relations_target ON concept_relations(target_concept_id, relation_type);

-- -----------------------------------------------------------------------------
-- Table: annotations
-- Purpose: Link data entities to ontological concepts
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS annotations (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    concept_id TEXT NOT NULL,
    entity_type TEXT NOT NULL,  -- Table name being annotated
    entity_id TEXT NOT NULL,
    confidence REAL DEFAULT 1.0,
    annotation_type TEXT DEFAULT 'manual' CHECK (annotation_type IN ('manual', 'automatic', 'inferred')),
    reasoning_chain TEXT,  -- JSON
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (concept_id) REFERENCES concepts(id) ON DELETE CASCADE
);

CREATE INDEX idx_annotations_entity ON annotations(entity_type, entity_id);
CREATE INDEX idx_annotations_concept ON annotations(concept_id);
CREATE INDEX idx_annotations_type ON annotations(tenant_id, annotation_type);

-- -----------------------------------------------------------------------------
-- Table: reasoning_rules
-- Purpose: SWRL-style rules for inference
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reasoning_rules (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    rule_body TEXT NOT NULL,
    rule_head TEXT NOT NULL,
    rule_format TEXT DEFAULT 'swrl' CHECK (rule_format IN ('swrl', 'sparql_construct', 'custom')),
    priority INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    last_executed_at TEXT,
    inferences_count INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE INDEX idx_reasoning_rules_tenant ON reasoning_rules(tenant_id, is_active, priority);
