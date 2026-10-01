import { beforeEach, describe, expect, it } from 'vitest';

import { handleMockRequest } from '../../handlers';
import { getState, resetToSeed } from '../../store';

const headers = { Authorization: 'Bearer mock-token-user-admin' };
const request = (
  url: string,
  method = 'get',
  data?: unknown,
  params?: unknown,
  customHeaders: Record<string, string> = headers,
) => handleMockRequest({ url, method, data, params, headers: customHeaders } as never);
const valid = {
  number: 'INV-2000',
  label: 'Development',
  issueDate: '2026-02-01',
  dueDate: '2026-02-28',
  customer: 'Grace Inc',
  customerEmail: 'billing@grace.test',
  billing: 'Grace Inc',
  currency: 'BRL',
  paymentMethod: 'Bank transfer',
  notes: 'Thanks',
  taxRateBps: 1250,
  discountRateBps: 500,
  shippingAmount: 100,
  items: [{ description: 'Development', quantity: 3, unitPrice: 333 }],
};

describe('Examples Invoices mock handler', () => {
  beforeEach(resetToSeed);

  it('calculates in minor units with deterministic half-up rounding', () => {
    const response = request('/v1/examples/revenue/invoices', 'post', valid);
    expect(response.status).toBe(201);
    expect(response.data).toMatchObject({
      subtotal: 999,
      taxAmount: 125,
      discountAmount: 50,
      shippingAmount: 100,
      total: 1174,
      status: 'draft',
    });
  });

  it('validates dates, percentages, prices, item presence and required fields', () => {
    for (const payload of [
      { ...valid, dueDate: '2026-01-31' },
      { ...valid, taxRateBps: 10001 },
      { ...valid, discountRateBps: -1 },
      { ...valid, items: [] },
      { ...valid, items: [{ description: 'x', quantity: -1, unitPrice: 100 }] },
      { ...valid, items: [{ description: 'x', quantity: 1, unitPrice: -1 }] },
      { ...valid, customerEmail: 'bad' },
      { ...valid, number: '' },
    ]) {
      const before = structuredClone(getState().examples);
      expect(request('/v1/examples/revenue/invoices', 'post', payload).status).toBe(422);
      expect(getState().examples).toEqual(before);
    }
  });

  it('combines search, sort and pagination', () => {
    const response = request('/v1/examples/revenue/invoices', 'get', undefined, {
      search: 'inv',
      status: 'sent',
      sort_by: 'total',
      sort_order: 'asc',
      page: 1,
      items_per_page: 1,
    });
    expect(response.data).toMatchObject({
      total_count: 1,
      page: 1,
      items_per_page: 1,
      has_more: false,
    });
    expect((response.data as { data: { id: string }[] }).data.map((item) => item.id)).toEqual([
      'invoice-1002',
    ]);
  });

  it('updates without losing fields, sends draft once and records sentAt', () => {
    expect(
      request('/v1/examples/revenue/invoices/invoice-1001', 'patch', { label: 'Changed' }).data,
    ).toMatchObject({ label: 'Changed', customer: 'Acme Corp', total: 125000 });
    expect(getState().examples.auditLogs[0]).toMatchObject({
      action: 'invoice.updated',
      resourceId: 'invoice-1001',
    });
    const sent = request('/v1/examples/revenue/invoices/invoice-1001/send', 'post');
    expect(sent.data).toMatchObject({ status: 'sent', sentAt: expect.any(String) });
    expect(getState().examples.auditLogs[0]).toMatchObject({
      action: 'invoice.sent',
      resourceId: 'invoice-1001',
      metadata: { invoiceNumber: 'INV-1001', totalCents: 125000 },
    });
    expect(request('/v1/examples/revenue/invoices/invoice-1001/send', 'post').status).toBe(422);
  });

  it('deletes exactly requested unique IDs and reports missing IDs', () => {
    expect(
      request('/v1/examples/revenue/invoices/bulk-delete', 'post', {
        ids: ['invoice-1001', 'invoice-1001'],
      }).data,
    ).toEqual({ deleted: ['invoice-1001'] });
    expect(getState().examples.invoices.map((item) => item.id)).toEqual(['invoice-1002']);
    const before = structuredClone(getState().examples);
    expect(
      request('/v1/examples/revenue/invoices/bulk-delete', 'post', { ids: ['missing'] }).status,
    ).toBe(404);
    expect(getState().examples).toEqual(before);
    expect(getState().examples.auditLogs.some((item) => item.action === 'invoice.deleted')).toBe(
      true,
    );
  });

  it('returns 401, 403 and 404 consistently', () => {
    expect(request('/v1/examples/revenue/invoices', 'get', undefined, undefined, {}).status).toBe(
      401,
    );
    expect(request('/v1/examples/revenue/invoices/missing').status).toBe(404);
    expect(request('/v1/examples/invoices').status).toBe(404);

    for (const [method, url, payload] of [
      ['post', '/v1/examples/revenue/invoices', valid],
      ['patch', '/v1/examples/revenue/invoices/invoice-1001', { label: 'Blocked' }],
      ['post', '/v1/examples/revenue/invoices/invoice-1001/send', undefined],
      ['delete', '/v1/examples/revenue/invoices/invoice-1001', undefined],
      ['post', '/v1/examples/revenue/invoices/bulk-delete', { ids: ['invoice-1001'] }],
    ] as const) {
      const before = structuredClone(getState().examples);
      expect(
        request(url, method, payload, undefined, {
          Authorization: 'Bearer mock-token-user-viewer',
        }).status,
      ).toBe(403);
      expect(getState().examples).toEqual(before);
    }
  });
});
