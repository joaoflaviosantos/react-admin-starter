import { Suspense, lazy, useMemo } from 'react';
import { Navigate, RouteObject, RouterProvider, createBrowserRouter } from 'react-router-dom';

import { CircleLoading } from '@/components/loading';
import DashboardLayout from '@/layouts/dashboard';
import SimpleLayout from '@/layouts/simple';
import LoginPage from '@/pages/sys/login';
import AuthGuard from '@/router/components/auth-guard';
import { usePermissionRoutes } from '@/router/hooks';

const Page404 = lazy(() => import('@/pages/sys/error/404'));
const Page403 = lazy(() => import('@/pages/sys/error/403'));

const HOMEPAGE = import.meta.env.VITE_APP_HOMEPAGE ?? '/workbench/overview';

function AppRoutes() {
  const permissionRoutes = usePermissionRoutes();

  const router = useMemo(
    () =>
      createBrowserRouter([
        {
          path: '/login',
          element: <LoginPage />,
        },
        {
          path: '/',
          element: (
            <AuthGuard>
              <DashboardLayout />
            </AuthGuard>
          ),
          children: [
            {
              index: true,
              element: <Navigate to={HOMEPAGE} replace />,
            },
            ...(permissionRoutes as RouteObject[]),
          ],
        },
        {
          path: '/403',
          element: (
            <AuthGuard>
              <SimpleLayout>
                <Suspense fallback={<CircleLoading />}>
                  <Page403 />
                </Suspense>
              </SimpleLayout>
            </AuthGuard>
          ),
        },
        {
          path: '/404',
          element: (
            <AuthGuard>
              <SimpleLayout>
                <Suspense fallback={<CircleLoading />}>
                  <Page404 />
                </Suspense>
              </SimpleLayout>
            </AuthGuard>
          ),
        },
        {
          path: '*',
          element: <Navigate to="/404" replace />,
        },
      ]),
    [permissionRoutes],
  );

  return <RouterProvider router={router} />;
}

export default AppRoutes;
