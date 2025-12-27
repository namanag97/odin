import type { UUID } from "@odin/core-contracts";
import type { FilterConfig } from "./filter";

export type EventLogConfigId = UUID;
export type EventLogType = 'case_centric' | 'object_centric';

export interface CaseDefinition {
  readonly objectType: string;
  readonly caseIdAttribute: string;
}

export interface ActivityMapping {
  readonly sourceAttribute: string;
  readonly mapping?: Record<string, string>;   // Original -> Display name
}

export interface TimestampConfig {
  readonly primaryTimestamp: string;
  readonly sortingAttribute?: string;
  readonly timezone?: string;
}

export interface EventLogConfigDetails {
  // Case-centric
  readonly caseDefinition?: CaseDefinition;

  // Object-centric (OCEL)
  readonly objectTypes?: readonly string[];
  readonly eventFilter?: FilterConfig;

  // Common
  readonly activityMapping?: ActivityMapping;
  readonly timestampConfig?: TimestampConfig;
  readonly attributeInclusion?: readonly string[];
}

export interface EventLogConfig {
  readonly id: EventLogConfigId;
  readonly knowledgeModelId: UUID;
  readonly name: string;
  readonly description?: string;
  readonly type: EventLogType;
  readonly config: EventLogConfigDetails;
  readonly isDefault: boolean;
}

export interface CreateEventLogConfigData {
  readonly knowledgeModelId: UUID;
  readonly name: string;
  readonly description?: string;
  readonly type: EventLogType;
  readonly config: EventLogConfigDetails;
  readonly isDefault?: boolean;
}

export interface UpdateEventLogConfigData {
  readonly name?: string;
  readonly description?: string;
  readonly config?: EventLogConfigDetails;
  readonly isDefault?: boolean;
}
