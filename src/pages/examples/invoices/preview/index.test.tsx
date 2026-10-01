import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { Invoice } from '#/examples';

import InvoicePreviewPage from './index';

const invoice = {
  id: 'invoice-real',
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
  number: 'INV-1001',
  label: 'Persisted implementation',
  issueDate: '2026-01-01',
  dueDate: '2026-01-31',
  customer: 'Acme Corp',
  customerEmail: 'billing@acme.test',
  billing: 'Acme Corp\nTax ID 123',
  currency: 'BRL',
  paymentMethod: 'Bank transfer',
  notes: 'Persisted note',
  items: [
    {
      id: 'line-real',
      description: 'Implementation',
      quantity: 2,
      unitPrice: 50000,
      lineTotal: 100000,
    },
  ],
  taxRateBps: 2000,
  discountRateBps: 0,
  shippingAmount: 5000,
  subtotal: 100000,
  taxAmount: 20000,
  discountAmount: 0,
  total: 125000,
  status: 'draft',
} satisfies Invoice;

const mocks = vi.hoisted(() => ({
  getInvoice: vi.fn(),
  sendInvoice: vi.fn(),
  permission: { canRead: true, canUpdate: true, canExport: true },
  success: vi.fn(),
  error: vi.fn(),
  push: vi.fn(),
}));

vi.mock('@/api/services/examples/invoiceService', () => ({
  default: { getInvoice: mocks.getInvoice, sendInvoice: mocks.sendInvoice },
}));
vi.mock('@/hooks/permissions/use-has-required-permission', () => ({
  useHasRequiredPermission: () => mocks.permission,
}));
vi.mock('@/lib/toast', () => ({ appToast: { success: mocks.success, error: mocks.error } }));
vi.mock('@/router/hooks', () => ({
  useMatchRouteMeta: () => ({ label: 'examples.invoices.preview' }),
  useRouter: () => ({ push: mocks.push }),
}));
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useParams: () => ({ id: 'invoice-real' }) };
});

function renderPage() {
  return render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      <InvoicePreviewPage />
    </QueryClientProvider>,
  );
}

describe('Invoice preview page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.permission.canRead = true;
    mocks.permission.canUpdate = true;
    mocks.permission.canExport = true;
    mocks.getInvoice.mockResolvedValue(invoice);
    mocks.sendInvoice.mockResolvedValue({
      ...invoice,
      status: 'sent',
      sentAt: '2026-01-02T12:00:00.000Z',
    });
    vi.spyOn(window, 'print').mockImplementation(() => undefined);
  });
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('renders persisted invoice data, items and domain totals', async () => {
    renderPage();
    expect(await screen.findByText('Persisted implementation')).toBeInTheDocument();
    expect(screen.getByText('billing@acme.test')).toBeInTheDocument();
    expect(screen.getByText('Implementation')).toBeInTheDocument();
    expect(screen.getByTestId('preview-subtotal')).toHaveTextContent('1,000.00');
    expect(screen.getByTestId('preview-tax')).toHaveTextContent('200.00');
    expect(screen.getByTestId('preview-total')).toHaveTextContent('1,250.00');
  });

  it('sends a draft once, updates its persisted status and shows a toast', async () => {
    renderPage();
    fireEvent.click(await screen.findByRole('button', { name: 'Send invoice' }));
    await waitFor(() => expect(mocks.sendInvoice).toHaveBeenCalledWith('invoice-real'));
    expect(await screen.findByText('sent')).toBeInTheDocument();
    expect(screen.getByText(/Jan 2, 2026/)).toBeInTheDocument();
    expect(mocks.success).toHaveBeenCalledWith('Invoice sent');
    expect(screen.getByRole('button', { name: 'Send invoice' })).toBeDisabled();
  });

  it('opens browser printing and exposes no fake PDF download', async () => {
    renderPage();
    fireEvent.click(await screen.findByRole('button', { name: 'Print invoice' }));
    expect(window.print).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('button', { name: /pdf/i })).not.toBeInTheDocument();
    expect(screen.getByTestId('invoice-print-sheet')).toHaveClass('invoice-print-sheet');
  });

  it('keeps send disabled for a viewer while allowing read and print', async () => {
    mocks.permission.canUpdate = false;
    renderPage();
    expect(await screen.findByText('INV-1001')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send invoice' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Print invoice' })).toBeEnabled();
  });
});
