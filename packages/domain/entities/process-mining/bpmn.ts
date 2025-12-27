/**
 * BPMN Model Types - Process Mining Domain
 *
 * PM4Py-aligned BPMN representation.
 */

// ============================================================================
// BPMN Element Type
// ============================================================================

/**
 * BPMN element type
 */
export type BPMNElementType =
  | 'startEvent'
  | 'endEvent'
  | 'intermediateEvent'
  | 'task'
  | 'userTask'
  | 'serviceTask'
  | 'scriptTask'
  | 'exclusiveGateway'
  | 'parallelGateway'
  | 'inclusiveGateway'
  | 'subProcess'
  | 'callActivity';

// ============================================================================
// Position
// ============================================================================

/**
 * Element position (for visual layout)
 */
export interface Position {
  readonly x: number;
  readonly y: number;
  readonly width?: number;
  readonly height?: number;
}

// ============================================================================
// BPMN Element
// ============================================================================

/**
 * BPMN element (node)
 */
export interface BPMNElement {
  readonly id: string;
  readonly type: BPMNElementType;
  readonly name?: string;
  readonly position?: Position;
  readonly properties?: Record<string, unknown>;
}

// ============================================================================
// BPMN Flow
// ============================================================================

/**
 * BPMN sequence flow (edge)
 */
export interface BPMNFlow {
  readonly id: string;
  readonly sourceRef: string;
  readonly targetRef: string;
  readonly condition?: string;
}

// ============================================================================
// BPMN Model
// ============================================================================

/**
 * BPMNModel - Business Process Model and Notation
 */
export interface BPMNModel {
  readonly id: string;
  readonly name: string;
  readonly elements: readonly BPMNElement[];
  readonly flows: readonly BPMNFlow[];
}
