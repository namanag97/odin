export type ConceptsConceptType = "class" | "property" | "individual";

/**
 * Represents a row in the concepts table
 * Source: 04_ontology.sql
 */
export interface Concepts {
  /** Primary key */
  id: string;
  tenant_id: string;
  ontology_id: string | null;
  iri: string;
  local_name: string;
  label: string | null;
  definition: string | null;
  concept_type: ConceptsConceptType;
  parent_concept_id: string | null;
  domain_concept_id: string | null;
  range_concept_id: string | null;
  /** JSON field */
  metadata: Record<string, unknown> | null;
  created_at: string;
}

/** Insert type for concepts (excludes auto-generated fields) */
export interface ConceptsInsert {
  tenant_id: string;
  ontology_id?: string | null;
  iri: string;
  local_name: string;
  label?: string | null;
  definition?: string | null;
  concept_type: ConceptsConceptType;
  parent_concept_id?: string | null;
  domain_concept_id?: string | null;
  range_concept_id?: string | null;
  metadata?: Record<string, unknown> | null;
}