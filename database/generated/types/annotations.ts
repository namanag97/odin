export type AnnotationsAnnotationType = "manual" | "automatic" | "inferred";

/**
 * Represents a row in the annotations table
 * Source: 04_ontology.sql
 */
export interface Annotations {
  /** Primary key */
  id: string;
  tenant_id: string;
  concept_id: string;
  entity_type: string;
  entity_id: string;
  confidence: number | null;
  annotation_type: AnnotationsAnnotationType | null;
  reasoning_chain: string | null;
  created_at: string;
}

/** Insert type for annotations (excludes auto-generated fields) */
export interface AnnotationsInsert {
  tenant_id: string;
  concept_id: string;
  entity_type: string;
  entity_id: string;
  confidence?: number | null;
  annotation_type?: AnnotationsAnnotationType | null;
  reasoning_chain?: string | null;
}