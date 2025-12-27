/**
 * NotificationTemplate Repository Interface - Temporal Layer
 * 
 * Repository for managing notification templates.
 */

import type {
  UUID,
  TenantId,
  AsyncResult,
} from '@odin/core-contracts';
import type {
  NotificationTemplate,
  CreateTemplateData,
  UpdateTemplateData,
} from '../../entities/temporal/notification-template';

// ============================================================================
// Repository Interface
// ============================================================================

/**
 * Repository interface for NotificationTemplate entity
 */
export interface INotificationTemplateRepository {
  // Queries
  findByKey(
    key: string,
    locale?: string
  ): AsyncResult<NotificationTemplate | null>;
  findByTenantId(
    tenantId: TenantId
  ): AsyncResult<readonly NotificationTemplate[]>;

  // Commands
  create(data: CreateTemplateData): AsyncResult<NotificationTemplate>;
  update(id: UUID, data: UpdateTemplateData): AsyncResult<NotificationTemplate>;
  delete(id: UUID): AsyncResult<void>;

  // Template Rendering
  render(
    templateId: UUID,
    variables: Record<string, unknown>
  ): AsyncResult<string>;
}
