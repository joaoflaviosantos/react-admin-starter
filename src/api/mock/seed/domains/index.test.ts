import { describe, expect, it } from 'vitest';

import {
  apiKeysSeed,
  auditLogsSeed,
  customersSeed,
  invoicesSeed,
  subscriptionsSeed,
  supportTicketsSeed,
} from '.';

describe('SaaS domain seeds', () => {
  it('uses the exact persisted fields defined for every SaaS model', () => {
    expect(Object.keys(customersSeed[0] ?? {})).toEqual([
      'id',
      'name',
      'contactName',
      'email',
      'industry',
      'source',
      'status',
      'plan',
      'mrrCents',
      'healthScore',
      'seatsUsed',
      'seatsLimit',
      'createdAt',
      'updatedAt',
    ]);
    expect(Object.keys(subscriptionsSeed[0] ?? {})).toEqual([
      'id',
      'customerId',
      'plan',
      'status',
      'interval',
      'seats',
      'unitPriceCents',
      'trialEndsAt',
      'currentPeriodEnd',
      'cancelAtPeriodEnd',
      'createdAt',
      'updatedAt',
    ]);
    expect(Object.keys(supportTicketsSeed[0] ?? {})).toEqual([
      'id',
      'customerId',
      'subject',
      'requesterEmail',
      'priority',
      'status',
      'assignee',
      'slaDueAt',
      'createdAt',
      'updatedAt',
      'description',
    ]);
    expect(Object.keys(apiKeysSeed[0] ?? {})).toEqual([
      'id',
      'name',
      'prefix',
      'scopes',
      'createdAt',
      'lastUsedAt',
      'expiresAt',
      'revokedAt',
    ]);
    expect(Object.keys(auditLogsSeed[0] ?? {})).toEqual([
      'id',
      'actorName',
      'actorEmail',
      'action',
      'resourceType',
      'resourceId',
      'summary',
      'ipAddress',
      'userAgent',
      'createdAt',
      'metadata',
    ]);
    expect(invoicesSeed[0]).toMatchObject({
      id: 'invoice-1001',
      subtotal: 100000,
      taxAmount: 20000,
      discountAmount: 0,
      shippingAmount: 5000,
      total: 125000,
    });
  });

  it('uses stable unique IDs and valid customer relationships', () => {
    const customerIds = new Set(customersSeed.map((customer) => customer.id));
    const allIds = [
      ...customersSeed,
      ...subscriptionsSeed,
      ...invoicesSeed,
      ...supportTicketsSeed,
      ...apiKeysSeed,
      ...auditLogsSeed,
    ].map((item) => item.id);

    expect(new Set(allIds).size).toBe(allIds.length);
    expect(subscriptionsSeed.every((item) => customerIds.has(item.customerId))).toBe(true);
    expect(supportTicketsSeed.every((item) => customerIds.has(item.customerId))).toBe(true);
  });

  it('keeps money and capacity values as valid integer source-of-truth values', () => {
    expect(
      customersSeed.every(
        (item) =>
          Number.isInteger(item.mrrCents) &&
          item.mrrCents >= 0 &&
          Number.isInteger(item.healthScore) &&
          item.healthScore >= 0 &&
          item.healthScore <= 100 &&
          item.seatsUsed >= 0 &&
          item.seatsUsed <= item.seatsLimit,
      ),
    ).toBe(true);
    expect(
      subscriptionsSeed.every(
        (item) => Number.isInteger(item.unitPriceCents) && item.unitPriceCents >= 0,
      ),
    ).toBe(true);
  });

  it('stores only masked API key prefixes and metadata', () => {
    expect(apiKeysSeed.map((item) => item.prefix)).toEqual([
      'sk_live_7H2K',
      'sk_live_9M4P',
      'sk_test_3Q8R',
    ]);
    expect(JSON.stringify(apiKeysSeed)).not.toContain('secret');
    expect(apiKeysSeed.every((item) => !item.prefix.includes('.'))).toBe(true);
  });
});
