import type { UUID, ActionFlowId } from "@odin/core-contracts";

export type ModuleId = UUID;

export type ModuleType =
  // Data Operations
  | 'query_data' | 'filter_data' | 'transform_data' | 'aggregate_data'
  // Process Mining
  | 'discover_process' | 'check_conformance' | 'calculate_kpi'
  // Integration
  | 'http_request' | 'send_email' | 'send_slack' | 'webhook_call'
  // Control Flow
  | 'condition' | 'loop' | 'parallel' | 'delay' | 'error'
  // Task Management
  | 'create_task' | 'update_task' | 'assign_task'
  // Custom
  | 'python_script' | 'javascript';

export interface ModuleConfig {
  readonly [key: string]: unknown;
}

export type MappingSource =
  | { type: 'input'; inputName: string }
  | { type: 'module_output'; moduleId: ModuleId; outputName: string }
  | { type: 'variable'; variableName: string }
  | { type: 'literal'; value: unknown }
  | { type: 'expression'; expression: string };

export interface InputMapping {
  readonly parameterName: string;
  readonly source: MappingSource;
}

export interface OutputMapping {
  readonly outputName: string;
  readonly variableName: string;
}

export interface ModuleErrorHandling {
  readonly onError: 'fail' | 'continue' | 'retry';
  readonly maxRetries?: number;
  readonly fallbackValue?: unknown;
}

export interface ModuleCondition {
  readonly expression: string;
  readonly skipOnFalse: boolean;
}

export interface Module {
  readonly id: ModuleId;
  readonly actionFlowId: ActionFlowId;
  readonly type: ModuleType;
  readonly name: string;
  readonly description?: string;
  readonly position: number;
  readonly config: ModuleConfig;
  readonly inputMappings: readonly InputMapping[];
  readonly outputMappings: readonly OutputMapping[];
  readonly errorHandling?: ModuleErrorHandling;
  readonly condition?: ModuleCondition;
}

export interface CreateModuleData {
  readonly actionFlowId: ActionFlowId;
  readonly type: ModuleType;
  readonly name: string;
  readonly description?: string;
  readonly position: number;
  readonly config: ModuleConfig;
  readonly inputMappings?: readonly InputMapping[];
  readonly outputMappings?: readonly OutputMapping[];
  readonly errorHandling?: ModuleErrorHandling;
  readonly condition?: ModuleCondition;
}

export interface UpdateModuleData {
  readonly name?: string;
  readonly description?: string;
  readonly position?: number;
  readonly config?: ModuleConfig;
  readonly inputMappings?: readonly InputMapping[];
  readonly outputMappings?: readonly OutputMapping[];
  readonly errorHandling?: ModuleErrorHandling;
  readonly condition?: ModuleCondition;
}
