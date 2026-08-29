import { createBrowserRouter } from 'react-router-dom';

import PlaceholderPage from '@/pages/placeholder';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PlaceholderPage />,
  },
]);
