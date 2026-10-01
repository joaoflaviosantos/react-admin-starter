import { beforeEach, describe, expect, it } from 'vitest';

import { resetToSeed } from '@/api/mock/store';
import { setItem } from '@/utils/storage';
import { StorageEnum } from '#/enum';

import subscriptionService from './subscriptionService';

describe('Subscription service', () => {
  beforeEach(() => {
    resetToSeed();
    localStorage.clear();
    setItem(StorageEnum.Token, { access_token: 'mock-token-user-admin', token_type: 'bearer' });
  });

  it('lists, reads, updates, cancels, reactivates and deletes subscriptions', async () => {
    const listed = await subscriptionService.getSubscriptions({ status: 'active' });
    expect(listed.data.map((subscription) => subscription.id)).toEqual([
      'subscription-acme',
      'subscription-orbit',
      'subscription-northstar',
    ]);
    expect(listed.counts.active).toBe(3);

    expect(await subscriptionService.getSubscription('subscription-acme')).toMatchObject({
      customerId: 'customer-acme',
      unitPriceCents: 12900,
    });
    expect(
      await subscriptionService.updateSubscription('subscription-acme', {
        seats: 8,
        unitPriceCents: 25900,
      }),
    ).toMatchObject({ seats: 8, unitPriceCents: 25900 });
    expect(await subscriptionService.cancelSubscription('subscription-acme')).toMatchObject({
      status: 'canceled',
      cancelAtPeriodEnd: true,
    });
    expect(await subscriptionService.reactivateSubscription('subscription-acme')).toMatchObject({
      status: 'active',
      cancelAtPeriodEnd: false,
    });
    expect(await subscriptionService.deleteSubscription('subscription-acme')).toEqual({
      deleted: ['subscription-acme'],
    });
  });

  it('creates a valid subscription after the prior customer subscription is removed', async () => {
    await subscriptionService.deleteSubscription('subscription-acme');
    const created = await subscriptionService.createSubscription({
      customerId: 'customer-acme',
      plan: 'growth',
      status: 'active',
      interval: 'monthly',
      seats: 10,
      unitPriceCents: 49900,
      trialEndsAt: null,
      currentPeriodEnd: '2026-11-05T10:00:00.000Z',
      cancelAtPeriodEnd: false,
    });

    expect(created).toMatchObject({
      customerId: 'customer-acme',
      plan: 'growth',
      seats: 10,
      unitPriceCents: 49900,
    });
  });
});
