import { DashboardOutlined } from '@ant-design/icons';
import { lazy } from 'react';

import { AppRouteObject } from '#/router';

const OverviewPage = lazy(() => import('@/pages/workbench/overview'));

export const menuRoutes: AppRouteObject[] = [
  {
    path: 'workbench/overview',
    element: <OverviewPage />,
    meta: {
      key: '/workbench/overview',
      label: 'sys.menu.overview',
      icon: <DashboardOutlined />,
    },
  },
];
