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

const validCustomer = {
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
} as const;

describe('Domain Customers mock handler', () => {
  beforeEach(resetToSeed);

  it('combines search, filters, sorting and pagination in a typed envelope', () => {
    const response = request('/v1/customers', 'get', undefined, {
      search: 'finance',
      status: 'past_due',
      plan: 'growth',
      source: 'paid_search',
      sort_by: 'healthScore',
      sort_order: 'desc',
      page: 1,
      items_per_page: 1,
    });

    expect(response.status).toBe(200);
    expect(response.data).toMatchObject({
      total_count: 1,
      page: 1,
      items_per_page: 1,
      has_more: false,
    });
    expect((response.data as { data: { id: string }[] }).data.map((item) => item.id)).toEqual([
      'customer-vertex',
    ]);
  });

  it('creates, reads and updates every persisted customer field', () => {
    const created = request('/v1/customers', 'post', validCustomer);
    expect(created.status).toBe(201);
    expect(created.data).toMatchObject(validCustomer);
    const id = (created.data as { id: string }).id;

    expect(request(`/v1/customers/${id}`).data).toMatchObject({
      id,
      email: 'renata@atlas.test',
      seatsUsed: 12,
      seatsLimit: 20,
    });
    expect(
      request(`/v1/customers/${id}`, 'patch', {
        plan: 'scale',
        mrrCents: 149900,
        healthScore: 91,
        seatsUsed: 18,
        seatsLimit: 60,
      }).data,
    ).toMatchObject({
      id,
      plan: 'scale',
      mrrCents: 149900,
      healthScore: 91,
      seatsUsed: 18,
      seatsLimit: 60,
      contactName: 'Renata Melo',
    });
    expect(getState().domains.auditLogs[0]).toMatchObject({
      action: 'customer.updated',
      resourceId: id,
      metadata: { plan: 'scale', healthScore: 91 },
    });
  });

  it('rejects duplicate email and invalid health, money, status and seat values without mutation', () => {
    for (const payload of [
      { ...validCustomer, email: 'MARINA@ACME.TEST' },
      { ...validCustomer, healthScore: 101 },
      { ...validCustomer, mrrCents: -1 },
      { ...validCustomer, status: 'unknown' },
      { ...validCustomer, seatsUsed: 21, seatsLimit: 20 },
      { ...validCustomer, seatsLimit: 0 },
    ]) {
      const before = structuredClone(getState().domains);
      expect(request('/v1/customers', 'post', payload).status).toBe(422);
      expect(getState().domains).toEqual(before);
    }
  });

  it('archives a customer as churned, preserves relationships and is idempotent', () => {
    const beforeSubscriptions = structuredClone(getState().domains.subscriptions);
    const first = request('/v1/customers/customer-acme', 'delete');
    const auditCount = getState().domains.auditLogs.length;
    const second = request('/v1/customers/customer-acme', 'delete');

    expect(first.data).toMatchObject({ id: 'customer-acme', status: 'churned' });
    expect(second.data).toEqual(first.data);
    expect(getState().domains.subscriptions).toEqual(beforeSubscriptions);
    expect(getState().domains.auditLogs).toHaveLength(auditCount);
  });

  it('keeps the store unchanged when a viewer attempts any customer mutation', () => {
    for (const [method, url, payload] of [
      ['post', '/v1/customers', validCustomer],
      ['patch', '/v1/customers/customer-acme', { healthScore: 1 }],
      ['delete', '/v1/customers/customer-acme', undefined],
    ] as const) {
      const before = structuredClone(getState().domains);
      expect(request(url, method, payload, undefined, viewerHeaders).status).toBe(403);
      expect(getState().domains).toEqual(before);
    }
  });
});
