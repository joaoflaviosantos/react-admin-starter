import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { Invoice } from '#/examples';

import InvoiceEditorPage from './index';

const invoice = {
  id: 'invoice-real',
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
  number: 'INV-1',
  label: 'Work',
  issueDate: '2026-01-01',
  dueDate: '2026-01-31',
  customer: 'Acme',
  customerEmail: 'billing@acme.test',
  billing: 'Acme billing address',
  currency: 'BRL',
  paymentMethod: 'Transfer',
  notes: 'Original note',
  items: [{ id: 'line-1', description: 'Work', quantity: 1, unitPrice: 10000, lineTotal: 10000 }],
  taxRateBps: 1000,
  discountRateBps: 500,
  shippingAmount: 200,
  subtotal: 10000,
  taxAmount: 1000,
  discountAmount: 500,
  total: 10700,
  status: 'draft',
} satisfies Invoice;

const mocks = vi.hoisted(() => ({
  createInvoice: vi.fn(),
  getInvoice: vi.fn(),
  updateInvoice: vi.fn(),
  invoiceId: undefined as string | undefined,
  push: vi.fn(),
}));

vi.mock('@/api/services/examples/invoiceService', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api/services/examples/invoiceService')>();
  return {
    ...actual,
    default: {
      createInvoice: mocks.createInvoice,
      getInvoice: mocks.getInvoice,
      updateInvoice: mocks.updateInvoice,
    },
  };
});
vi.mock('@/router/hooks', () => ({ useRouter: () => ({ push: mocks.push, back: vi.fn() }) }));
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useParams: () => ({ id: mocks.invoiceId }) };
});

function renderPage() {
  return render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      <InvoiceEditorPage />
    </QueryClientProvider>,
  );
}

function fillRequiredFields() {
  fireEvent.change(screen.getByLabelText('Number'), { target: { value: 'INV-2000' } });
  fireEvent.change(screen.getByLabelText('Label'), { target: { value: 'Consulting' } });
  fireEvent.change(screen.getByLabelText('Issue date'), { target: { value: '2026-02-01' } });
  fireEvent.change(screen.getByLabelText('Due date'), { target: { value: '2026-02-28' } });
  fireEvent.change(screen.getByLabelText('Customer'), { target: { value: 'Grace Inc' } });
  fireEvent.change(screen.getByLabelText('Customer email'), {
    target: { value: 'billing@grace.test' },
  });
  fireEvent.change(screen.getByLabelText('Billing details'), {
    target: { value: 'Grace Inc address' },
  });
  fireEvent.change(screen.getByLabelText('Payment method'), { target: { value: 'Transfer' } });
  fireEvent.change(screen.getByLabelText('Item 1 description'), {
    target: { value: 'Consulting' },
  });
  fireEvent.change(screen.getByLabelText('Item 1 quantity'), { target: { value: '3' } });
  fireEvent.change(screen.getByLabelText('Item 1 unit price'), { target: { value: '333' } });
}

describe('Invoice editor page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.invoiceId = undefined;
    mocks.getInvoice.mockResolvedValue(invoice);
    mocks.createInvoice.mockResolvedValue({ ...invoice, id: 'invoice-created' });
    mocks.updateInvoice.mockResolvedValue(invoice);
  });
  afterEach(cleanup);

  it('blocks invalid required fields, date order and an empty item list', async () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: 'Remove item 1' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save invoice' }));
    expect(await screen.findByText('Number is required.')).toBeInTheDocument();
    expect(screen.getByText('At least one item is required.')).toBeInTheDocument();
    expect(mocks.createInvoice).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Add item' }));
    fillRequiredFields();
    fireEvent.change(screen.getByLabelText('Due date'), { target: { value: '2026-01-31' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save invoice' }));
    expect(await screen.findByText('Due date cannot precede issue date.')).toBeInTheDocument();
    expect(mocks.createInvoice).not.toHaveBeenCalled();
  });

  it('adds dynamic items, recalculates exact totals and persists a draft payload', async () => {
    renderPage();
    fillRequiredFields();
    fireEvent.change(screen.getByLabelText('Tax (basis points)'), { target: { value: '1250' } });
    fireEvent.change(screen.getByLabelText('Discount (basis points)'), {
      target: { value: '500' },
    });
    fireEvent.change(screen.getByLabelText('Shipping (minor units)'), {
      target: { value: '100' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Add item' }));
    fireEvent.change(screen.getByLabelText('Item 2 description'), { target: { value: 'Review' } });
    fireEvent.change(screen.getByLabelText('Item 2 quantity'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('Item 2 unit price'), { target: { value: '1' } });

    expect(screen.getByTestId('invoice-subtotal')).toHaveTextContent('10.00');
    expect(screen.getByTestId('invoice-tax')).toHaveTextContent('1.25');
    expect(screen.getByTestId('invoice-discount')).toHaveTextContent('0.50');
    expect(screen.getByTestId('invoice-total')).toHaveTextContent('11.75');

    fireEvent.click(screen.getByRole('button', { name: 'Save invoice' }));
    await waitFor(() =>
      expect(mocks.createInvoice).toHaveBeenCalledWith(
        expect.objectContaining({
          number: 'INV-2000',
          items: [
            { description: 'Consulting', quantity: 3, unitPrice: 333 },
            { description: 'Review', quantity: 1, unitPrice: 1 },
          ],
          taxRateBps: 1250,
          discountRateBps: 500,
          shippingAmount: 100,
        }),
      ),
    );
    expect(mocks.push).toHaveBeenCalledWith('/examples/revenue/invoices/invoice-created');
  });

  it('loads an existing invoice and persists edits using its real ID', async () => {
    mocks.invoiceId = 'invoice-real';
    renderPage();
    expect(await screen.findByDisplayValue('Original note')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Notes'), { target: { value: 'Updated note' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save invoice' }));
    await waitFor(() =>
      expect(mocks.updateInvoice).toHaveBeenCalledWith(
        'invoice-real',
        expect.objectContaining({ notes: 'Updated note' }),
      ),
    );
  });

  it('keeps entered data after a failed save and prevents duplicate pending submits', async () => {
    let rejectSave!: (reason: Error) => void;
    mocks.createInvoice.mockReturnValue(
      new Promise((_, reject) => {
        rejectSave = reject;
      }),
    );
    renderPage();
    fillRequiredFields();
    const save = screen.getByRole('button', { name: 'Save invoice' });
    fireEvent.click(save);
    await waitFor(() => expect(save).toBeDisabled());
    fireEvent.click(save);
    expect(mocks.createInvoice).toHaveBeenCalledTimes(1);
    rejectSave(new Error('network'));
    await waitFor(() => expect(save).not.toBeDisabled());
    expect(screen.getByLabelText('Customer')).toHaveValue('Grace Inc');
  });
});
