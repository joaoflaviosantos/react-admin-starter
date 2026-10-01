import { describe, expect, it } from 'vitest';

import { invoiceSchema } from './schema';

const valid = {
  number: 'INV-1',
  label: 'Work',
  issueDate: '2026-02-01',
  dueDate: '2026-02-28',
  customer: 'Acme',
  customerEmail: 'billing@acme.test',
  billing: 'Acme',
  currency: 'BRL',
  paymentMethod: 'Transfer',
  notes: '',
  taxRateBps: 0,
  discountRateBps: 0,
  shippingAmount: 0,
  items: [{ description: 'Work', quantity: 1, unitPrice: 100 }],
};

describe('invoiceSchema', () => {
  it('accepts a complete invoice and blocks invalid date order', () => {
    expect(invoiceSchema.safeParse(valid).success).toBe(true);
    expect(invoiceSchema.safeParse({ ...valid, dueDate: '2026-01-31' }).success).toBe(false);
  });

  it('requires valid customer email and at least one non-negative item', () => {
    expect(invoiceSchema.safeParse({ ...valid, customerEmail: 'bad' }).success).toBe(false);
    expect(invoiceSchema.safeParse({ ...valid, items: [] }).success).toBe(false);
    expect(
      invoiceSchema.safeParse({
        ...valid,
        items: [{ description: 'x', quantity: -1, unitPrice: 1 }],
      }).success,
    ).toBe(false);
  });
});
