import type {
  AsyncResult,
  UUID,
  ISODateTime,
  Duration,
  Percentage,
} from "@odin/core-contracts";
import type { IService, OperationContext } from "./base";
import type { PaginatedResult, Pagination, DateRange } from "./common";
import type { PackageId } from "./knowledge-model-service";
import type { JobSchedule } from "./action-flow-service";

/**
 * Skill service for sensors, signals, and automated actions.
 */
export interface ISkillService extends IService {
  // Queries
  getSkill(id: UUID, ctx: OperationContext): AsyncResult<Skill>;
  listSkills(input: ListSkillsInput, ctx: OperationContext): AsyncResult<PaginatedResult<Skill>>;

  // Commands
  createSkill(input: CreateSkillInput, ctx: OperationContext): AsyncResult<Skill>;
  updateSkill(input: UpdateSkillInput, ctx: OperationContext): AsyncResult<Skill>;
  deleteSkill(id: UUID, ctx: OperationContext): AsyncResult<void>;

  // Sensor
  configureSensor(input: ConfigureSensorInput, ctx: OperationContext): AsyncResult<Sensor>;
  evaluateSensor(sensorId: UUID, ctx: OperationContext): AsyncResult<SensorEvaluationResult>;

  // Actions
  addSkillAction(input: AddSkillActionInput, ctx: OperationContext): AsyncResult<SkillAction>;
  updateSkillAction(input: UpdateSkillActionInput, ctx: OperationContext): AsyncResult<SkillAction>;
  deleteSkillAction(id: UUID, ctx: OperationContext): AsyncResult<void>;

  // Lifecycle
  activateSkill(id: UUID, ctx: OperationContext): AsyncResult<Skill>;
  deactivateSkill(id: UUID, ctx: OperationContext): AsyncResult<Skill>;

  // Signals
  getSignals(input: GetSignalsInput, ctx: OperationContext): AsyncResult<PaginatedResult<Signal>>;
  getSignal(id: UUID, ctx: OperationContext): AsyncResult<Signal>;
  acknowledgeSignal(id: UUID, ctx: OperationContext): AsyncResult<Signal>;
  resolveSignal(input: ResolveSignalInput, ctx: OperationContext): AsyncResult<Signal>;
  snoozeSignal(input: SnoozeSignalInput, ctx: OperationContext): AsyncResult<Signal>;
}

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

export type SkillStatus = 'draft' | 'active' | 'inactive';
export type SensorType = 'threshold' | 'trend' | 'anomaly' | 'pattern' | 'custom';
export type SignalStatus = 'new' | 'acknowledged' | 'resolved' | 'snoozed' | 'expired';
export type SignalSeverity = 'low' | 'medium' | 'high' | 'critical';
export type SkillActionType = 'notification' | 'task' | 'action_flow' | 'webhook' | 'custom';

// ═══════════════════════════════════════════════════════════════
// Core Types
// ═══════════════════════════════════════════════════════════════

export interface Skill {
  readonly id: UUID;
  readonly packageId: PackageId;
  readonly name: string;
  readonly description?: string;
  readonly status: SkillStatus;
  readonly sensor?: Sensor;
  readonly actions: readonly SkillAction[];
  readonly settings?: SkillSettings;
  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
}

export interface SkillSettings {
  readonly signalLifetimeDuration?: Duration;
  readonly maxActiveSignals?: number;
  readonly autoResolveOnConditionClear?: boolean;
  readonly notifyOnAllSignals?: boolean;
}

export interface Sensor {
  readonly id: UUID;
  readonly skillId: UUID;
  readonly knowledgeModelId: UUID;
  readonly name: string;
  readonly type: SensorType;
  readonly config: SensorConfig;
  readonly evaluationSchedule: JobSchedule;
  readonly lastEvaluatedAt?: ISODateTime;
  readonly lastSignalAt?: ISODateTime;
}

export interface SensorConfig {
  readonly kpiId?: UUID;
  readonly condition?: SensorCondition;
  readonly threshold?: ThresholdConfig;
  readonly trendConfig?: TrendConfig;
  readonly anomalyConfig?: AnomalyConfig;
  readonly customExpression?: string;
}

export interface SensorCondition {
  readonly type: 'greater_than' | 'less_than' | 'equals' | 'between' | 'custom';
  readonly value?: unknown;
  readonly minValue?: unknown;
  readonly maxValue?: unknown;
}

export interface ThresholdConfig {
  readonly warnThreshold?: number;
  readonly criticalThreshold?: number;
  readonly direction?: 'above' | 'below';
}

export interface TrendConfig {
  readonly lookbackPeriod: Duration;
  readonly trendDirection: 'increasing' | 'decreasing' | 'any';
  readonly minChangePercent: Percentage;
}

export interface AnomalyConfig {
  readonly method: 'zscore' | 'iqr' | 'isolation_forest';
  readonly sensitivity: number;
  readonly lookbackPeriod: Duration;
}

export interface SkillAction {
  readonly id: UUID;
  readonly skillId: UUID;
  readonly type: SkillActionType;
  readonly config: SkillActionConfig;
  readonly order: number;
}

export interface SkillActionConfig {
  readonly notificationConfig?: NotificationActionConfig;
  readonly taskConfig?: TaskActionConfig;
  readonly actionFlowConfig?: ActionFlowActionConfig;
  readonly webhookConfig?: WebhookActionConfig;
  readonly custom?: Record<string, unknown>;
}

export interface NotificationActionConfig {
  readonly channels: readonly string[];
  readonly template?: string;
  readonly recipients?: readonly UUID[];
}

export interface TaskActionConfig {
  readonly taskTypeId: UUID;
  readonly title: string;
  readonly assigneeId?: UUID;
  readonly priority?: string;
}

export interface ActionFlowActionConfig {
  readonly actionFlowId: UUID;
  readonly inputMappings?: Record<string, string>;
}

export interface WebhookActionConfig {
  readonly url: string;
  readonly method: string;
  readonly headers?: Record<string, string>;
  readonly bodyTemplate?: string;
}

export interface Signal {
  readonly id: UUID;
  readonly skillId: UUID;
  readonly sensorId: UUID;
  readonly status: SignalStatus;
  readonly severity: SignalSeverity;
  readonly title: string;
  readonly message?: string;
  readonly context: SignalContext;
  readonly affectedRecords?: readonly AffectedRecord[];
  readonly createdAt: ISODateTime;
  readonly acknowledgedAt?: ISODateTime;
  readonly resolvedAt?: ISODateTime;
  readonly snoozedUntil?: ISODateTime;
  readonly resolutionNote?: string;
}

export interface SignalContext {
  readonly kpiValue?: unknown;
  readonly threshold?: unknown;
  readonly trend?: unknown;
  readonly additionalData?: Record<string, unknown>;
}

export interface AffectedRecord {
  readonly recordId: string;
  readonly recordType: string;
  readonly identifierValue: string;
}

// ═══════════════════════════════════════════════════════════════
// DTOs
// ═══════════════════════════════════════════════════════════════

export interface CreateSkillInput {
  readonly packageId: PackageId;
  readonly name: string;
  readonly description?: string;
  readonly settings?: SkillSettings;
}

export interface UpdateSkillInput {
  readonly id: UUID;
  readonly name?: string;
  readonly description?: string;
  readonly settings?: SkillSettings;
}

export interface ListSkillsInput {
  readonly packageId?: PackageId;
  readonly status?: SkillStatus;
  readonly search?: string;
  readonly pagination?: Pagination;
}

export interface ConfigureSensorInput {
  readonly skillId: UUID;
  readonly knowledgeModelId: UUID;
  readonly name: string;
  readonly type: SensorType;
  readonly config: SensorConfig;
  readonly evaluationSchedule: JobSchedule;
}

export interface SensorEvaluationResult {
  readonly sensorId: UUID;
  readonly evaluatedAt: ISODateTime;
  readonly signalsGenerated: number;
  readonly signals: readonly Signal[];
  readonly duration: Duration;
}

export interface AddSkillActionInput {
  readonly skillId: UUID;
  readonly type: SkillActionType;
  readonly config: SkillActionConfig;
  readonly order?: number;
}

export interface UpdateSkillActionInput {
  readonly id: UUID;
  readonly config?: SkillActionConfig;
  readonly order?: number;
}

export interface GetSignalsInput {
  readonly skillId?: UUID;
  readonly sensorId?: UUID;
  readonly status?: SignalStatus;
  readonly severity?: SignalSeverity;
  readonly dateRange?: DateRange;
  readonly pagination?: Pagination;
}

export interface ResolveSignalInput {
  readonly signalId: UUID;
  readonly resolutionNote?: string;
}

export interface SnoozeSignalInput {
  readonly signalId: UUID;
  readonly snoozeDuration: Duration;
  readonly reason?: string;
}
