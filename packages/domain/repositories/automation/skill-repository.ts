import type { AsyncResult, TenantId, PageRequest, PageResponse } from "@odin/core-contracts";
import type { Skill, SkillId, CreateSkillData, UpdateSkillData, SkillType } from "../../entities/automation/skill";

export interface ISkillRepository {
  findById(id: SkillId, tenantId: TenantId): AsyncResult<Skill | null>;
  findByKey(key: string, tenantId: TenantId): AsyncResult<Skill | null>;
  findByType(type: SkillType, tenantId: TenantId): AsyncResult<readonly Skill[]>;
  findByTenantId(tenantId: TenantId, page: PageRequest): AsyncResult<PageResponse<Skill>>;

  create(data: CreateSkillData): AsyncResult<Skill>;
  update(id: SkillId, data: UpdateSkillData, tenantId: TenantId): AsyncResult<Skill>;
  delete(id: SkillId, tenantId: TenantId): AsyncResult<void>;
}
