/**
 * Unit Tests for Auth Context
 */
import { describe, it, expect } from 'vitest';
import {
  isAuthContext,
  isServiceContext,
  createAnonymousContext,
  createSystemContext,
  createServiceContext,
} from './context';
import type { AuthContext, ServiceContext, RequestContext } from './context';

describe('isAuthContext', () => {
  it('returns true for auth contexts', () => {
    const ctx: AuthContext = {
      userId: 'user-123',
      tenantId: 'tenant-456',
      roles: ['member'],
      permissions: ['pool:view'],
    };
    expect(isAuthContext(ctx)).toBe(true);
  });

  it('returns false for service contexts', () => {
    const ctx: ServiceContext = {
      serviceName: 'data-service',
      tenantId: 'tenant-456',
      correlationId: 'corr-789',
    };
    expect(isAuthContext(ctx)).toBe(false);
  });
});

describe('isServiceContext', () => {
  it('returns true for service contexts', () => {
    const ctx: ServiceContext = {
      serviceName: 'data-service',
      tenantId: 'tenant-456',
      correlationId: 'corr-789',
    };
    expect(isServiceContext(ctx)).toBe(true);
  });

  it('returns false for auth contexts', () => {
    const ctx: AuthContext = {
      userId: 'user-123',
      tenantId: 'tenant-456',
      roles: ['member'],
      permissions: ['pool:view'],
    };
    expect(isServiceContext(ctx)).toBe(false);
  });
});

describe('createAnonymousContext', () => {
  it('creates anonymous context with given tenant', () => {
    const ctx = createAnonymousContext('tenant-123');

    expect(ctx.userId).toBe('anonymous');
    expect(ctx.tenantId).toBe('tenant-123');
    expect(ctx.roles).toEqual([]);
    expect(ctx.permissions).toEqual([]);
  });

  it('is recognized as auth context', () => {
    const ctx = createAnonymousContext('tenant-123');
    expect(isAuthContext(ctx)).toBe(true);
  });
});

describe('createSystemContext', () => {
  it('creates system context with full permissions', () => {
    const ctx = createSystemContext('tenant-123');

    expect(ctx.userId).toBe('system');
    expect(ctx.tenantId).toBe('tenant-123');
    expect(ctx.roles).toEqual(['system']);
    expect(ctx.permissions).toEqual(['*']);
  });

  it('is recognized as auth context', () => {
    const ctx = createSystemContext('tenant-123');
    expect(isAuthContext(ctx)).toBe(true);
  });
});

describe('createServiceContext', () => {
  it('creates service context', () => {
    const ctx = createServiceContext('mining-service', 'tenant-123', 'corr-456');

    expect(ctx.serviceName).toBe('mining-service');
    expect(ctx.tenantId).toBe('tenant-123');
    expect(ctx.correlationId).toBe('corr-456');
  });

  it('is recognized as service context', () => {
    const ctx = createServiceContext('mining-service', 'tenant-123', 'corr-456');
    expect(isServiceContext(ctx)).toBe(true);
    expect(isAuthContext(ctx)).toBe(false);
  });
});

describe('RequestContext type narrowing', () => {
  it('narrows correctly in conditional', () => {
    const authCtx: RequestContext = {
      userId: 'user-123',
      tenantId: 'tenant-456',
      roles: ['member'],
      permissions: ['pool:view'],
    };

    if (isAuthContext(authCtx)) {
      expect(authCtx.userId).toBe('user-123');
    }

    const serviceCtx: RequestContext = {
      serviceName: 'data-service',
      tenantId: 'tenant-456',
      correlationId: 'corr-789',
    };

    if (isServiceContext(serviceCtx)) {
      expect(serviceCtx.serviceName).toBe('data-service');
    }
  });
});
