import { AppRouteObject, RouteMeta } from '#/router';

export const menuFilter = (items: AppRouteObject[]): AppRouteObject[] => {
  return items
    .filter((item) => item.meta?.key)
    .map((item) => ({
      ...item,
      children: item.children ? menuFilter(item.children) : undefined,
    }))
    .sort((a, b) => String(a.order ?? '').localeCompare(String(b.order ?? '')));
};

export function flattenMenuRoutes(routes: AppRouteObject[]) {
  return routes.reduce<RouteMeta[]>((prev, item) => {
    const { meta, children } = item;
    if (meta) prev.push(meta);
    if (children) prev.push(...flattenMenuRoutes(children));
    return prev;
  }, []);
}
