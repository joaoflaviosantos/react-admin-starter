import AppRoutes from '@/router';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { App as AntdApp } from 'antd';

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
          <AppRoutes />
        </AntdApp>
      </AntdConfig>
    </QueryClientProvider>
  );
}
