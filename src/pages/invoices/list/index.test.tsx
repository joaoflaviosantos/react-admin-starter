import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
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
  permission: {
    canCreate: true,
    canRead: true,
    canUpdate: true,
    canDelete: true,
    canExport: true,
  },
  push: vi.fn(),
}));
vi.mock('@/api/services/domains/invoiceService', () => ({ default: mocks }));
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
  });
  afterEach(cleanup);

  it('passes search, status, sort and pagination to the canonical revenue query', async () => {
    renderPage();
    expect(await screen.findByText('INV-1')).toBeInTheDocument();
    fireEvent.change(screen.getByRole('searchbox', { name: 'Search invoices' }), {
      target: { value: 'Acme' },
    });
    fireEvent.change(screen.getByRole('combobox', { name: 'Status' }), {
      target: { value: 'draft' },
    });
    fireEvent.change(screen.getByRole('combobox', { name: 'Sort invoices' }), {
      target: { value: 'total:asc' },
    });
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

  it('renders the same ID and actions in table, grid and list with canonical links', async () => {
    const view = renderPage();
    await screen.findByText('INV-1');
    expect(screen.getByRole('button', { name: 'Preview INV-1' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Card grid view' }));
    await waitFor(() =>
      expect(view.container.querySelector('[data-view-mode="grid"]')).toBeInTheDocument(),
    );
    expect(view.container.querySelector('[data-invoice-id="invoice-real"]')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Preview INV-1' }));
    expect(mocks.push).toHaveBeenCalledWith('/revenue/invoices/invoice-real');

    fireEvent.click(screen.getByRole('button', { name: 'List view' }));
    await waitFor(() =>
      expect(view.container.querySelector('[data-view-mode="list"]')).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Edit INV-1' }));
    expect(mocks.push).toHaveBeenCalledWith('/revenue/invoices/invoice-real/edit');
    fireEvent.click(screen.getByRole('button', { name: 'New invoice' }));
    expect(mocks.push).toHaveBeenCalledWith('/revenue/invoices/new');
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
    const alert = await screen.findByRole('alertdialog');
    fireEvent.click(within(alert).getByRole('button', { name: 'Delete' }));
    await waitFor(() => expect(mocks.deleteInvoices.mock.calls[0]?.[0]).toEqual(['invoice-real']));
  });

  it('keeps preview and view switching while removing every mutating control for viewers', async () => {
    Object.assign(mocks.permission, { canCreate: false, canUpdate: false, canDelete: false });
    renderPage();
    await screen.findByText('INV-1');
    expect(screen.getByRole('button', { name: 'Preview INV-1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Card grid view' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'New invoice' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Edit INV-1' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Delete INV-1' })).not.toBeInTheDocument();
    expect(screen.queryByRole('checkbox', { name: 'Select INV-1' })).not.toBeInTheDocument();
  });
});
