import { Navigate, useLocation } from 'react-router-dom';

import { useFlattenedRoutes } from '@/router/hooks';

const MANAGEMENT_PREFIX = '/management';

export default function PermissionRouteWatcher() {
  const { pathname } = useLocation();
  const flattenedRoutes = useFlattenedRoutes();

  if (!pathname.startsWith(MANAGEMENT_PREFIX)) {
    return null;
  }

  const isAllowed = flattenedRoutes.some(
    (route) => route.key === pathname || `${route.key}/` === pathname,
  );

  if (!isAllowed) {
    return <Navigate to="/403" replace />;
  }

  return null;
}
