import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Invoice } from '#/domain';

import InvoiceListPage from './index';

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
  billing: 'Acme',
  currency: 'BRL',
  paymentMethod: 'Transfer',
  notes: '',
  items: [{ id: 'line-1', description: 'Work', quantity: 1, unitPrice: 10000, lineTotal: 10000 }],
  taxRateBps: 0,
  discountRateBps: 0,
  shippingAmount: 0,
  subtotal: 10000,
  taxAmount: 0,
  discountAmount: 0,
  total: 10000,
  status: 'draft',
} satisfies Invoice;

const mocks = vi.hoisted(() => ({
  getInvoices: vi.fn(),
  deleteInvoices: vi.fn(),
  sendInvoice: vi.fn(),
  permission: {
    canCreate: true,
    canRead: true,
    canUpdate: true,
    canDelete: true,
    canExport: true,
  },
  push: vi.fn(),
}));
vi.mock('@/api/services/domains/invoiceService', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api/services/domains/invoiceService')>();
  return { default: mocks, calculateInvoiceTotals: actual.calculateInvoiceTotals };
});
vi.mock('@/hooks/permissions/use-has-required-permission', () => ({
  useHasRequiredPermission: () => mocks.permission,
}));
vi.mock('@/router/hooks', () => ({
  useMatchRouteMeta: () => ({ label: 'app.menu.invoices' }),
  useRouter: () => ({ push: mocks.push }),
}));

const renderPage = (route = '/revenue/invoices') =>
  render(
    <MemoryRouter initialEntries={[route]}>
      <QueryClientProvider
        client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
      >
        <InvoiceListPage />
      </QueryClientProvider>
    </MemoryRouter>,
  );

describe('Invoice list page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(mocks.permission, {
      canCreate: true,
      canRead: true,
      canUpdate: true,
      canDelete: true,
      canExport: true,
    });
    mocks.getInvoices.mockResolvedValue({
      data: [invoice],
      total_count: 1,
      page: 1,
      items_per_page: 10,
      has_more: false,
    });
    mocks.deleteInvoices.mockResolvedValue({ deleted: [invoice.id] });
    mocks.sendInvoice.mockResolvedValue({
      ...invoice,
      status: 'sent',
      sentAt: '2026-01-02T12:00:00.000Z',
    });
  });
  afterEach(cleanup);

  it('passes search, status, sort and pagination to the canonical revenue query', async () => {
    const user = userEvent.setup();
    renderPage();
    expect(await screen.findByText('INV-1')).toBeInTheDocument();
    await user.type(screen.getByRole('searchbox', { name: 'Search' }), 'Acme');
    await user.click(screen.getByRole('combobox', { name: 'Status' }));
    await user.click(await screen.findByRole('option', { name: 'draft' }));
    await user.click(screen.getByRole('combobox', { name: 'Sort invoices' }));
    await user.click(await screen.findByRole('option', { name: 'Lowest total first' }));
    await user.click(screen.getByRole('button', { name: 'Search' }));
    await waitFor(() =>
      expect(mocks.getInvoices).toHaveBeenLastCalledWith(
        expect.objectContaining({
          search: 'Acme',
          status: 'draft',
          sort_by: 'total',
          sort_order: 'asc',
          page: 1,
        }),
      ),
    );
  });

  it('renders the same ID and actions in table, grid and list using modals', async () => {
    const view = renderPage();
    await screen.findByText('INV-1');
    expect(screen.getByRole('button', { name: 'Preview INV-1' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Card grid view' }));
    await waitFor(() =>
      expect(view.container.querySelector('[data-view-mode="grid"]')).toBeInTheDocument(),
    );
    expect(view.container.querySelector('[data-invoice-id="invoice-real"]')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Preview INV-1' }));
    const detail = await screen.findByRole('dialog', { name: 'Invoice details' });
    expect(within(detail).queryByRole('button', { name: 'Print invoice' })).not.toBeInTheDocument();
    fireEvent.click(within(detail).getAllByRole('button', { name: 'Close' })[0]!);

    fireEvent.click(screen.getByRole('button', { name: 'List view' }));
    await waitFor(() =>
      expect(view.container.querySelector('[data-view-mode="list"]')).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Edit INV-1' }));
    const edit = await screen.findByRole('dialog', { name: 'Edit invoice' });
    fireEvent.click(within(edit).getByRole('button', { name: 'Cancel' }));
    fireEvent.click(screen.getByRole('button', { name: 'New invoice' }));
    expect(await screen.findByRole('dialog', { name: 'New invoice' })).toBeInTheDocument();
  });

  it('previews and prints the invoice document from the row actions', async () => {
    const print = vi.spyOn(window, 'print').mockImplementation(() => {
      expect(screen.getByTestId('invoice-print-sheet')).toBeInTheDocument();
    });
    renderPage();
    await screen.findByText('INV-1');

    fireEvent.click(screen.getByRole('button', { name: 'Print invoice' }));
    const preview = await screen.findByRole('dialog', { name: 'Invoice preview' });
    expect(within(preview).getByTestId('invoice-print-sheet')).toBeInTheDocument();
    fireEvent.click(within(preview).getByRole('button', { name: 'Print' }));
    await waitFor(() => expect(print).toHaveBeenCalledTimes(1));
    fireEvent.click(within(preview).getAllByRole('button', { name: 'Close' })[0]!);

    fireEvent.click(screen.getByRole('button', { name: 'Send invoice' }));
    await waitFor(() => expect(mocks.sendInvoice).toHaveBeenCalledWith('invoice-real'));
    print.mockRestore();
  });

  it('preserves selection across modes and deletes exactly the selected ID after confirmation', async () => {
    renderPage('/revenue/invoices?view=grid&status=draft');
    const checkbox = await screen.findByRole('checkbox', { name: 'Select INV-1' });
    fireEvent.click(checkbox);
    fireEvent.click(screen.getByRole('button', { name: 'List view' }));
    await waitFor(() =>
      expect(screen.getByRole('checkbox', { name: 'Select INV-1' })).toBeChecked(),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Delete selected' }));
    const alert = await screen.findByRole('dialog');
    fireEvent.click(within(alert).getByRole('button', { name: 'Delete' }));
    await waitFor(() => expect(mocks.deleteInvoices.mock.calls[0]?.[0]).toEqual(['invoice-real']));
  });

  it('keeps preview and view switching while removing every mutating control for viewers', async () => {
    Object.assign(mocks.permission, { canCreate: false, canUpdate: false, canDelete: false });
    renderPage();
    await screen.findByText('INV-1');
    expect(screen.getByRole('button', { name: 'Preview INV-1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Print invoice' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Send invoice' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Card grid view' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'New invoice' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Edit INV-1' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Delete INV-1' })).not.toBeInTheDocument();
    expect(screen.queryByRole('checkbox', { name: 'Select INV-1' })).not.toBeInTheDocument();
  });
});
