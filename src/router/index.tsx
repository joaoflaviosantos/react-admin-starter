import { Suspense, lazy } from 'react';
import { Navigate, RouteObject, createBrowserRouter } from 'react-router-dom';

import { CircleLoading } from '@/components/loading';
import DashboardLayout from '@/layouts/dashboard';
import SimpleLayout from '@/layouts/simple';
import LoginPage from '@/pages/sys/login';
import AuthGuard from '@/router/components/auth-guard';
import { menuRoutes } from '@/router/routes/menu-routes';

const Page404 = lazy(() => import('@/pages/sys/error/404'));

const HOMEPAGE = import.meta.env.VITE_APP_HOMEPAGE ?? '/workbench/overview';

export const router = createBrowserRouter([
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
      ...(menuRoutes as RouteObject[]),
    ],
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
]);
