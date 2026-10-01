import apiClient from '@/api/apiClient';
import type { DashboardPeriod, DashboardResponse } from '#/examples';

const baseUrl = '/v1/examples/dashboard';

const getDashboard = (period: DashboardPeriod = '30d') =>
  apiClient.get<DashboardResponse>({ url: baseUrl, params: { period } });

export default { getDashboard };
