/**
 * PM4Py Adapter TypeScript Type Definitions
 * Maps domain models to PM4Py Python bridge
 */

import type {
  AsyncResult,
  Brand,
  Duration,
} from "@odin/core-contracts";

// ═══════════════════════════════════════════════════════════════
// HANDLES (Pointers to Python Objects)
// ═══════════════════════════════════════════════════════════════

export type EventLogHandle = Brand<string, "EventLogHandle">;
export type OCELHandle = Brand<string, "OCELHandle">;
export type PetriNetHandle = Brand<string, "PetriNetHandle">;
export type ProcessTreeHandle = Brand<string, "ProcessTreeHandle">;

export const asEventLogHandle = (id: string): EventLogHandle =>
  id as EventLogHandle;
export const asOCELHandle = (id: string): OCELHandle => id as OCELHandle;
export const asPetriNetHandle = (id: string): PetriNetHandle =>
  id as PetriNetHandle;
export const asProcessTreeHandle = (id: string): ProcessTreeHandle =>
  id as ProcessTreeHandle;

// ═══════════════════════════════════════════════════════════════
// STATUS & VERSION
// ═══════════════════════════════════════════════════════════════

export interface PM4PyStatus {
  readonly healthy: boolean;
  readonly uptime: Duration;
  readonly activeHandles: number;
  readonly memoryUsage: number;
  readonly queuedTasks: number;
}

export interface PM4PyVersion {
  readonly pm4py: string;
  readonly python: string;
  readonly dependencies: Record<string, string>;
}

// ═══════════════════════════════════════════════════════════════
// EVENT LOG INPUT
// ═══════════════════════════════════════════════════════════════

export interface LoadEventLogInput {
  readonly data: EventLogData;
  readonly caseIdColumn: string;
  readonly activityColumn: string;
  readonly timestampColumn: string;
  readonly sortingColumn?: string;
  readonly additionalColumns?: readonly string[];
}

export type EventLogData =
  | {
      type: "dataframe";
      rows: readonly Record<string, unknown>[];
      columns: readonly string[];
    }
  | { type: "csv"; content: string; delimiter?: string }
  | { type: "xes"; content: string }
  | { type: "parquet"; content: Buffer };

export interface LoadOCELInput {
  readonly format: "json" | "xml" | "sqlite";
  readonly content: string | Buffer;
}

// Discovery and other types continued...
export interface DiscoverAlphaInput {
  readonly eventLogHandle: EventLogHandle;
}

export interface PetriNetResult {
  readonly handle: PetriNetHandle;
  readonly petriNet: PetriNetDTO;
  readonly initialMarking: MarkingDTO;
  readonly finalMarking: MarkingDTO;
  readonly statistics: DiscoveryStatistics;
}

export interface PetriNetDTO {
  readonly places: readonly PlaceDTO[];
  readonly transitions: readonly TransitionDTO[];
  readonly arcs: readonly ArcDTO[];
}

export interface PlaceDTO {
  readonly id: string;
  readonly name: string;
}

export interface TransitionDTO {
  readonly id: string;
  readonly name: string | null;
  readonly label: string | null;
}

export interface ArcDTO {
  readonly source: string;
  readonly target: string;
  readonly weight: number;
}

export interface MarkingDTO {
  readonly tokens: Record<string, number>;
}

export interface DiscoveryStatistics {
  readonly duration: Duration;
  readonly numberOfPlaces?: number;
  readonly numberOfTransitions?: number;
  readonly numberOfArcs?: number;
  readonly numberOfActivities?: number;
  readonly numberOfTraces?: number;
  readonly numberOfEvents?: number;
}
