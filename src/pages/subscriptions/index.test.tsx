import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Customer, Subscription } from '#/domain';

import SubscriptionsPage from './index';

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
const subscription = {
  id: 'subscription-acme',
  customerId: 'customer-acme',
  plan: 'starter',
  status: 'active',
  interval: 'monthly',
  seats: 5,
  unitPriceCents: 12900,
  trialEndsAt: null,
  currentPeriodEnd: '2026-10-05T10:00:00.000Z',
  cancelAtPeriodEnd: false,
  createdAt: '2026-01-05T10:00:00.000Z',
  updatedAt: '2026-09-05T10:00:00.000Z',
} satisfies Subscription;

const mocks = vi.hoisted(() => ({
  getSubscriptions: vi.fn(),
  createSubscription: vi.fn(),
  updateSubscription: vi.fn(),
  cancelSubscription: vi.fn(),
  reactivateSubscription: vi.fn(),
  getCustomers: vi.fn(),
  permission: { canCreate: true, canUpdate: true, canDelete: true },
}));

vi.mock('@/api/services/domains/subscriptionService', () => ({ default: mocks }));
vi.mock('@/api/services/domains/customerService', () => ({
  default: { getCustomers: mocks.getCustomers },
}));
vi.mock('@/hooks/permissions/use-has-required-permission', () => ({
  useHasRequiredPermission: () => mocks.permission,
}));
vi.mock('@/router/hooks', () => ({
  useMatchRouteMeta: () => ({ label: 'app.menu.subscriptions' }),
}));

const renderPage = (route = '/revenue/subscriptions') =>
  render(
    <MemoryRouter initialEntries={[route]}>
      <QueryClientProvider
        client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
      >
        <SubscriptionsPage />
      </QueryClientProvider>
    </MemoryRouter>,
  );

describe('Subscriptions page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(mocks.permission, { canCreate: true, canUpdate: true, canDelete: true });
    mocks.getSubscriptions.mockResolvedValue({
      data: [subscription],
      total_count: 1,
      page: 1,
      items_per_page: 10,
      has_more: false,
      counts: { all: 6, active: 3, trialing: 1, past_due: 1, canceled: 1 },
    });
    mocks.getCustomers.mockResolvedValue({
      data: [customer],
      total_count: 1,
      page: 1,
      items_per_page: 100,
      has_more: false,
    });
    mocks.cancelSubscription.mockResolvedValue({
      ...subscription,
      status: 'canceled',
      cancelAtPeriodEnd: true,
    });
    mocks.reactivateSubscription.mockResolvedValue({
      ...subscription,
      status: 'active',
      cancelAtPeriodEnd: false,
    });
    mocks.updateSubscription.mockResolvedValue(subscription);
    mocks.createSubscription.mockResolvedValue(subscription);
  });
  afterEach(cleanup);

  it('renders localized money and identical lifecycle actions in all three modes', async () => {
    const view = renderPage();
    expect(await screen.findByText('Acme Corp')).toBeInTheDocument();
    expect(screen.getByText('R$129.00')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit Acme Corp subscription' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Cancel Acme Corp subscription' }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Card grid view' }));
    await waitFor(() =>
      expect(view.container.querySelector('[data-view-mode="grid"]')).toBeInTheDocument(),
    );
    expect(
      screen.getByRole('button', { name: 'Cancel Acme Corp subscription' }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'List view' }));
    await waitFor(() =>
      expect(view.container.querySelector('[data-view-mode="list"]')).toBeInTheDocument(),
    );
    expect(screen.getByRole('button', { name: 'Edit Acme Corp subscription' })).toBeInTheDocument();
  });

  it('passes plan and status filters and resets pagination', async () => {
    const user = userEvent.setup();
    renderPage('/revenue/subscriptions?view=list');
    await screen.findByText('Acme Corp');
    await user.click(screen.getByRole('combobox', { name: 'Plan' }));
    await user.click(await screen.findByRole('option', { name: 'Starter' }));
    await user.click(screen.getByRole('combobox', { name: 'Status' }));
    await user.click(await screen.findByRole('option', { name: 'Active' }));
    await user.click(screen.getByRole('button', { name: 'Search' }));
    await waitFor(() =>
      expect(mocks.getSubscriptions).toHaveBeenLastCalledWith(
        expect.objectContaining({
          plan: 'starter',
          status: 'active',
          page: 1,
        }),
      ),
    );
  });

  it('uses contextual confirmation before canceling and reactivating', async () => {
    const view = renderPage();
    await screen.findByText('Acme Corp');
    fireEvent.click(screen.getByRole('button', { name: 'Cancel Acme Corp subscription' }));
    const cancelDialog = await screen.findByRole('dialog');
    fireEvent.click(within(cancelDialog).getByRole('button', { name: 'Cancel subscription' }));
    await waitFor(() => expect(mocks.cancelSubscription).toHaveBeenCalledWith('subscription-acme'));

    mocks.getSubscriptions.mockResolvedValue({
      data: [{ ...subscription, status: 'canceled', cancelAtPeriodEnd: true }],
      total_count: 1,
      page: 1,
      items_per_page: 10,
      has_more: false,
      counts: { all: 6, active: 3, trialing: 1, past_due: 1, canceled: 1 },
    });
    view.unmount();
    renderPage();
    const reactivate = await screen.findByRole('button', {
      name: 'Reactivate Acme Corp subscription',
    });
    fireEvent.click(reactivate);
    const reactivateDialog = await screen.findByRole('dialog');
    fireEvent.click(within(reactivateDialog).getByRole('button', { name: 'Reactivate' }));
    await waitFor(() =>
      expect(mocks.reactivateSubscription).toHaveBeenCalledWith('subscription-acme'),
    );
  });

  it('submits edited subscription values through the RHF/Zod dialog', async () => {
    renderPage();
    await screen.findByText('Acme Corp');
    fireEvent.click(screen.getByRole('button', { name: 'Edit Acme Corp subscription' }));
    const dialog = await screen.findByRole('dialog', { name: 'Edit subscription' });
    fireEvent.change(within(dialog).getByLabelText('Seats'), { target: { value: '8' } });
    fireEvent.change(within(dialog).getByLabelText('Unit price (minor units)'), {
      target: { value: '25900' },
    });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Save' }));

    await waitFor(() =>
      expect(mocks.updateSubscription).toHaveBeenCalledWith(
        'subscription-acme',
        expect.objectContaining({
          customerId: 'customer-acme',
          seats: 8,
          unitPriceCents: 25900,
          status: 'active',
        }),
      ),
    );
  });

  it('removes create, edit and lifecycle controls for a viewer', async () => {
    Object.assign(mocks.permission, { canCreate: false, canUpdate: false, canDelete: false });
    renderPage();
    await screen.findByText('Acme Corp');
    expect(screen.queryByRole('button', { name: 'New subscription' })).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Edit Acme Corp subscription' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Cancel Acme Corp subscription' }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Card grid view' })).toBeInTheDocument();
  });
});
