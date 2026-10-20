import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Customer, SupportTicket } from '#/domain';

import TicketsPage from './index';

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

const ticket = {
  id: 'ticket-real',
  customerId: 'customer-acme',
  subject: 'Payment retry is not reflected',
  requesterEmail: 'marina@acme.test',
  priority: 'urgent',
  status: 'open',
  assignee: 'Beatriz Silva',
  slaDueAt: '2026-09-29T12:00:00.000Z',
  createdAt: '2026-09-25T12:00:00.000Z',
  updatedAt: '2026-09-25T12:00:00.000Z',
  description: 'The payment retry completed but the workspace remains blocked.',
} satisfies SupportTicket;

const mocks = vi.hoisted(() => ({
  getTickets: vi.fn(),
  createTicket: vi.fn(),
  updateTicket: vi.fn(),
  changeTicketStatus: vi.fn(),
  reopenTicket: vi.fn(),
  deleteTicket: vi.fn(),
  getCustomers: vi.fn(),
  permission: { canCreate: true, canUpdate: true, canDelete: true },
}));

vi.mock('@/api/services/domains/ticketService', () => ({ default: mocks }));
vi.mock('@/api/services/domains/customerService', () => ({
  default: { getCustomers: mocks.getCustomers },
}));
vi.mock('@/hooks/permissions/use-has-required-permission', () => ({
  useHasRequiredPermission: () => mocks.permission,
}));
vi.mock('@/router/hooks', () => ({
  useMatchRouteMeta: () => ({ label: 'app.menu.tickets' }),
}));

const renderPage = (route = '/support/tickets') =>
  render(
    <MemoryRouter initialEntries={[route]}>
      <QueryClientProvider
        client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
      >
        <TicketsPage />
      </QueryClientProvider>
    </MemoryRouter>,
  );

describe('Support tickets page', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date('2026-09-30T12:00:00.000Z'));
    vi.clearAllMocks();
    Object.assign(mocks.permission, { canCreate: true, canUpdate: true, canDelete: true });
    mocks.getTickets.mockResolvedValue({
      data: [ticket],
      total_count: 1,
      page: 1,
      items_per_page: 10,
      has_more: false,
      counts: { all: 5, open: 2, in_progress: 1, waiting: 1, resolved: 1, overdue: 1 },
    });
    mocks.getCustomers.mockResolvedValue({
      data: [customer],
      total_count: 1,
      page: 1,
      items_per_page: 100,
      has_more: false,
    });
    mocks.createTicket.mockResolvedValue(ticket);
    mocks.updateTicket.mockResolvedValue(ticket);
    mocks.changeTicketStatus.mockResolvedValue({ ...ticket, status: 'in_progress' });
    mocks.reopenTicket.mockResolvedValue({ ...ticket, status: 'open' });
    mocks.deleteTicket.mockResolvedValue({ deleted: [ticket.id] });
  });
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('renders the same ticket ID and actions in table, grid and list with textual overdue state', async () => {
    const view = renderPage();
    expect(await screen.findByText('Payment retry is not reflected')).toBeInTheDocument();
    expect(
      within(screen.getByRole('row', { name: /Payment retry is not reflected/ })).getByText(
        'Overdue',
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'View Payment retry is not reflected' }),
    ).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: 'Card grid view' }));
    await waitFor(() =>
      expect(view.container.querySelector('[data-ticket-id="ticket-real"]')).toBeInTheDocument(),
    );
    expect(
      screen.getByRole('button', { name: 'Edit Payment retry is not reflected' }),
    ).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'List view' }));
    await waitFor(() =>
      expect(view.container.querySelector('[data-view-mode="list"]')).toBeInTheDocument(),
    );
    expect(
      screen.getByRole('button', { name: 'Start Payment retry is not reflected' }),
    ).toBeVisible();
  });

  it('passes search, status and priority filters', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderPage('/support/tickets?view=list');
    await screen.findByText('Payment retry is not reflected');
    await user.type(screen.getByRole('searchbox', { name: 'Search' }), 'payment');
    await user.click(screen.getByRole('combobox', { name: 'Status' }));
    await user.click(await screen.findByRole('option', { name: 'Open' }));
    await user.click(screen.getByRole('combobox', { name: 'Priority' }));
    await user.click(await screen.findByRole('option', { name: 'Urgent' }));
    await user.click(screen.getByRole('button', { name: 'Search' }));
    await waitFor(() =>
      expect(mocks.getTickets).toHaveBeenLastCalledWith(
        expect.objectContaining({
          search: 'payment',
          status: 'open',
          priority: 'urgent',
          page: 1,
        }),
      ),
    );
  });

  it('creates and edits validated ticket payloads through RHF dialogs', async () => {
    renderPage();
    await screen.findByText('Payment retry is not reflected');
    fireEvent.click(screen.getByRole('button', { name: 'New ticket' }));
    const createDialog = await screen.findByRole('dialog', { name: 'New ticket' });
    fireEvent.change(within(createDialog).getByLabelText('Subject'), {
      target: { value: 'Export is taking too long' },
    });
    fireEvent.change(within(createDialog).getByLabelText('Requester'), {
      target: { value: 'marina@acme.test' },
    });
    fireEvent.change(within(createDialog).getByLabelText('Assignee'), {
      target: { value: 'Carlos Nunes' },
    });
    fireEvent.change(within(createDialog).getByLabelText('SLA due'), {
      target: { value: '2026-10-02T12:00' },
    });
    fireEvent.change(within(createDialog).getByLabelText('Description'), {
      target: { value: 'The billing export has remained pending for twenty minutes.' },
    });
    fireEvent.click(within(createDialog).getByRole('button', { name: 'Save' }));
    await waitFor(() =>
      expect(mocks.createTicket).toHaveBeenCalledWith(
        expect.objectContaining({
          customerId: 'customer-acme',
          subject: 'Export is taking too long',
          status: 'open',
          priority: 'medium',
          assignee: 'Carlos Nunes',
        }),
      ),
    );

    fireEvent.click(screen.getByRole('button', { name: 'Edit Payment retry is not reflected' }));
    const editDialog = await screen.findByRole('dialog', { name: 'Edit ticket' });
    fireEvent.change(within(editDialog).getByLabelText('Assignee'), {
      target: { value: 'Carlos Nunes' },
    });
    fireEvent.click(within(editDialog).getByRole('button', { name: 'Save' }));
    await waitFor(() =>
      expect(mocks.updateTicket).toHaveBeenCalledWith(
        'ticket-real',
        expect.objectContaining({ assignee: 'Carlos Nunes' }),
      ),
    );
  });

  it('opens details and executes an allowed status transition with the real ID', async () => {
    renderPage();
    await screen.findByText('Payment retry is not reflected');
    fireEvent.click(screen.getByRole('button', { name: 'View Payment retry is not reflected' }));
    const dialog = await screen.findByRole('dialog', { name: 'Ticket details' });
    expect(
      within(dialog).getByText('The payment retry completed but the workspace remains blocked.'),
    ).toBeVisible();
    expect(within(dialog).getByText('marina@acme.test')).toBeVisible();
    fireEvent.click(within(dialog).getAllByRole('button', { name: 'Close' })[0]);
    fireEvent.click(screen.getByRole('button', { name: 'Start Payment retry is not reflected' }));
    await waitFor(() =>
      expect(mocks.changeTicketStatus).toHaveBeenCalledWith('ticket-real', 'in_progress'),
    );
  });

  it('keeps read/detail/view controls and removes all mutations for a viewer', async () => {
    Object.assign(mocks.permission, { canCreate: false, canUpdate: false, canDelete: false });
    renderPage();
    await screen.findByText('Payment retry is not reflected');
    expect(
      screen.getByRole('button', { name: 'View Payment retry is not reflected' }),
    ).toBeVisible();
    expect(screen.getByRole('button', { name: 'Card grid view' })).toBeVisible();
    expect(screen.queryByRole('button', { name: 'New ticket' })).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Edit Payment retry is not reflected' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Start Payment retry is not reflected' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Delete Payment retry is not reflected' }),
    ).not.toBeInTheDocument();
  });
});
