import type { UUID, ViewId } from "@odin/core-contracts";

export type TabId = UUID;

export interface VisibilityRule {
  readonly type: 'always' | 'conditional' | 'permission';
  readonly condition?: string;
  readonly permissionRequired?: string;
}

export interface Tab {
  readonly id: TabId;
  readonly viewId: ViewId;
  readonly name: string;
  readonly icon?: string;
  readonly position: number;
  readonly visibility?: VisibilityRule;
}

export interface CreateTabData {
  readonly viewId: ViewId;
  readonly name: string;
  readonly icon?: string;
  readonly position: number;
  readonly visibility?: VisibilityRule;
}

export interface UpdateTabData {
  readonly name?: string;
  readonly icon?: string;
  readonly position?: number;
  readonly visibility?: VisibilityRule;
}
