import { describe, expect, it } from 'vitest';

import { ADMIN_PERMISSIONS, VIEWER_PERMISSIONS, hasPermissionAction } from '@/api/mock/permissions';
import { flattenTrees } from '@/utils/tree';

import { PermissionActionType } from '#/enum';

function resourceChildren(permissions: typeof ADMIN_PERMISSIONS) {
  return permissions.filter(
    (permission) => permission.route !== 'workbench' && permission.route !== 'management',
  );
}

describe('SaaS permission catalogue', () => {
  it('gives admins the Operations, Support and Platform subtrees', () => {
    const children = resourceChildren(ADMIN_PERMISSIONS);
    expect(children.map((permission) => permission.route)).toEqual([
      'operations',
      'support',
      'platform',
    ]);

    const routes = flattenTrees(children).map((permission) => permission.route);
    expect(routes).toEqual(
      expect.arrayContaining([
        'customers',
        'subscriptions',
        'invoices',
        'tickets',
        'api-keys',
        'audit-logs',
      ]),
    );
    expect(children[0].children?.map((permission) => permission.route)).toEqual([
      'customers',
      'subscriptions',
      'invoices',
    ]);
  });

  it('gives viewers readable Operations and Support while hiding Platform', () => {
    const children = resourceChildren(VIEWER_PERMISSIONS);
    expect(
      children.filter((permission) => !permission.is_hide).map((permission) => permission.route),
    ).toEqual(['operations', 'support']);
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

  it('keeps invoice list actions without separate deep-link routes', () => {
    const adminRoutes = flattenTrees(ADMIN_PERMISSIONS);
    const viewerRoutes = flattenTrees(VIEWER_PERMISSIONS);

    expect(adminRoutes.some((permission) => permission.route.startsWith('invoices/'))).toBe(false);
    expect(
      hasPermissionAction(VIEWER_PERMISSIONS, 'app.menu.invoices', PermissionActionType.EXPORT),
    ).toBe(true);
    expect(
      hasPermissionAction(VIEWER_PERMISSIONS, 'app.invoices.new', PermissionActionType.CREATE),
    ).toBe(false);
    expect(
      viewerRoutes.find((permission) => permission.route === 'invoices')?.actions_allowed,
    ).toEqual([PermissionActionType.READ, PermissionActionType.EXPORT]);
  });
});
