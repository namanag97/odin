/**
 * Unit Tests for Identifier Types
 */
import { describe, it, expect } from 'vitest';
import {
  isUUID,
  isValidId,
  asTenantId,
  asUserId,
  asSessionId,
  asPoolId,
  asEventLogId,
  asConnectionId,
  asJobId,
  asModelId,
  asCaseId,
  asActivityId,
  asWorkflowId,
  asActionFlowId,
  asDashboardId,
  asViewId,
  asComponentId,
  asOrganizationId,
  asDataPoolId,
  asDataModelId,
  asProcessModelId,
  asObjectTypeId,
  asObjectId,
  asEventId,
  asPackageId,
  asSpaceId,
} from './identifiers';

describe('isUUID', () => {
  it('returns true for valid UUID v4', () => {
    expect(isUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
    expect(isUUID('f47ac10b-58cc-4372-a567-0e02b2c3d479')).toBe(true);
    expect(isUUID('6ba7b810-9dad-11d1-80b4-00c04fd430c8')).toBe(true);
  });

  it('returns true for uppercase UUIDs', () => {
    expect(isUUID('550E8400-E29B-41D4-A716-446655440000')).toBe(true);
  });

  it('returns false for invalid UUIDs', () => {
    expect(isUUID('not-a-uuid')).toBe(false);
    expect(isUUID('')).toBe(false);
    expect(isUUID('12345')).toBe(false);
    expect(isUUID('550e8400-e29b-41d4-a716')).toBe(false); // Too short
    expect(isUUID('550e8400-e29b-41d4-a716-446655440000-extra')).toBe(false); // Too long
  });

  it('returns false for non-string values', () => {
    expect(isUUID(null as unknown as string)).toBe(false);
    expect(isUUID(undefined as unknown as string)).toBe(false);
    expect(isUUID(123 as unknown as string)).toBe(false);
    expect(isUUID({} as unknown as string)).toBe(false);
  });
});

describe('isValidId', () => {
  it('returns true for non-empty strings', () => {
    expect(isValidId('abc')).toBe(true);
    expect(isValidId('123')).toBe(true);
    expect(isValidId('a')).toBe(true);
  });

  it('returns false for empty strings', () => {
    expect(isValidId('')).toBe(false);
  });

  it('returns false for non-string values', () => {
    expect(isValidId(null)).toBe(false);
    expect(isValidId(undefined)).toBe(false);
    expect(isValidId(123)).toBe(false);
    expect(isValidId({})).toBe(false);
    expect(isValidId([])).toBe(false);
  });
});

describe('ID Factory Functions', () => {
  const testId = '550e8400-e29b-41d4-a716-446655440000';

  it('creates TenantId', () => {
    const id = asTenantId(testId);
    expect(id as string).toBe(testId);
  });

  it('creates UserId', () => {
    const id = asUserId(testId);
    expect(id as string).toBe(testId);
  });

  it('creates SessionId', () => {
    const id = asSessionId(testId);
    expect(id as string).toBe(testId);
  });

  it('creates PoolId', () => {
    const id = asPoolId(testId);
    expect(id as string).toBe(testId);
  });

  it('creates EventLogId', () => {
    const id = asEventLogId(testId);
    expect(id as string).toBe(testId);
  });

  it('creates ConnectionId', () => {
    const id = asConnectionId(testId);
    expect(id as string).toBe(testId);
  });

  it('creates JobId', () => {
    const id = asJobId(testId);
    expect(id as string).toBe(testId);
  });

  it('creates ModelId', () => {
    const id = asModelId(testId);
    expect(id as string).toBe(testId);
  });

  it('creates CaseId', () => {
    const id = asCaseId('case-123');
    expect(id as string).toBe('case-123');
  });

  it('creates ActivityId', () => {
    const id = asActivityId('Submit Order');
    expect(id as string).toBe('Submit Order');
  });

  it('creates WorkflowId', () => {
    const id = asWorkflowId(testId);
    expect(id as string).toBe(testId);
  });

  it('creates ActionFlowId', () => {
    const id = asActionFlowId(testId);
    expect(id as string).toBe(testId);
  });

  it('creates DashboardId', () => {
    const id = asDashboardId(testId);
    expect(id as string).toBe(testId);
  });

  it('creates ViewId', () => {
    const id = asViewId(testId);
    expect(id as string).toBe(testId);
  });

  it('creates ComponentId', () => {
    const id = asComponentId(testId);
    expect(id as string).toBe(testId);
  });

  it('creates OrganizationId', () => {
    const id = asOrganizationId(testId);
    expect(id as string).toBe(testId);
  });

  it('creates DataPoolId', () => {
    const id = asDataPoolId(testId);
    expect(id as string).toBe(testId);
  });

  it('creates DataModelId', () => {
    const id = asDataModelId(testId);
    expect(id as string).toBe(testId);
  });

  it('creates ProcessModelId', () => {
    const id = asProcessModelId(testId);
    expect(id as string).toBe(testId);
  });

  it('creates ObjectTypeId', () => {
    const id = asObjectTypeId('order');
    expect(id as string).toBe('order');
  });

  it('creates ObjectId', () => {
    const id = asObjectId('obj-123');
    expect(id as string).toBe('obj-123');
  });

  it('creates EventId', () => {
    const id = asEventId('event-456');
    expect(id as string).toBe('event-456');
  });

  it('creates PackageId', () => {
    const id = asPackageId(testId);
    expect(id as string).toBe(testId);
  });

  it('creates SpaceId', () => {
    const id = asSpaceId(testId);
    expect(id as string).toBe(testId);
  });
});
