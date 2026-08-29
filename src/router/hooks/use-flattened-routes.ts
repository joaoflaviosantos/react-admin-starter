import { useMemo } from 'react';

import { usePermissionRoutes } from '@/router/hooks/use-permission-routes';
import { flattenMenuRoutes, menuFilter } from '@/router/utils';

export function useFlattenedRoutes() {
  const permissionRoutes = usePermissionRoutes();

  return useMemo(() => {
    const filtered = menuFilter(permissionRoutes);
    return flattenMenuRoutes(filtered);
  }, [permissionRoutes]);
}
