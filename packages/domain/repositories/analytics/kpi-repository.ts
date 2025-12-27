import type { AsyncResult, TenantId, UUID } from "@odin/core-contracts";
import type { Kpi, KpiId, CreateKpiData, UpdateKpiData } from "../../entities/analytics/kpi";

export interface IKpiRepository {
  findById(id: KpiId, tenantId: TenantId): AsyncResult<Kpi | null>;
  findByKnowledgeModelId(knowledgeModelId: UUID, tenantId: TenantId): AsyncResult<readonly Kpi[]>;
  findGlobal(tenantId: TenantId): AsyncResult<readonly Kpi[]>;

  create(data: CreateKpiData, tenantId: TenantId): AsyncResult<Kpi>;
  update(id: KpiId, data: UpdateKpiData, tenantId: TenantId): AsyncResult<Kpi>;
  delete(id: KpiId, tenantId: TenantId): AsyncResult<void>;
}
