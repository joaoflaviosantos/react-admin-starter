import { describe, expect, it } from 'vitest';

import { ADMIN_PERMISSIONS, VIEWER_PERMISSIONS, hasPermissionAction } from '@/api/mock/permissions';
import { flattenTrees } from '@/utils/tree';

import { PermissionActionType } from '#/enum';

function examplesChildren(permissions: typeof ADMIN_PERMISSIONS) {
  return permissions.find((permission) => permission.route === 'examples')?.children ?? [];
}

describe('SaaS Examples permission catalogue', () => {
  it('gives admins the Customers, Revenue, Support and Platform subtrees', () => {
    const children = examplesChildren(ADMIN_PERMISSIONS);
    expect(children.map((permission) => permission.route)).toEqual([
      'customers',
      'revenue',
      'support',
      'platform',
    ]);

    const routes = flattenTrees(children).map((permission) => permission.route);
    expect(routes).toEqual(
      expect.arrayContaining([
        'subscriptions',
        'invoices',
        'invoices/new',
        'invoices/:id/edit',
        'invoices/:id',
        'tickets',
        'api-keys',
        'audit-logs',
      ]),
    );
  });

  it('gives viewers readable Customers, Revenue and Support while hiding Platform', () => {
    const children = examplesChildren(VIEWER_PERMISSIONS);
    expect(
      children.filter((permission) => !permission.is_hide).map((permission) => permission.route),
    ).toEqual(['customers', 'revenue', 'support']);
    expect(children.find((permission) => permission.route === 'platform')).toMatchObject({
      is_hide: true,
      actions_allowed: [],
    });
    expect(
      flattenTrees(children)
        .filter((permission) => !permission.is_hide && !permission.required_action)
        .every((permission) =>
          permission.actions_allowed?.every(
            (action) =>
              action === PermissionActionType.READ || action === PermissionActionType.EXPORT,
          ),
        ),
    ).toBe(true);
  });

  it('enforces exact actions on hidden invoice routes', () => {
    const adminRoutes = flattenTrees(ADMIN_PERMISSIONS);
    const viewerRoutes = flattenTrees(VIEWER_PERMISSIONS);

    expect(adminRoutes.find((permission) => permission.route === 'invoices/new')).toMatchObject({
      is_hide: true,
      required_action: PermissionActionType.CREATE,
    });
    expect(
      adminRoutes.find((permission) => permission.route === 'invoices/:id/edit'),
    ).toMatchObject({ is_hide: true, required_action: PermissionActionType.UPDATE });
    expect(adminRoutes.find((permission) => permission.route === 'invoices/:id')).toMatchObject({
      is_hide: true,
      required_action: PermissionActionType.READ,
    });

    expect(
      hasPermissionAction(
        VIEWER_PERMISSIONS,
        'examples.menu.invoices',
        PermissionActionType.EXPORT,
      ),
    ).toBe(true);
    expect(
      hasPermissionAction(VIEWER_PERMISSIONS, 'examples.invoices.new', PermissionActionType.CREATE),
    ).toBe(false);
    expect(
      viewerRoutes.find((permission) => permission.route === 'invoices/:id')?.actions_allowed,
    ).toEqual([PermissionActionType.READ, PermissionActionType.EXPORT]);
  });
});
