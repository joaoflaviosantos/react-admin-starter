import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { App as AntdApp } from 'antd';
import { RouterProvider } from 'react-router-dom';

import { router } from '@/router';
import AntdConfig from '@/theme/AntdConfig';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AntdConfig>
        <AntdApp>
          <RouterProvider router={router} />
        </AntdApp>
      </AntdConfig>
    </QueryClientProvider>
  );
}
