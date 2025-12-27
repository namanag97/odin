import type { UUID, ISODateTime } from "@odin/core-contracts";

export type ComponentId = UUID;
export type ComponentType = 'chart' | 'table' | 'kpi' | 'filter' | 'text';

export interface Component {
  readonly id: ComponentId;
  readonly viewId: UUID;
  readonly type: ComponentType;
  readonly config: Record<string, unknown>;
  readonly position: ComponentPosition;
  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
}

export interface ComponentPosition {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface CreateComponentData {
  readonly viewId: UUID;
  readonly type: ComponentType;
  readonly config: Record<string, unknown>;
  readonly position: ComponentPosition;
}

export interface UpdateComponentData {
  readonly config?: Record<string, unknown>;
  readonly position?: ComponentPosition;
}
