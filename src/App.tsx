import { RouterProvider } from 'react-router-dom';

import AntdConfig from '@/theme/AntdConfig';
import { router } from '@/router';

export default function App() {
  return (
    <AntdConfig>
      <RouterProvider router={router} />
    </AntdConfig>
  );
}
