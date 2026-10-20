import { beforeEach, describe, expect, it } from 'vitest';

import { resetToSeed } from '@/api/mock/store';
import { setItem } from '@/utils/storage';
import { StorageEnum } from '#/enum';

import customerService from './customerService';

describe('Customer service', () => {
  beforeEach(() => {
    resetToSeed();
    localStorage.clear();
    setItem(StorageEnum.Token, { access_token: 'mock-token-user-admin', token_type: 'bearer' });
  });

  it('lists, creates, reads, updates and archives customers through the adapter', async () => {
    const listed = await customerService.getCustomers({
      status: 'active',
      sort_by: 'healthScore',
      sort_order: 'desc',
      page: 1,
      items_per_page: 2,
    });
    expect(listed.data.map((customer) => customer.id)).toEqual([
      'customer-acme',
      'customer-northstar',
    ]);
    expect(listed).toMatchObject({ total_count: 3, page: 1, items_per_page: 2, has_more: true });

    const created = await customerService.createCustomer({
      name: 'Atlas Operations',
      contactName: 'Renata Melo',
      email: 'renata@atlas.test',
      industry: 'Operations',
      source: 'referral',
      status: 'active',
      plan: 'growth',
      mrrCents: 49900,
      healthScore: 84,
      seatsUsed: 12,
      seatsLimit: 20,
    });
    expect(await customerService.getCustomer(created.id)).toMatchObject({
      id: created.id,
      email: 'renata@atlas.test',
    });
    expect(await customerService.updateCustomer(created.id, { healthScore: 90 })).toMatchObject({
      id: created.id,
      healthScore: 90,
      plan: 'growth',
    });
    expect(await customerService.archiveCustomer(created.id)).toMatchObject({
      id: created.id,
      status: 'churned',
    });
  });
});
