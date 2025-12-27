import type { UUID, TenantId, UserId, ISODateTime, PackageId, Duration } from "@odin/core-contracts";
import type { Variable } from "../analytics/variable";
import type { Component } from "./component";
import type { Tab } from "./tab";

export type ViewId = UUID;
export type ViewType = 'analysis' | 'profile' | 'dashboard' | 'report';
export type LayoutType = 'grid' | 'freeform' | 'flow';
export type PublishStatus = 'draft' | 'published' | 'deprecated';

export interface ViewLayout {
  readonly type: LayoutType;
  readonly gridColumns: number;
  readonly height?: number;
  readonly responsive: boolean;
}

export interface ViewSettings {
  readonly refreshInterval?: Duration;
  readonly defaultFilters?: readonly UUID[];
  readonly allowExport: boolean;
  readonly showFilters: boolean;
  readonly embedEnabled: boolean;
}

export interface View {
  readonly id: ViewId;
  readonly packageId: PackageId;
  readonly knowledgeModelId: UUID;
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly type: ViewType;
  readonly layout: ViewLayout;
  readonly settings: ViewSettings;
  readonly status: PublishStatus;
  readonly baseViewId?: UUID;
  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
  readonly createdBy: UserId;
}

export interface FullView extends View {
  readonly tabs: readonly Tab[];
  readonly components: readonly Component[];
  readonly variables: readonly Variable[];
}

export interface CreateViewData {
  readonly packageId: PackageId;
  readonly knowledgeModelId: UUID;
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly type: ViewType;
  readonly layout: ViewLayout;
  readonly settings?: ViewSettings;
  readonly createdBy: UserId;
}

export interface UpdateViewData {
  readonly name?: string;
  readonly description?: string;
  readonly layout?: Partial<ViewLayout>;
  readonly settings?: Partial<ViewSettings>;
  readonly status?: PublishStatus;
}
