import type { UUID, TenantId, UserId, ISODateTime, SpaceId } from "@odin/core-contracts";
import type { FullKnowledgeModel } from "../analytics/knowledge-model";
import type { ActionFlow } from "../automation/action-flow";

export type PackageId = UUID;
export type PublishStatus = 'draft' | 'published' | 'deprecated';
export type PackageStatus = PublishStatus; // Alias for compatibility

export interface PackageSettings {
  readonly defaultKnowledgeModelId?: UUID;
  readonly defaultViewId?: UUID;
  readonly sharingEnabled: boolean;
  readonly exportEnabled: boolean;
}

export interface PackageStatistics {
  readonly viewCount: number;
  readonly knowledgeModelCount: number;
  readonly actionFlowCount: number;
  readonly skillCount: number;
}

export interface StudioPackage {
  readonly id: PackageId;
  readonly tenantId: TenantId;
  readonly spaceId: SpaceId;
  readonly name: string;
  readonly description?: string;
  readonly icon?: string;
  readonly version: string;
  readonly status: PublishStatus;
  readonly settings: PackageSettings;
  readonly statistics: PackageStatistics;
  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
  readonly publishedAt?: ISODateTime;
  readonly createdBy: UserId;
}

// Alias for compatibility
export type Package = StudioPackage;

export interface PackageExport {
  readonly version: string;
  readonly exportedAt: ISODateTime;
  readonly package: StudioPackage;
  readonly knowledgeModels: readonly FullKnowledgeModel[];
  readonly views: readonly any[];
  readonly actionFlows: readonly ActionFlow[];
  readonly checksum: string;
}

export interface CreatePackageData {
  readonly tenantId: TenantId;
  readonly spaceId: SpaceId;
  readonly name: string;
  readonly description?: string;
  readonly icon?: string;
  readonly createdBy: UserId;
}

export interface UpdatePackageData {
  readonly name?: string;
  readonly description?: string;
  readonly icon?: string;
  readonly status?: PublishStatus;
  readonly settings?: Partial<PackageSettings>;
}
