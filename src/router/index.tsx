import { createBrowserRouter } from 'react-router-dom';

import LoginPage from '@/pages/sys/login';
import PlaceholderPage from '@/pages/placeholder';
import AuthGuard from '@/router/components/auth-guard';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <AuthGuard>
        <PlaceholderPage />
      </AuthGuard>
    ),
  },
]);
