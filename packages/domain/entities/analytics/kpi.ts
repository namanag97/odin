import type { UUID, ISODateTime } from "@odin/core-contracts";

export type KpiId = UUID;

export interface Kpi {
  readonly id: KpiId;
  readonly knowledgeModelId: UUID;
  readonly name: string;
  readonly displayName?: string;
  readonly description?: string;
  readonly category?: string;
  readonly expression: string;
  readonly format: string;
  readonly isGlobal: boolean;
  readonly sortOrder: number;
  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
}

export interface CreateKpiData {
  readonly knowledgeModelId: UUID;
  readonly name: string;
  readonly displayName?: string;
  readonly description?: string;
  readonly category?: string;
  readonly expression: string;
  readonly format: string;
  readonly isGlobal?: boolean;
  readonly sortOrder?: number;
}

export interface UpdateKpiData {
  readonly name?: string;
  readonly displayName?: string;
  readonly description?: string;
  readonly expression?: string;
  readonly format?: string;
}
