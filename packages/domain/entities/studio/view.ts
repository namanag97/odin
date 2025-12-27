import type { UUID, TenantId, UserId, ISODateTime } from "@odin/core-contracts";

export type ViewId = UUID;
export type ViewType = 'dashboard' | 'report' | 'analysis';

export interface View {
  readonly id: ViewId;
  readonly tenantId: TenantId;
  readonly packageId: UUID;
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly type: ViewType;
  readonly layout: Record<string, unknown>;
  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
  readonly createdBy: UserId;
}

export interface CreateViewData {
  readonly tenantId: TenantId;
  readonly packageId: UUID;
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly type: ViewType;
  readonly layout?: Record<string, unknown>;
  readonly createdBy: UserId;
}

export interface UpdateViewData {
  readonly name?: string;
  readonly description?: string;
  readonly layout?: Record<string, unknown>;
}
