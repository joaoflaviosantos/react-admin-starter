import { describe, expect, it } from 'vitest';
import { Navigate } from 'react-router-dom';

import { VIEWER_PERMISSIONS } from '@/api/mock/permissions';
import { flattenTrees } from '@/utils/tree';

import { loadPageComponent, transformPermissionToMenuRoutes } from './use-permission-routes';

describe('permission route page resolution', () => {
  it('resolves the retained invoice list route to a valid lazy page component', async () => {
    const module = await loadPageComponent('/examples/invoices/list/index.tsx');
    expect(typeof module.default).toBe('function');
  });

  it('rejects a missing page with a diagnostic error instead of returning an invalid lazy ctor', async () => {
    await expect(loadPageComponent('/examples/missing/index.tsx')).rejects.toThrow(
      'Page component not found: /examples/missing/index.tsx',
    );
  });

  it('keeps unauthorized deep links hidden and redirects them to 403', () => {
    const routes = transformPermissionToMenuRoutes(
      VIEWER_PERMISSIONS,
      flattenTrees(VIEWER_PERMISSIONS),
    );
    const revenue = routes
      .find((route) => route.path === 'examples')
      ?.children?.find((route) => route.path === 'revenue');
    const createRoute = revenue?.children?.find((route) => route.path === 'invoices/new');
    const editRoute = revenue?.children?.find((route) => route.path === 'invoices/:id/edit');
    const previewRoute = revenue?.children?.find((route) => route.path === 'invoices/:id');
    const platformRoute = routes
      .find((route) => route.path === 'examples')
      ?.children?.find((route) => route.path === 'platform');

    expect(createRoute?.meta?.is_hide).toBe(true);
    expect(createRoute?.element).toMatchObject({
      type: Navigate,
      props: { to: '/403', replace: true },
    });
    expect(editRoute?.element).toMatchObject({
      type: Navigate,
      props: { to: '/403', replace: true },
    });
    expect(previewRoute?.meta?.key).toBe('/examples/revenue/invoices/:id');
    expect(previewRoute?.element).not.toMatchObject({ type: Navigate });
    expect(platformRoute?.meta?.is_hide).toBe(true);
    expect(
      platformRoute?.children?.find((route) => route.path === 'api-keys')?.element,
    ).toMatchObject({
      type: Navigate,
      props: { to: '/403', replace: true },
    });
  });
});
