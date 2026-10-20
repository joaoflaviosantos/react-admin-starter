import type { DashboardPeriod, DashboardResponse } from '#/domain';

import type { MockStore } from '../../store';
import type { DomainHandler } from './domains';
import { getState } from '../../store';
import { mockError } from './shared';

const DASHBOARD_NOW = Date.parse('2026-09-30T23:59:59.000Z');
const PERIODS: DashboardPeriod[] = ['30d', '90d', '12m'];

const periodMonths: Record<DashboardPeriod, string[]> = {
  '30d': ['2026-09'],
  '90d': ['2026-07', '2026-08', '2026-09'],
  '12m': [
    '2025-10',
    '2025-11',
    '2025-12',
    '2026-01',
    '2026-02',
    '2026-03',
    '2026-04',
    '2026-05',
    '2026-06',
    '2026-07',
    '2026-08',
    '2026-09',
  ],
};

const periodChange: Record<DashboardPeriod, number> = { '30d': 8.4, '90d': 14.2, '12m': 31.8 };

const isPaid = (status: string) => status === 'active' || status === 'past_due';

function percent(value: number): number {
  return Number(value.toFixed(1));
}

function kpi(value: number, changePercent: number, direction: 'up' | 'down' | 'flat' = 'up') {
  return { value, changePercent, direction } as const;
}

export function buildDashboardResponse(
  period: DashboardPeriod,
  store: MockStore,
): DashboardResponse {
  const { customers, subscriptions, auditLogs } = store.domains;
  const paidSubscriptions = subscriptions.filter((subscription) => isPaid(subscription.status));
  const mrrCents = paidSubscriptions.reduce(
    (total, subscription) => total + subscription.unitPriceCents,
    0,
  );
  const activeSubscriptions = paidSubscriptions.length;
  const trialingSubscriptions = subscriptions.filter(
    (subscription) => subscription.status === 'trialing',
  ).length;
  const trialConversion =
    activeSubscriptions + trialingSubscriptions
      ? percent((activeSubscriptions / (activeSubscriptions + trialingSubscriptions)) * 100)
      : 0;
  const churnedCustomers = customers.filter((customer) => customer.status === 'churned').length;
  const churn = customers.length ? percent((churnedCustomers / customers.length) * 100) : 0;
  const revenueMrr = periodMonths[period].map((month, index, months) => {
    const progress = months.length === 1 ? 1 : (index + 1) / months.length;
    const historicalMrr = Math.round(mrrCents * (0.72 + progress * 0.28));
    return {
      label: month,
      revenueCents: Math.round(historicalMrr * 1.08),
      mrrCents: historicalMrr,
    };
  });

  const planDistribution = (['starter', 'growth', 'scale'] as const).map((plan) => {
    const matching = subscriptions.filter((subscription) => subscription.plan === plan);
    return {
      plan,
      count: matching.length,
      mrrCents: matching
        .filter((subscription) => isPaid(subscription.status))
        .reduce((total, subscription) => total + subscription.unitPriceCents, 0),
    };
  });

  const acquisition = (['organic', 'paid_search', 'referral', 'partner', 'outbound'] as const)
    .map((source) => ({
      source,
      count: customers.filter((customer) => customer.source === source).length,
    }))
    .filter((item) => item.count > 0)
    .sort((left, right) => right.count - left.count || left.source.localeCompare(right.source));

  const riskAccounts = customers
    .filter(
      (customer) =>
        customer.status !== 'churned' &&
        (customer.healthScore < 70 || customer.status === 'past_due'),
    )
    .map((customer) => ({
      id: customer.id,
      name: customer.name,
      healthScore: customer.healthScore,
      mrrCents: customer.mrrCents,
      reason: customer.status === 'past_due' ? ('past_due' as const) : ('low_health' as const),
    }))
    .sort((left, right) => left.healthScore - right.healthScore);

  const cutoffDays = period === '30d' ? 30 : period === '90d' ? 90 : 365;
  const recentActivity = auditLogs
    .filter((event) => DASHBOARD_NOW - Date.parse(event.createdAt) <= cutoffDays * 86_400_000)
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .map((event) => structuredClone(event));

  const sectionStates = {
    kpis: { status: 'ready' as const },
    revenueMrr: revenueMrr.length ? { status: 'ready' as const } : { status: 'empty' as const },
    plans: planDistribution.some((item) => item.count > 0)
      ? { status: 'ready' as const }
      : { status: 'empty' as const },
    acquisition: acquisition.length ? { status: 'ready' as const } : { status: 'empty' as const },
    riskAccounts: riskAccounts.length ? { status: 'ready' as const } : { status: 'empty' as const },
    recentActivity: recentActivity.length
      ? { status: 'ready' as const }
      : { status: 'empty' as const },
  };

  return {
    period,
    kpis: {
      mrr: kpi(mrrCents, periodChange[period], 'up'),
      activeSubscriptions: kpi(activeSubscriptions, periodChange[period], 'up'),
      trialConversion: kpi(trialConversion, periodChange[period], 'up'),
      churn: kpi(churn, periodChange[period], churn ? 'down' : 'flat'),
    },
    revenueMrr,
    planDistribution,
    acquisition,
    riskAccounts,
    recentActivity,
    sectionStates,
  };
}

export const handleDashboardRequest: DomainHandler = ({ config, method, pathname }) => {
  if (method !== 'GET' || pathname !== '/v1/dashboard') return null;
  const rawPeriod = String((config.params as Record<string, unknown> | undefined)?.period ?? '30d');
  if (!PERIODS.includes(rawPeriod as DashboardPeriod)) {
    return mockError(422, 'Invalid dashboard period.');
  }
  return { status: 200, data: buildDashboardResponse(rawPeriod as DashboardPeriod, getState()) };
};
