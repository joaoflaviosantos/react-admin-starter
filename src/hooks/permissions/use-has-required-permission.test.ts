import { describe, expect, it } from 'vitest';

import { ADMIN_PERMISSIONS, VIEWER_PERMISSIONS, hasPermissionAction } from '@/api/mock/permissions';

import { PermissionActionType } from '#/enum';

describe('hasPermissionAction', () => {
  it('denies management create actions for viewer permissions', () => {
    const allowed = hasPermissionAction(
      VIEWER_PERMISSIONS,
      'sys.menu.management.system.users',
      PermissionActionType.CREATE,
    );
    expect(allowed).toBe(false);
  });

  it('allows management create actions for admin permissions', () => {
    const allowed = hasPermissionAction(
      ADMIN_PERMISSIONS,
      'sys.menu.management.system.users',
      PermissionActionType.CREATE,
    );
    expect(allowed).toBe(true);
  });
});
