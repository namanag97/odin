export type OntologiesFormat = "owl/xml" | "turtle" | "rdf/xml" | "jsonld";

/**
 * Represents a row in the ontologies table
 * Source: 04_ontology.sql
 */
export interface Ontologies {
  /** Primary key */
  id: string;
  tenant_id: string;
  name: string;
  version: string;
  iri: string;
  description: string | null;
  format: OntologiesFormat | null;
  content: string;
  /** JSON field */
  imported_iris: unknown[] | null;
  /** JSON field */
  statistics: Record<string, unknown> | null;
  is_active: number | null;
  created_at: string;
  updated_at: string;
}

/** Insert type for ontologies (excludes auto-generated fields) */
export interface OntologiesInsert {
  tenant_id: string;
  name: string;
  version: string;
  iri: string;
  description?: string | null;
  format?: OntologiesFormat | null;
  content: string;
  imported_iris?: unknown[] | null;
  statistics?: Record<string, unknown> | null;
  is_active?: number | null;
}