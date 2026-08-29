import { useMemo } from 'react';

import { menuRoutes } from '@/router/routes/menu-routes';
import { flattenMenuRoutes, menuFilter } from '@/router/utils';

export function useMenuRoutes() {
  return menuRoutes;
}

export function useFlattenedRoutes() {
  return useMemo(() => {
    const filtered = menuFilter([...menuRoutes]);
    return flattenMenuRoutes(filtered);
  }, []);
}
