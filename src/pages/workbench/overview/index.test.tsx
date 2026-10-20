import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { DashboardResponse } from '#/domain';

import OverviewPage from './index';

const { getDashboard } = vi.hoisted(() => ({ getDashboard: vi.fn() }));

vi.mock('@/api/services/domains/dashboardService', () => ({
  default: { getDashboard },
}));

vi.mock('@/components/admin/chart', () => ({
  NativeChart: ({ title }: { title: string }) => (
    <div role="img" aria-label={title} data-testid="native-chart" />
  ),
}));

const response: DashboardResponse = {
  period: '30d',
  kpis: {
    mrr: { value: 262600, changePercent: 8.4, direction: 'up' },
    activeSubscriptions: { value: 4, changePercent: 8.4, direction: 'up' },
    trialConversion: { value: 80, changePercent: 8.4, direction: 'up' },
    churn: { value: 16.7, changePercent: 8.4, direction: 'down' },
  },
  revenueMrr: [{ label: '2026-09', revenueCents: 280000, mrrCents: 262600 }],
  planDistribution: [{ plan: 'starter', count: 2, mrrCents: 12900 }],
  acquisition: [{ source: 'organic', count: 2 }],
  riskAccounts: [
    {
      id: 'customer-vertex',
      name: 'Vertex Finance',
      healthScore: 36,
      mrrCents: 49900,
      reason: 'past_due',
    },
  ],
  recentActivity: [
    {
      id: 'audit-1',
      actorName: 'Admin',
      actorEmail: 'admin@test',
      action: 'customer.updated',
      resourceType: 'customer',
      resourceId: 'customer-vertex',
      summary: 'Updated Vertex',
      ipAddress: '127.0.0.1',
      userAgent: 'test',
      createdAt: '2026-09-30T12:00:00.000Z',
      metadata: {},
    },
  ],
  sectionStates: {
    kpis: { status: 'ready' },
    revenueMrr: { status: 'ready' },
    plans: { status: 'ready' },
    acquisition: { status: 'ready' },
    riskAccounts: { status: 'ready' },
    recentActivity: { status: 'ready' },
  },
};

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/workbench/overview']}>
        <OverviewPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('Workbench overview', () => {
  beforeEach(() => {
    getDashboard.mockReset();
    getDashboard.mockResolvedValue(response);
  });
  afterEach(cleanup);

  it('renders KPIs, three charts and actionable sections from the dashboard response', async () => {
    renderPage();
    expect(await screen.findByTestId('dashboard-content')).toBeInTheDocument();
    expect(screen.getAllByTestId('native-chart')).toHaveLength(3);
    expect(screen.getByText('Vertex Finance')).toBeInTheDocument();
    expect(screen.getByText('Updated Vertex')).toBeInTheDocument();
    expect(getDashboard).toHaveBeenCalledWith('12m');
  });

  it('changes and resets the period from the floating filter drawer', async () => {
    const user = userEvent.setup();
    getDashboard.mockImplementation(async (period: string) => ({ ...response, period }));
    renderPage();
    await screen.findByTestId('dashboard-content');

    await user.click(screen.getByRole('button', { name: 'Filters' }));
    const filters = await screen.findByRole('dialog', { name: 'Filters' });
    expect(within(filters).getByRole('combobox', { name: 'Period' })).toHaveTextContent(
      '12 months',
    );
    await user.click(within(filters).getByRole('combobox', { name: 'Period' }));
    await user.click(await screen.findByRole('option', { name: '90 days' }));
    expect(within(filters).getByRole('combobox', { name: 'Period' })).toHaveTextContent('90 days');
    await waitFor(() => expect(getDashboard).toHaveBeenLastCalledWith('90d'));

    await user.click(within(filters).getByRole('button', { name: 'Reset' }));
    await waitFor(() => expect(getDashboard).toHaveBeenLastCalledWith('12m'));
  });
});
