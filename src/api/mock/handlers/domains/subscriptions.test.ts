import { beforeEach, describe, expect, it } from 'vitest';

import { handleMockRequest } from '../../handlers';
import { getState, resetToSeed } from '../../store';

const adminHeaders = { Authorization: 'Bearer mock-token-user-admin' };
const viewerHeaders = { Authorization: 'Bearer mock-token-user-viewer' };
const request = (
  url: string,
  method = 'get',
  data?: unknown,
  params?: unknown,
  headers: Record<string, string> = adminHeaders,
) => handleMockRequest({ url, method, data, params, headers } as never);

const validSubscription = {
  customerId: 'customer-acme',
  plan: 'growth',
  status: 'active',
  interval: 'monthly',
  seats: 10,
  unitPriceCents: 49900,
  trialEndsAt: null,
  currentPeriodEnd: '2026-11-05T10:00:00.000Z',
  cancelAtPeriodEnd: false,
} as const;

describe('Domain Subscriptions mock handler', () => {
  beforeEach(resetToSeed);

  it('filters by plan, status and interval and returns stable status counts', () => {
    const response = request('/v1/revenue/subscriptions', 'get', undefined, {
      plan: 'growth',
      status: 'active',
      interval: 'yearly',
      page: 1,
      items_per_page: 10,
    });

    expect(response.status).toBe(200);
    expect(response.data).toMatchObject({
      total_count: 1,
      counts: { all: 1, active: 1, trialing: 0, past_due: 0, canceled: 0 },
    });
    expect((response.data as { data: { id: string }[] }).data.map((item) => item.id)).toEqual([
      'subscription-orbit',
    ]);
  });

  it('creates and edits a subscription with integer minor units and valid relationships', () => {
    request('/v1/revenue/subscriptions/subscription-acme', 'delete');
    const created = request('/v1/revenue/subscriptions', 'post', validSubscription);
    expect(created.status).toBe(201);
    expect(created.data).toMatchObject(validSubscription);
    const id = (created.data as { id: string }).id;

    expect(request(`/v1/revenue/subscriptions/${id}`).data).toMatchObject({
      id,
      customerId: 'customer-acme',
    });
    expect(
      request(`/v1/revenue/subscriptions/${id}`, 'patch', {
        seats: 15,
        unitPriceCents: 69900,
        currentPeriodEnd: '2026-12-05T10:00:00.000Z',
      }).data,
    ).toMatchObject({ seats: 15, unitPriceCents: 69900, plan: 'growth' });
  });

  it('rejects invalid customer, duplicate customer, seats, price and period without mutation', () => {
    for (const payload of [
      { ...validSubscription, customerId: 'missing' },
      validSubscription,
      { ...validSubscription, customerId: 'customer-acme', seats: 0 },
      { ...validSubscription, customerId: 'customer-acme', unitPriceCents: -1 },
      {
        ...validSubscription,
        customerId: 'customer-acme',
        trialEndsAt: '2027-01-01T00:00:00.000Z',
      },
    ]) {
      const before = structuredClone(getState().domains);
      expect(request('/v1/revenue/subscriptions', 'post', payload).status).toBe(422);
      expect(getState().domains).toEqual(before);
    }
  });

  it('cancels and reactivates exact lifecycle states idempotently', () => {
    for (const id of ['subscription-acme', 'subscription-lumen', 'subscription-vertex']) {
      const canceled = request(`/v1/revenue/subscriptions/${id}/cancel`, 'post');
      expect(canceled.data).toMatchObject({ status: 'canceled', cancelAtPeriodEnd: true });
      const auditCount = getState().domains.auditLogs.length;
      expect(request(`/v1/revenue/subscriptions/${id}/cancel`, 'post').data).toEqual(canceled.data);
      expect(getState().domains.auditLogs).toHaveLength(auditCount);

      const active = request(`/v1/revenue/subscriptions/${id}/reactivate`, 'post');
      expect(active.data).toMatchObject({ status: 'active', cancelAtPeriodEnd: false });
      expect(request(`/v1/revenue/subscriptions/${id}/reactivate`, 'post').data).toEqual(
        active.data,
      );
    }
  });

  it('deletes a subscription and denies every viewer mutation before store changes', () => {
    expect(request('/v1/revenue/subscriptions/subscription-acme', 'delete').data).toEqual({
      deleted: ['subscription-acme'],
    });
    expect(getState().domains.subscriptions.some((item) => item.id === 'subscription-acme')).toBe(
      false,
    );

    for (const [method, url, payload] of [
      ['post', '/v1/revenue/subscriptions', validSubscription],
      ['patch', '/v1/revenue/subscriptions/subscription-orbit', { seats: 1 }],
      ['post', '/v1/revenue/subscriptions/subscription-orbit/cancel', undefined],
      ['delete', '/v1/revenue/subscriptions/subscription-orbit', undefined],
    ] as const) {
      const before = structuredClone(getState().domains);
      expect(request(url, method, payload, undefined, viewerHeaders).status).toBe(403);
      expect(getState().domains).toEqual(before);
    }
  });
});
