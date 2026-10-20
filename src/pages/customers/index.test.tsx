import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Customer } from '#/domain';

import CustomersPage from './index';

const customer = {
  id: 'customer-acme',
  name: 'Acme Corp',
  contactName: 'Marina Costa',
  email: 'marina@acme.test',
  industry: 'Technology',
  source: 'organic',
  status: 'active',
  plan: 'starter',
  mrrCents: 12900,
  healthScore: 92,
  seatsUsed: 4,
  seatsLimit: 5,
  createdAt: '2026-01-05T10:00:00.000Z',
  updatedAt: '2026-09-20T14:30:00.000Z',
} satisfies Customer;

const mocks = vi.hoisted(() => ({
  getCustomers: vi.fn(),
  createCustomer: vi.fn(),
  updateCustomer: vi.fn(),
  archiveCustomer: vi.fn(),
  permission: { canCreate: true, canUpdate: true, canDelete: true },
}));

vi.mock('@/api/services/domains/customerService', () => ({ default: mocks }));
vi.mock('@/hooks/permissions/use-has-required-permission', () => ({
  useHasRequiredPermission: () => mocks.permission,
}));
vi.mock('@/router/hooks', () => ({
  useMatchRouteMeta: () => ({ label: 'app.menu.customers' }),
}));

const renderPage = (route = '/customers') =>
  render(
    <MemoryRouter initialEntries={[route]}>
      <QueryClientProvider
        client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
      >
        <CustomersPage />
      </QueryClientProvider>
    </MemoryRouter>,
  );

describe('Customers page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(mocks.permission, { canCreate: true, canUpdate: true, canDelete: true });
    mocks.getCustomers.mockResolvedValue({
      data: [customer],
      total_count: 1,
      page: 1,
      items_per_page: 10,
      has_more: false,
    });
    mocks.createCustomer.mockResolvedValue(customer);
    mocks.updateCustomer.mockResolvedValue(customer);
    mocks.archiveCustomer.mockResolvedValue({ ...customer, status: 'churned' });
  });
  afterEach(cleanup);

  it('keeps the same record and authorized actions in table, card and list modes', async () => {
    const view = renderPage('/customers?status=active');
    expect(await screen.findByText('Acme Corp')).toBeInTheDocument();
    expect(view.container.querySelector('[data-view-mode="table"]')).toBeInTheDocument();
    for (const action of ['View Acme Corp', 'Edit Acme Corp', 'Archive Acme Corp']) {
      expect(screen.getByRole('button', { name: action })).toBeInTheDocument();
    }

    fireEvent.click(screen.getByRole('button', { name: 'Card grid view' }));
    await waitFor(() =>
      expect(view.container.querySelector('[data-view-mode="grid"]')).toBeInTheDocument(),
    );
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit Acme Corp' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'List view' }));
    await waitFor(() =>
      expect(view.container.querySelector('[data-view-mode="list"]')).toBeInTheDocument(),
    );
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Archive Acme Corp' }));
    const dialog = await screen.findByRole('alertdialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Archive' }));
    await waitFor(() => expect(mocks.archiveCustomer).toHaveBeenCalledWith('customer-acme'));
  });

  it('passes search and domain filters to the shared query while preserving the view parameter', async () => {
    const user = userEvent.setup();
    renderPage('/customers?view=grid&campaign=fall');
    await screen.findByText('Acme Corp');
    await user.type(screen.getByRole('searchbox', { name: 'Search' }), 'acme');
    await user.click(screen.getByRole('combobox', { name: 'Status' }));
    await user.click(await screen.findByRole('option', { name: 'Active' }));
    await user.click(screen.getByRole('combobox', { name: 'Plan' }));
    await user.click(await screen.findByRole('option', { name: 'Starter' }));
    await user.click(screen.getByRole('button', { name: 'Search' }));
    await waitFor(() =>
      expect(mocks.getCustomers).toHaveBeenLastCalledWith(
        expect.objectContaining({ search: 'acme', status: 'active', plan: 'starter', page: 1 }),
      ),
    );
  });

  it('shows complete customer detail and submits a RHF/Zod create dialog', async () => {
    renderPage();
    await screen.findByText('Acme Corp');
    fireEvent.click(screen.getByRole('button', { name: 'View Acme Corp' }));
    const details = await screen.findByRole('dialog', { name: 'Customer details' });
    expect(within(details).getByText('marina@acme.test')).toBeInTheDocument();
    expect(within(details).getByText('92/100')).toBeInTheDocument();
    fireEvent.click(within(details).getAllByRole('button', { name: 'Close' })[0]);

    fireEvent.click(screen.getByRole('button', { name: 'New customer' }));
    const dialog = await screen.findByRole('dialog', { name: 'New customer' });
    fireEvent.change(within(dialog).getByLabelText('Name'), { target: { value: 'Atlas' } });
    fireEvent.change(within(dialog).getByLabelText('Contact'), {
      target: { value: 'Renata Melo' },
    });
    fireEvent.change(within(dialog).getByLabelText('Email'), {
      target: { value: 'renata@atlas.test' },
    });
    fireEvent.change(within(dialog).getByLabelText('Industry'), {
      target: { value: 'Operations' },
    });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Save' }));
    await waitFor(() =>
      expect(mocks.createCustomer).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Atlas',
          contactName: 'Renata Melo',
          email: 'renata@atlas.test',
          industry: 'Operations',
          mrrCents: expect.any(Number),
          healthScore: expect.any(Number),
        }),
      ),
    );
  });

  it('removes all mutation controls for a viewer while retaining details and three views', async () => {
    Object.assign(mocks.permission, { canCreate: false, canUpdate: false, canDelete: false });
    renderPage();
    await screen.findByText('Acme Corp');
    expect(screen.queryByRole('button', { name: 'New customer' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Edit Acme Corp' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Archive Acme Corp' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'View Acme Corp' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Card grid view' })).toBeInTheDocument();
  });
});
