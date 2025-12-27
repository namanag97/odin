
/**
 * Represents a row in the concept_relations table
 * Source: 04_ontology.sql
 */
export interface ConceptRelations {
  /** Primary key */
  id: string;
  tenant_id: string;
  source_concept_id: string;
  target_concept_id: string;
  relation_type: string;
  relation_iri: string | null;
  cardinality: string | null;
  /** JSON field */
  metadata: Record<string, unknown> | null;
}

/** Insert type for concept_relations (excludes auto-generated fields) */
export interface ConceptRelationsInsert {
  tenant_id: string;
  source_concept_id: string;
  target_concept_id: string;
  relation_type: string;
  relation_iri?: string | null;
  cardinality?: string | null;
  metadata?: Record<string, unknown> | null;
}