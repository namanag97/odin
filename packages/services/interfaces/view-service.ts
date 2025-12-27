import type {
  AsyncResult,
  UUID,
  UserId,
  ISODateTime,
  Duration,
  Percentage,
} from "@odin/core-contracts";
import type { IService, OperationContext } from "./base";
import type { PaginatedResult, Pagination, DateRange, DataType } from "./common";
import type { PackageId, PublishStatus } from "./knowledge-model-service";

/**
 * View service for dashboards and analytics visualizations.
 */
export interface IViewService extends IService {
  // Queries
  getView(id: ViewId, ctx: OperationContext): AsyncResult<View>;
  getViewByKey(key: string, ctx: OperationContext): AsyncResult<View>;
  getFullView(id: ViewId, ctx: OperationContext): AsyncResult<FullView>;
  listViews(input: ListViewsInput, ctx: OperationContext): AsyncResult<PaginatedResult<View>>;

  // Commands
  createView(input: CreateViewInput, ctx: OperationContext): AsyncResult<View>;
  updateView(input: UpdateViewInput, ctx: OperationContext): AsyncResult<View>;
  deleteView(id: ViewId, ctx: OperationContext): AsyncResult<void>;
  duplicateView(input: DuplicateViewInput, ctx: OperationContext): AsyncResult<View>;

  // Components
  addComponent(input: AddComponentInput, ctx: OperationContext): AsyncResult<ViewComponent>;
  updateComponent(input: UpdateComponentInput, ctx: OperationContext): AsyncResult<ViewComponent>;
  deleteComponent(id: UUID, ctx: OperationContext): AsyncResult<void>;
  moveComponent(input: MoveComponentInput, ctx: OperationContext): AsyncResult<ViewComponent>;

  // Tabs
  addTab(input: AddTabInput, ctx: OperationContext): AsyncResult<Tab>;
  updateTab(input: UpdateTabInput, ctx: OperationContext): AsyncResult<Tab>;
  deleteTab(id: UUID, ctx: OperationContext): AsyncResult<void>;
  reorderTabs(input: ReorderTabsInput, ctx: OperationContext): AsyncResult<readonly Tab[]>;

  // Rendering
  renderView(input: RenderViewInput, ctx: OperationContext): AsyncResult<RenderedView>;
  renderComponent(input: RenderComponentInput, ctx: OperationContext): AsyncResult<RenderedComponent>;

  // Sharing
  generateShareLink(input: GenerateShareLinkInput, ctx: OperationContext): AsyncResult<ShareLink>;
  revokeShareLink(linkId: UUID, ctx: OperationContext): AsyncResult<void>;

  // Export
  exportView(input: ExportViewInput, ctx: OperationContext): AsyncResult<ExportedView>;
}

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

export type ViewId = UUID;
export type ViewType = 'dashboard' | 'report' | 'analysis' | 'custom';
export type ComponentType =
  | 'chart' | 'table' | 'kpi' | 'process'
  | 'filter' | 'text' | 'image' | 'container';
export type ChartType =
  | 'bar' | 'line' | 'pie' | 'donut' | 'area'
  | 'scatter' | 'heatmap' | 'funnel' | 'gauge';
export type ViewExportFormat = 'pdf' | 'png' | 'html' | 'pptx';

// ═══════════════════════════════════════════════════════════════
// Core Types
// ═══════════════════════════════════════════════════════════════

export interface View {
  readonly id: ViewId;
  readonly packageId: PackageId;
  readonly knowledgeModelId: UUID;
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly type: ViewType;
  readonly layout: ViewLayout;
  readonly settings?: ViewSettings;
  readonly status: PublishStatus;
  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
}

export interface ViewLayout {
  readonly type: 'grid' | 'flex' | 'fixed';
  readonly columns?: number;
  readonly rowHeight?: number;
  readonly gap?: number;
}

export interface ViewSettings {
  readonly refreshInterval?: Duration;
  readonly defaultFilters?: readonly UUID[];
  readonly dateRangeDefault?: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
  readonly theme?: 'light' | 'dark' | 'auto';
}

export interface FullView extends View {
  readonly tabs: readonly Tab[];
  readonly components: readonly ViewComponent[];
}

export interface Tab {
  readonly id: UUID;
  readonly viewId: ViewId;
  readonly name: string;
  readonly icon?: string;
  readonly position: number;
  readonly visibility?: VisibilityRule;
}

export interface VisibilityRule {
  readonly type: 'always' | 'conditional' | 'permission';
  readonly condition?: string;
  readonly permission?: string;
}

export interface ViewComponent {
  readonly id: UUID;
  readonly viewId: ViewId;
  readonly tabId?: UUID;
  readonly type: ComponentType;
  readonly name?: string;
  readonly position: ComponentPosition;
  readonly config: ComponentConfig;
  readonly dataBinding?: ComponentDataBinding;
  readonly interactivity?: InteractivityConfig;
}

export interface ComponentPosition {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface ComponentConfig {
  readonly chartType?: ChartType;
  readonly title?: string;
  readonly subtitle?: string;
  readonly colors?: readonly string[];
  readonly legend?: LegendConfig;
  readonly axes?: AxesConfig;
  readonly [key: string]: unknown;
}

export interface LegendConfig {
  readonly show: boolean;
  readonly position: 'top' | 'bottom' | 'left' | 'right';
}

export interface AxesConfig {
  readonly xAxis?: AxisConfig;
  readonly yAxis?: AxisConfig;
}

export interface AxisConfig {
  readonly label?: string;
  readonly min?: number;
  readonly max?: number;
  readonly format?: string;
}

export interface ComponentDataBinding {
  readonly kpiId?: UUID;
  readonly recordId?: UUID;
  readonly query?: string;
  readonly aggregation?: string;
  readonly groupBy?: readonly string[];
}

export interface InteractivityConfig {
  readonly drillDown?: DrillDownConfig;
  readonly filtering?: FilteringConfig;
  readonly highlighting?: boolean;
}

export interface DrillDownConfig {
  readonly enabled: boolean;
  readonly targetViewId?: ViewId;
  readonly parameterMapping?: Record<string, string>;
}

export interface FilteringConfig {
  readonly enabled: boolean;
  readonly targetComponents?: readonly UUID[];
}

// ═══════════════════════════════════════════════════════════════
// DTOs
// ═══════════════════════════════════════════════════════════════

export interface CreateViewInput {
  readonly packageId: PackageId;
  readonly knowledgeModelId: UUID;
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly type: ViewType;
  readonly layout?: ViewLayout;
  readonly settings?: ViewSettings;
}

export interface UpdateViewInput {
  readonly id: ViewId;
  readonly name?: string;
  readonly description?: string;
  readonly layout?: ViewLayout;
  readonly settings?: ViewSettings;
}

export interface ListViewsInput {
  readonly packageId?: PackageId;
  readonly knowledgeModelId?: UUID;
  readonly type?: ViewType;
  readonly status?: PublishStatus;
  readonly search?: string;
  readonly pagination?: Pagination;
}

export interface DuplicateViewInput {
  readonly viewId: ViewId;
  readonly newKey: string;
  readonly newName: string;
  readonly targetPackageId?: PackageId;
}

export interface AddComponentInput {
  readonly viewId: ViewId;
  readonly tabId?: UUID;
  readonly type: ComponentType;
  readonly name?: string;
  readonly position: ComponentPosition;
  readonly config: ComponentConfig;
  readonly dataBinding?: ComponentDataBinding;
  readonly interactivity?: InteractivityConfig;
}

export interface UpdateComponentInput {
  readonly id: UUID;
  readonly name?: string;
  readonly config?: Partial<ComponentConfig>;
  readonly dataBinding?: ComponentDataBinding;
  readonly interactivity?: InteractivityConfig;
}

export interface MoveComponentInput {
  readonly componentId: UUID;
  readonly position: ComponentPosition;
  readonly tabId?: UUID;
}

export interface AddTabInput {
  readonly viewId: ViewId;
  readonly name: string;
  readonly icon?: string;
  readonly position?: number;
}

export interface UpdateTabInput {
  readonly id: UUID;
  readonly name?: string;
  readonly icon?: string;
  readonly visibility?: VisibilityRule;
}

export interface ReorderTabsInput {
  readonly viewId: ViewId;
  readonly tabOrder: readonly UUID[];
}

export interface RenderViewInput {
  readonly viewId: ViewId;
  readonly filters?: readonly UUID[];
  readonly variables?: Record<string, unknown>;
  readonly dateRange?: DateRange;
}

export interface RenderedView {
  readonly view: View;
  readonly tabs: readonly RenderedTab[];
  readonly appliedFilters: readonly UUID[];
  readonly variables: Record<string, unknown>;
  readonly renderedAt: ISODateTime;
}

export interface RenderedTab {
  readonly tab: Tab;
  readonly components: readonly RenderedComponent[];
}

export interface RenderedComponent {
  readonly component: ViewComponent;
  readonly data: ComponentData;
  readonly error?: string;
  readonly renderDuration: Duration;
}

export type ComponentData =
  | { type: 'chart'; chartData: ChartData }
  | { type: 'table'; tableData: TableData }
  | { type: 'kpi'; kpiData: readonly KPIData[] }
  | { type: 'process'; processData: ProcessData }
  | { type: 'static'; content: unknown };

export interface ChartData {
  readonly series: readonly ChartSeries[];
  readonly categories?: readonly string[];
  readonly labels?: readonly string[];
}

export interface ChartSeries {
  readonly name: string;
  readonly data: readonly ChartDataPoint[];
  readonly color?: string;
}

export interface ChartDataPoint {
  readonly x: unknown;
  readonly y: number;
  readonly label?: string;
  readonly metadata?: Record<string, unknown>;
}

export interface TableData {
  readonly columns: readonly TableColumn[];
  readonly rows: readonly Record<string, unknown>[];
  readonly total: number;
  readonly aggregations?: Record<string, unknown>;
}

export interface TableColumn {
  readonly key: string;
  readonly label: string;
  readonly type: DataType;
  readonly sortable: boolean;
  readonly width?: number;
}

export interface KPIData {
  readonly kpiId: UUID;
  readonly value: unknown;
  readonly formattedValue: string;
  readonly status?: string;
}

export interface ProcessData {
  readonly type: string;
  readonly model: unknown;
  readonly metrics?: Record<string, unknown>;
}

export interface RenderComponentInput {
  readonly componentId: UUID;
  readonly filters?: readonly UUID[];
  readonly variables?: Record<string, unknown>;
}

export interface GenerateShareLinkInput {
  readonly viewId: ViewId;
  readonly expiresIn?: Duration;
  readonly password?: string;
  readonly allowedEmails?: readonly string[];
  readonly permissions: SharePermissions;
}

export interface SharePermissions {
  readonly canExport: boolean;
  readonly canFilter: boolean;
  readonly visibleTabs?: readonly UUID[];
}

export interface ShareLink {
  readonly id: UUID;
  readonly viewId: ViewId;
  readonly token: string;
  readonly url: string;
  readonly permissions: SharePermissions;
  readonly expiresAt?: ISODateTime;
  readonly createdAt: ISODateTime;
  readonly createdBy: UserId;
}

export interface ExportViewInput {
  readonly viewId: ViewId;
  readonly format: ViewExportFormat;
  readonly options?: ViewExportOptions;
}

export interface ViewExportOptions {
  readonly includeFilters?: boolean;
  readonly dateRange?: DateRange;
  readonly selectedTabs?: readonly UUID[];
  readonly pageSize?: 'a4' | 'letter' | 'custom';
  readonly orientation?: 'portrait' | 'landscape';
}

export interface ExportedView {
  readonly content: ArrayBuffer;
  readonly mimeType: string;
  readonly filename: string;
  readonly exportedAt: ISODateTime;
}
