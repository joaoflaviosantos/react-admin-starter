import { beforeEach, describe, expect, it } from 'vitest';

import { resetToSeed } from '@/api/mock/store';
import { setItem } from '@/utils/storage';
import { StorageEnum } from '#/enum';

import { buildDashboardResponse } from './dashboard';

describe('Dashboard mock aggregation', () => {
  beforeEach(() => {
    resetToSeed();
    localStorage.clear();
    setItem(StorageEnum.Token, { access_token: 'mock-token-user-admin', token_type: 'bearer' });
  });

  it('derives deterministic KPIs and related distributions from the seed store', async () => {
    const response = buildDashboardResponse('30d', (await import('../../store')).getState());

    expect(response.period).toBe('30d');
    expect(response.kpis.mrr.value).toBe(262600);
    expect(response.kpis.activeSubscriptions.value).toBe(4);
    expect(response.planDistribution.reduce((sum, item) => sum + item.count, 0)).toBe(6);
    expect(response.acquisition.reduce((sum, item) => sum + item.count, 0)).toBe(6);
    expect(response.riskAccounts.map((item) => item.id)).toEqual([
      'customer-vertex',
      'customer-lumen',
    ]);
  });

  it('returns period-specific time series and activity windows', async () => {
    const { getState } = await import('../../store');
    const short = buildDashboardResponse('30d', getState());
    const quarter = buildDashboardResponse('90d', getState());
    const year = buildDashboardResponse('12m', getState());

    expect(short.revenueMrr).toHaveLength(1);
    expect(quarter.revenueMrr).toHaveLength(3);
    expect(year.revenueMrr).toHaveLength(12);
    expect(short.recentActivity.map((event) => event.id)).toEqual([
      'audit-1001',
      'audit-1002',
      'audit-1005',
    ]);
    expect(quarter.recentActivity.map((event) => event.id)).toEqual([
      'audit-1001',
      'audit-1002',
      'audit-1005',
    ]);
    expect(year.recentActivity).toHaveLength(6);
  });
});
