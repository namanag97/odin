import type { AsyncResult, TenantId, UUID } from "@odin/core-contracts";
import type { Record, RecordId, CreateRecordData, UpdateRecordData } from "../../entities/analytics/record";

export interface IRecordRepository {
  findById(id: RecordId, tenantId: TenantId): AsyncResult<Record | null>;
  findByKnowledgeModelId(knowledgeModelId: UUID, tenantId: TenantId): AsyncResult<readonly Record[]>;

  create(data: CreateRecordData, tenantId: TenantId): AsyncResult<Record>;
  update(id: RecordId, data: UpdateRecordData, tenantId: TenantId): AsyncResult<Record>;
  delete(id: RecordId, tenantId: TenantId): AsyncResult<void>;
}
