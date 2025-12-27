/**
 * Process Tree Types - Process Mining Domain
 *
 * PM4Py-aligned Process Tree representation.
 */

// ============================================================================
// Process Tree Node Type
// ============================================================================

/**
 * Process tree node type
 */
export type ProcessTreeNodeType =
  | 'sequence'    // → operator
  | 'xor'         // × operator
  | 'parallel'    // + operator
  | 'loop'        // ↺ operator
  | 'or'          // ∨ operator
  | 'activity'    // Leaf node
  | 'tau';        // Silent transition

// ============================================================================
// Process Tree Node
// ============================================================================

/**
 * Process tree node
 */
export interface ProcessTreeNode {
  readonly id: string;
  readonly type: ProcessTreeNodeType;
  readonly label?: string;
  readonly children?: readonly ProcessTreeNode[];
}

// ============================================================================
// Process Tree
// ============================================================================

/**
 * Process Tree - Hierarchical process model representation
 */
export interface ProcessTree {
  readonly root: ProcessTreeNode;
}
