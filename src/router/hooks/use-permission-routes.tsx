import { Suspense, lazy, useMemo, type ComponentType } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

import { CircleLoading } from '@/components/loading';
import { useUserPermission } from '@/store/userStore';
import { flattenTrees } from '@/utils/tree';

import { BasicStatus, PermissionType } from '#/enum';
import { AppRouteObject } from '#/router';
import { PermissionWithChildRead } from '#/system/user';

const entryPath = '/src/pages';
const pages = import.meta.glob('/src/pages/**/*.tsx');

function resolveComponent(path: string) {
  return pages[`${entryPath}${path}`];
}

function getCompleteRoute(
  permission: PermissionWithChildRead,
  flattenedPermissions: PermissionWithChildRead[],
  route = '',
) {
  const currentRoute = route ? `/${permission.route}${route}` : `/${permission.route}`;

  if (permission.parent_id) {
    const parentPermission = flattenedPermissions.find((p) => p.id === permission.parent_id);
    if (parentPermission) {
      return getCompleteRoute(parentPermission, flattenedPermissions, currentRoute);
    }
  }

  return currentRoute;
}

function transformPermissionToMenuRoutes(
  permissions: PermissionWithChildRead[],
  flattenedPermissions: PermissionWithChildRead[],
): AppRouteObject[] {
  return permissions.map((permission) => {
    const {
      route,
      type,
      label,
      alternative_label,
      icon,
      order,
      is_hide,
      is_tab_hide,
      status,
      frame_src,
      component,
      parent_id,
      children = [],
    } = permission;

    const appRoute: AppRouteObject = {
      path: route,
      meta: {
        type,
        label,
        alternative_label,
        key: getCompleteRoute(permission, flattenedPermissions),
        is_hide: !!is_hide,
        is_tab_hide,
        disabled: status === BasicStatus.DISABLE,
      },
    };

    if (order) appRoute.order = order;
    if (icon) appRoute.meta!.icon = icon;
    if (frame_src) appRoute.meta!.frame_src = frame_src;

    if (type === PermissionType.CATALOGUE) {
      appRoute.meta!.is_tab_hide = true;
      if (!parent_id) {
        appRoute.element = (
          <Suspense fallback={<CircleLoading />}>
            <Outlet />
          </Suspense>
        );
      }
      appRoute.children = transformPermissionToMenuRoutes(children, flattenedPermissions);

      if (children.length > 0) {
        appRoute.children.unshift({
          index: true,
          element: <Navigate to={children[0].route} replace />,
        });
      }
    } else if (type === PermissionType.MENU && component) {
      const Element = lazy(
        resolveComponent(component) as () => Promise<{ default: ComponentType }>,
      );
      appRoute.element = (
        <Suspense fallback={<CircleLoading />}>
          <Element />
        </Suspense>
      );
    }

    return appRoute;
  });
}

export function usePermissionRoutes() {
  const permissions = useUserPermission();

  return useMemo(() => {
    const flattenedPermissions = flattenTrees(permissions ?? []);
    return transformPermissionToMenuRoutes(permissions ?? [], flattenedPermissions);
  }, [permissions]);
}
