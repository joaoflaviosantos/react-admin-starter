import apiClient from '@/api/apiClient';
import type { DashboardPeriod, DashboardResponse } from '#/domain';

const baseUrl = '/v1/dashboard';

const getDashboard = (period: DashboardPeriod = '30d') =>
  apiClient.get<DashboardResponse>({ url: baseUrl, params: { period } });

export default { getDashboard };
