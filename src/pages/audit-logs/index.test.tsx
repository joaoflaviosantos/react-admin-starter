import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuditLog } from '#/domain';

import AuditLogsPage from './index';

const event = {
  id: 'audit-1001',
  actorName: 'João Admin',
  actorEmail: 'admin@example.com',
  action: 'customer.updated',
  resourceType: 'customer',
  resourceId: 'customer-vertex',
  summary: 'Updated the health score for Vertex Finance',
  ipAddress: '203.0.113.10',
  userAgent: 'Mozilla/5.0',
  createdAt: '2026-09-30T12:00:00.000Z',
  metadata: { healthScore: 36 },
} satisfies AuditLog;
const mocks = vi.hoisted(() => ({ getAuditLogs: vi.fn() }));
vi.mock('@/api/services/domains/auditLogService', () => ({ default: mocks }));
vi.mock('@/hooks/permissions/use-has-required-permission', () => ({
  useHasRequiredPermission: () => ({ canCreate: false, canUpdate: false, canDelete: false }),
}));
vi.mock('@/router/hooks', () => ({
  useMatchRouteMeta: () => ({ label: 'app.menu.auditLogs' }),
}));

const renderPage = (route = '/platform/audit-logs') =>
  render(
    <MemoryRouter initialEntries={[route]}>
      <QueryClientProvider
        client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
      >
        <AuditLogsPage />
      </QueryClientProvider>
    </MemoryRouter>,
  );

describe('Audit logs page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAuditLogs.mockResolvedValue({
      data: [event],
      total_count: 1,
      page: 1,
      items_per_page: 10,
      has_more: false,
    });
  });
  afterEach(cleanup);

  it('shows the same event in all three read-only modes and applies filters', async () => {
    const user = userEvent.setup();
    const view = renderPage('/platform/audit-logs?view=grid&tenant=demo');
    expect(await screen.findByText(event.summary)).toBeInTheDocument();
    expect(screen.getByText('Customer updated')).toBeInTheDocument();
    expect(screen.getByText('Customer')).toBeInTheDocument();
    expect(screen.getByText('customer-vertex')).toBeInTheDocument();
    expect(view.container.querySelector('[data-view-mode="grid"]')).toBeInTheDocument();
    await user.type(screen.getByRole('searchbox', { name: 'Search' }), 'health');
    await user.click(screen.getByRole('button', { name: 'Search' }));
    await waitFor(() =>
      expect(mocks.getAuditLogs).toHaveBeenLastCalledWith(
        expect.objectContaining({ search: 'health', page: 1 }),
      ),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Table view' }));
    await waitFor(() =>
      expect(view.container.querySelector('[data-view-mode="table"]')).toBeInTheDocument(),
    );
    const row = screen.getByRole('row', { name: /Updated the health score/ });
    expect(within(row).getByTitle('customer.updated')).toHaveTextContent('Customer updated');
    expect(within(row).getByText('customer-vertex')).toBeInTheDocument();
  });

  it('opens sanitized event context without any mutation control', async () => {
    renderPage();
    await screen.findByText(event.summary);
    fireEvent.click(screen.getByRole('button', { name: 'View event audit-1001' }));
    const dialog = await screen.findByRole('dialog', { name: 'Event details' });
    expect(within(dialog).getByText('Customer updated')).toBeInTheDocument();
    expect(within(dialog).getByText('Customer')).toBeInTheDocument();
    expect(within(dialog).getByText('customer-vertex')).toBeInTheDocument();
    expect(within(dialog).getByText('203.0.113.10')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /delete|edit|revoke/i })).not.toBeInTheDocument();
  });
});
