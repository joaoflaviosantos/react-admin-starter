import { beforeEach, describe, expect, it } from 'vitest';

import { resetToSeed } from '@/api/mock/store';
import dashboardService from './dashboardService';
import { setItem } from '@/utils/storage';
import { StorageEnum } from '#/enum';

describe('Dashboard service', () => {
  beforeEach(() => {
    resetToSeed();
    localStorage.clear();
    setItem(StorageEnum.Token, { access_token: 'mock-token-user-viewer', token_type: 'bearer' });
  });

  it('allows viewer read access and uses one period query parameter', async () => {
    const response = await dashboardService.getDashboard('90d');

    expect(response.period).toBe('90d');
    expect(response.revenueMrr).toHaveLength(3);
    expect(response.sectionStates.kpis.status).toBe('ready');
  });

  it('rejects unsupported periods with the shared validation envelope', async () => {
    await expect(dashboardService.getDashboard('invalid' as never)).rejects.toMatchObject({
      response: { status: 422, data: { detail: 'Invalid dashboard period.' } },
    });
  });
});
