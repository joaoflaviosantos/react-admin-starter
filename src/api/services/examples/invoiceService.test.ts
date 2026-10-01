import { beforeEach, describe, expect, it } from 'vitest';

import { resetToSeed } from '@/api/mock/store';
import { setItem } from '@/utils/storage';
import { StorageEnum } from '#/enum';

import invoiceService from './invoiceService';

describe('Invoice service', () => {
  beforeEach(() => {
    resetToSeed();
    localStorage.clear();
    setItem(StorageEnum.Token, { access_token: 'mock-token-user-admin', token_type: 'bearer' });
  });

  it('lists, creates, reads, updates, sends and bulk deletes invoices', async () => {
    expect(
      (await invoiceService.getInvoices({ search: 'acme', status: 'draft' })).data[0]?.id,
    ).toBe('invoice-1001');
    const created = await invoiceService.createInvoice({
      number: 'INV-2000',
      label: 'Consulting',
      issueDate: '2026-02-01',
      dueDate: '2026-02-28',
      customer: 'Grace Inc',
      customerEmail: 'billing@grace.test',
      billing: 'Grace Inc',
      currency: 'BRL',
      paymentMethod: 'Bank transfer',
      notes: '',
      taxRateBps: 1250,
      discountRateBps: 500,
      shippingAmount: 100,
      items: [{ description: 'Consulting', quantity: 3, unitPrice: 333 }],
    });
    expect(created).toMatchObject({
      subtotal: 999,
      taxAmount: 125,
      discountAmount: 50,
      total: 1174,
      status: 'draft',
    });
    expect(await invoiceService.getInvoice(created.id)).toMatchObject({ number: 'INV-2000' });
    expect(await invoiceService.updateInvoice(created.id, { label: 'Updated' })).toMatchObject({
      label: 'Updated',
      total: 1174,
    });
    expect(await invoiceService.sendInvoice(created.id)).toMatchObject({
      status: 'sent',
      sentAt: expect.any(String),
    });
    expect(await invoiceService.deleteInvoices([created.id, 'invoice-1001'])).toEqual({
      deleted: [created.id, 'invoice-1001'],
    });
  });
});
