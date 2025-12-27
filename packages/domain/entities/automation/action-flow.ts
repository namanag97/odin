import type { UUID, TenantId, UserId, ISODateTime } from "@odin/core-contracts";

export type ActionFlowId = UUID;
export type ActionFlowStatus = 'draft' | 'active' | 'paused' | 'archived';

export interface ActionFlow {
  readonly id: ActionFlowId;
  readonly tenantId: TenantId;
  readonly name: string;
  readonly description?: string;
  readonly trigger: Record<string, unknown>;
  readonly actions: readonly Record<string, unknown>[];
  readonly status: ActionFlowStatus;
  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
  readonly createdBy: UserId;
}

export interface CreateActionFlowData {
  readonly tenantId: TenantId;
  readonly name: string;
  readonly description?: string;
  readonly trigger: Record<string, unknown>;
  readonly actions: readonly Record<string, unknown>[];
  readonly createdBy: UserId;
}

export interface UpdateActionFlowData {
  readonly name?: string;
  readonly description?: string;
  readonly trigger?: Record<string, unknown>;
  readonly actions?: readonly Record<string, unknown>[];
  readonly status?: ActionFlowStatus;
}
