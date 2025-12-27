import type { UUID, TenantId, UserId, ISODateTime } from "@odin/core-contracts";

export type SkillId = UUID;
export type SkillType = 'builtin' | 'custom';

export interface Skill {
  readonly id: SkillId;
  readonly tenantId: TenantId;
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly type: SkillType;
  readonly schema: Record<string, unknown>;
  readonly implementation: string;
  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
  readonly createdBy: UserId;
}

export interface CreateSkillData {
  readonly tenantId: TenantId;
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly type: SkillType;
  readonly schema: Record<string, unknown>;
  readonly implementation: string;
  readonly createdBy: UserId;
}

export interface UpdateSkillData {
  readonly name?: string;
  readonly description?: string;
  readonly schema?: Record<string, unknown>;
  readonly implementation?: string;
}
