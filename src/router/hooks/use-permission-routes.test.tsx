import { describe, expect, it } from 'vitest';
import { Navigate } from 'react-router-dom';

import { VIEWER_PERMISSIONS } from '@/api/mock/permissions';
import { flattenTrees } from '@/utils/tree';

import { loadPageComponent, transformPermissionToMenuRoutes } from './use-permission-routes';

describe('permission route page resolution', () => {
  it('resolves the retained invoice list route to a valid lazy page component', async () => {
    const module = await loadPageComponent('/invoices/index.tsx');
    expect(typeof module.default).toBe('function');
  }, 15_000);

  it('rejects a missing page with a diagnostic error instead of returning an invalid lazy ctor', async () => {
    await expect(loadPageComponent('/missing/index.tsx')).rejects.toThrow(
      'Page component not found: /missing/index.tsx',
    );
  });

  it('keeps unauthorized menu links hidden and redirects them to 403', () => {
    const routes = transformPermissionToMenuRoutes(
      VIEWER_PERMISSIONS,
      flattenTrees(VIEWER_PERMISSIONS),
    );
    const revenue = routes.find((route) => route.path === 'revenue');
    const platformRoute = routes.find((route) => route.path === 'platform');

    expect(revenue?.children?.map((route) => route.path).filter(Boolean)).toEqual([
      'subscriptions',
      'invoices',
    ]);
    expect(platformRoute?.meta?.is_hide).toBe(true);
    expect(
      platformRoute?.children?.find((route) => route.path === 'api-keys')?.element,
    ).toMatchObject({
      type: Navigate,
      props: { to: '/403', replace: true },
    });
  });
});
