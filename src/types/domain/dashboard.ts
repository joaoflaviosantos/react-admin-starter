import type { CustomerPlan, CustomerSource } from './customer';
import type { AuditLog } from './audit-log';

export type DashboardPeriod = '30d' | '90d' | '12m';

export type DashboardKpi = {
  value: number;
  changePercent: number;
  direction: 'up' | 'down' | 'flat';
};

export type DashboardSeriesPoint = {
  label: string;
  revenueCents: number;
  mrrCents: number;
};

export type DashboardPlanDistribution = {
  plan: CustomerPlan;
  count: number;
  mrrCents: number;
};

export type DashboardAcquisition = {
  source: CustomerSource;
  count: number;
};

export type DashboardRiskAccount = {
  id: string;
  name: string;
  healthScore: number;
  mrrCents: number;
  reason: 'low_health' | 'past_due' | 'trial_ending';
};

export type DashboardSectionName =
  'kpis' | 'revenueMrr' | 'plans' | 'acquisition' | 'riskAccounts' | 'recentActivity';

export type DashboardSectionState = {
  status: 'ready' | 'empty' | 'error';
  message?: string;
};

export type DashboardResponse = {
  period: DashboardPeriod;
  kpis: {
    mrr: DashboardKpi;
    activeSubscriptions: DashboardKpi;
    trialConversion: DashboardKpi;
    churn: DashboardKpi;
  };
  revenueMrr: DashboardSeriesPoint[];
  planDistribution: DashboardPlanDistribution[];
  acquisition: DashboardAcquisition[];
  riskAccounts: DashboardRiskAccount[];
  recentActivity: AuditLog[];
  sectionStates: Record<DashboardSectionName, DashboardSectionState>;
};
