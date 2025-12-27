/**
 * Unit Tests for Auth Permissions
 */
import { describe, it, expect } from 'vitest';
import {
  Permissions,
  DataPermissions,
  MiningPermissions,
  StudioPermissions,
  AutomationPermissions,
  AdminPermissions,
  hasPermission,
  hasAllPermissions,
  hasAnyPermission,
} from './permissions';

describe('Permission Constants', () => {
  it('exports Data permissions', () => {
    expect(DataPermissions.VIEW_POOL).toBe('pool:view');
    expect(DataPermissions.CREATE_POOL).toBe('pool:create');
    expect(DataPermissions.DELETE_CONNECTION).toBe('connection:delete');
  });

  it('exports Mining permissions', () => {
    expect(MiningPermissions.VIEW_MODEL).toBe('model:view');
    expect(MiningPermissions.RUN_DISCOVERY).toBe('discovery:run');
  });

  it('exports Studio permissions', () => {
    expect(StudioPermissions.VIEW_DASHBOARD).toBe('dashboard:view');
    expect(StudioPermissions.SHARE_DASHBOARD).toBe('dashboard:share');
  });

  it('exports Automation permissions', () => {
    expect(AutomationPermissions.VIEW_WORKFLOW).toBe('workflow:view');
    expect(AutomationPermissions.RUN_WORKFLOW).toBe('workflow:run');
  });

  it('exports Admin permissions', () => {
    expect(AdminPermissions.VIEW_USERS).toBe('user:view');
    expect(AdminPermissions.MANAGE_BILLING).toBe('billing:manage');
  });

  it('aggregates all permissions', () => {
    expect(Permissions.VIEW_POOL).toBe('pool:view');
    expect(Permissions.VIEW_MODEL).toBe('model:view');
    expect(Permissions.VIEW_DASHBOARD).toBe('dashboard:view');
    expect(Permissions.VIEW_WORKFLOW).toBe('workflow:view');
    expect(Permissions.VIEW_USERS).toBe('user:view');
  });
});

describe('hasPermission', () => {
  it('returns true when permission exists', () => {
    const permissions = ['pool:view', 'pool:create'];
    expect(hasPermission(permissions, Permissions.VIEW_POOL)).toBe(true);
    expect(hasPermission(permissions, Permissions.CREATE_POOL)).toBe(true);
  });

  it('returns false when permission does not exist', () => {
    const permissions = ['pool:view'];
    expect(hasPermission(permissions, Permissions.DELETE_POOL)).toBe(false);
  });

  it('returns true for wildcard permission', () => {
    const permissions = ['*'];
    expect(hasPermission(permissions, Permissions.VIEW_POOL)).toBe(true);
    expect(hasPermission(permissions, Permissions.MANAGE_BILLING)).toBe(true);
  });

  it('returns false for empty permissions', () => {
    expect(hasPermission([], Permissions.VIEW_POOL)).toBe(false);
  });
});

describe('hasAllPermissions', () => {
  it('returns true when all permissions exist', () => {
    const permissions = ['pool:view', 'pool:create', 'pool:edit'];
    const required = [Permissions.VIEW_POOL, Permissions.CREATE_POOL];
    expect(hasAllPermissions(permissions, required)).toBe(true);
  });

  it('returns false when some permissions are missing', () => {
    const permissions = ['pool:view'];
    const required = [Permissions.VIEW_POOL, Permissions.DELETE_POOL];
    expect(hasAllPermissions(permissions, required)).toBe(false);
  });

  it('returns true for wildcard permission', () => {
    const permissions = ['*'];
    const required = [Permissions.VIEW_POOL, Permissions.MANAGE_BILLING];
    expect(hasAllPermissions(permissions, required)).toBe(true);
  });

  it('returns true for empty required list', () => {
    const permissions = ['pool:view'];
    expect(hasAllPermissions(permissions, [])).toBe(true);
  });
});

describe('hasAnyPermission', () => {
  it('returns true when at least one permission exists', () => {
    const permissions = ['pool:view'];
    const required = [Permissions.VIEW_POOL, Permissions.DELETE_POOL];
    expect(hasAnyPermission(permissions, required)).toBe(true);
  });

  it('returns false when no permissions match', () => {
    const permissions = ['pool:view'];
    const required = [Permissions.DELETE_POOL, Permissions.EDIT_POOL];
    expect(hasAnyPermission(permissions, required)).toBe(false);
  });

  it('returns true for wildcard permission', () => {
    const permissions = ['*'];
    const required = [Permissions.DELETE_POOL];
    expect(hasAnyPermission(permissions, required)).toBe(true);
  });

  it('returns false for empty required list', () => {
    const permissions = ['pool:view'];
    expect(hasAnyPermission(permissions, [])).toBe(false);
  });
});
