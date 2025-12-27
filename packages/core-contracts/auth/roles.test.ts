/**
 * Unit Tests for Auth Roles
 */
import { describe, it, expect } from 'vitest';
import {
  SystemRole,
  RoleScope,
  RoleType,
  SystemRolePermissions,
  isSystemRole,
  getSystemRolePermissions,
  resolveRolePermissions,
} from './roles';
import { Permissions } from './permissions';

describe('SystemRole enum', () => {
  it('defines all system roles', () => {
    expect(SystemRole.Owner).toBe('owner');
    expect(SystemRole.Admin).toBe('admin');
    expect(SystemRole.Member).toBe('member');
    expect(SystemRole.Viewer).toBe('viewer');
    expect(SystemRole.Service).toBe('service');
    expect(SystemRole.System).toBe('system');
  });
});

describe('RoleScope enum', () => {
  it('defines all scope levels', () => {
    expect(RoleScope.Global).toBe('global');
    expect(RoleScope.Organization).toBe('organization');
    expect(RoleScope.Team).toBe('team');
    expect(RoleScope.Resource).toBe('resource');
  });
});

describe('RoleType enum', () => {
  it('defines role types', () => {
    expect(RoleType.System).toBe('system');
    expect(RoleType.Custom).toBe('custom');
  });
});

describe('SystemRolePermissions', () => {
  it('Owner has wildcard permission', () => {
    expect(SystemRolePermissions[SystemRole.Owner]).toEqual(['*']);
  });

  it('System has wildcard permission', () => {
    expect(SystemRolePermissions[SystemRole.System]).toEqual(['*']);
  });

  it('Admin has comprehensive permissions', () => {
    const adminPerms = SystemRolePermissions[SystemRole.Admin];
    expect(adminPerms).toContain(Permissions.VIEW_POOL);
    expect(adminPerms).toContain(Permissions.VIEW_MODEL);
    expect(adminPerms).toContain(Permissions.VIEW_USERS);
    expect(adminPerms).not.toContain('*');
  });

  it('Viewer has only view permissions', () => {
    const viewerPerms = SystemRolePermissions[SystemRole.Viewer];
    expect(viewerPerms.every(p => p.includes(':view'))).toBe(true);
  });
});

describe('isSystemRole', () => {
  it('returns true for system roles', () => {
    expect(isSystemRole('owner')).toBe(true);
    expect(isSystemRole('admin')).toBe(true);
    expect(isSystemRole('member')).toBe(true);
    expect(isSystemRole('viewer')).toBe(true);
    expect(isSystemRole('service')).toBe(true);
    expect(isSystemRole('system')).toBe(true);
  });

  it('returns false for custom roles', () => {
    expect(isSystemRole('custom-role')).toBe(false);
    expect(isSystemRole('analyst')).toBe(false);
    expect(isSystemRole('')).toBe(false);
  });
});

describe('getSystemRolePermissions', () => {
  it('returns permissions for system roles', () => {
    expect(getSystemRolePermissions(SystemRole.Owner)).toEqual(['*']);
    expect(getSystemRolePermissions(SystemRole.Viewer).length).toBeGreaterThan(0);
  });
});

describe('resolveRolePermissions', () => {
  it('resolves permissions for system roles', () => {
    const permissions = resolveRolePermissions(['viewer']);
    expect(permissions).toContain(Permissions.VIEW_POOL);
    expect(permissions).toContain(Permissions.VIEW_MODEL);
  });

  it('resolves permissions for multiple roles', () => {
    const permissions = resolveRolePermissions(['viewer', 'member']);
    // Should have viewer permissions plus member permissions
    expect(permissions.length).toBeGreaterThan(
      SystemRolePermissions[SystemRole.Viewer].length
    );
  });

  it('includes custom role permissions', () => {
    const customRolePermissions = new Map([
      ['analyst', ['analytics:view', 'analytics:export']],
    ]);
    const permissions = resolveRolePermissions(['analyst'], customRolePermissions);
    expect(permissions).toContain('analytics:view');
    expect(permissions).toContain('analytics:export');
  });

  it('deduplicates permissions', () => {
    const permissions = resolveRolePermissions(['viewer', 'viewer']);
    const uniquePerms = [...new Set(permissions)];
    expect(permissions.length).toBe(uniquePerms.length);
  });

  it('returns empty array for unknown roles without custom mapping', () => {
    const permissions = resolveRolePermissions(['unknown-role']);
    expect(permissions).toEqual([]);
  });
});
