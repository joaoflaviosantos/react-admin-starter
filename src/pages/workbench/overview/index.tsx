import { useQuery } from '@tanstack/react-query';
import type { EChartsOption } from 'echarts';
import { Activity, AlertTriangle, BarChart3, CreditCard, DollarSign, Users } from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';

import dashboardService from '@/api/services/domains/dashboardService';
import { NativeChart } from '@/components/admin/chart';
import { AdminPage, AdminPageHeader } from '@/components/admin/page';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useHasRequiredPermission } from '@/hooks/permissions/use-has-required-permission';
import { useTheme } from '@/theme/hooks';
import { useUserInfo } from '@/store/userStore';
import { ThemeMode } from '#/enum';
import type { DashboardPeriod, DashboardResponse } from '#/domain';

const periods: DashboardPeriod[] = ['30d', '90d', '12m'];
const defaultPeriod: DashboardPeriod = '12m';

function formatMoney(value: number, language: string) {
  return new Intl.NumberFormat(language === 'pt_BR' ? 'pt-BR' : 'en-US', {
    style: 'currency',
    currency: language === 'pt_BR' ? 'BRL' : 'USD',
    maximumFractionDigits: 0,
  }).format(value / 100);
}

function formatNumber(value: number, language: string) {
  return new Intl.NumberFormat(language === 'pt_BR' ? 'pt-BR' : 'en-US').format(value);
}

function DashboardLoading() {
  return (
    <div className="space-y-4" aria-label="Loading dashboard" data-testid="dashboard-loading">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-28" />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <Skeleton className="h-80" />
        <Skeleton className="h-80" />
      </div>
    </div>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  comparison,
}: {
  icon: typeof DollarSign;
  label: string;
  value: string;
  comparison: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-3 p-5">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-2 truncate text-2xl font-semibold tracking-tight">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{comparison}</p>
        </div>
        <span className="rounded-md bg-primary/10 p-2 text-primary">
          <Icon className="h-5 w-5" />
        </span>
      </CardContent>
    </Card>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="min-w-0">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="min-w-0">{children}</CardContent>
    </Card>
  );
}

function chartState(
  status: DashboardResponse['sectionStates'][keyof DashboardResponse['sectionStates']]['status'],
) {
  return status === 'ready' ? 'ready' : status;
}

function dashboardOptions(data: DashboardResponse, t: (key: string) => string, dark: boolean) {
  const textColor = dark ? '#cbd5e1' : '#475569';
  const axisColor = dark ? '#475569' : '#cbd5e1';
  const revenueOption: EChartsOption = {
    color: ['#2563eb', '#14b8a6'],
    tooltip: { trigger: 'axis' },
    legend: {
      textStyle: { color: textColor },
      data: [t('app.dashboard.revenueMrr'), t('app.dashboard.mrrShort')],
    },
    grid: { left: 8, right: 8, bottom: 8, top: 28, containLabel: true },
    xAxis: {
      type: 'category',
      data: data.revenueMrr.map((point) => point.label),
      axisLabel: { color: textColor },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: textColor },
      splitLine: { lineStyle: { color: axisColor } },
    },
    series: [
      {
        name: t('app.dashboard.revenueMrr'),
        type: 'bar',
        data: data.revenueMrr.map((point) => point.revenueCents / 100),
      },
      {
        name: t('app.dashboard.mrrShort'),
        type: 'line',
        smooth: true,
        data: data.revenueMrr.map((point) => point.mrrCents / 100),
      },
    ],
  };
  const plansOption: EChartsOption = {
    tooltip: { trigger: 'item' },
    legend: { bottom: 0, textStyle: { color: textColor } },
    series: [
      {
        type: 'pie',
        radius: ['48%', '72%'],
        avoidLabelOverlap: true,
        label: { show: false },
        data: data.planDistribution.map((item) => ({
          name: t(`app.common.options.${item.plan}`),
          value: item.count,
        })),
      },
    ],
  };
  const acquisitionOption: EChartsOption = {
    color: ['#8b5cf6'],
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: 8, right: 8, bottom: 8, top: 8, containLabel: true },
    xAxis: {
      type: 'value',
      axisLabel: { color: textColor },
      splitLine: { lineStyle: { color: axisColor } },
    },
    yAxis: {
      type: 'category',
      data: data.acquisition.map((item) => t(`app.common.options.${item.source}`)),
      axisLabel: { color: textColor },
    },
    series: [{ type: 'bar', data: data.acquisition.map((item) => item.count), barMaxWidth: 24 }],
  };
  return { revenueOption, plansOption, acquisitionOption };
}

export default function OverviewPage() {
  const { t, i18n } = useTranslation();
  const userInfo = useUserInfo();
  const { themeMode } = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedPeriod = searchParams.get('period');
  const period: DashboardPeriod = periods.includes(requestedPeriod as DashboardPeriod)
    ? (requestedPeriod as DashboardPeriod)
    : defaultPeriod;
  useHasRequiredPermission('sys.menu.overview');
  const query = useQuery({
    queryKey: ['workbench', 'dashboard', period],
    queryFn: () => dashboardService.getDashboard(period),
  });
  const data = query.data;
  const options = useMemo(
    () => (data ? dashboardOptions(data, t, themeMode === ThemeMode.Dark) : null),
    [data, t, themeMode],
  );
  const setPeriod = (nextPeriod: DashboardPeriod) => {
    const next = new URLSearchParams(searchParams);
    next.set('period', nextPeriod);
    setSearchParams(next);
  };
  const comparison = t('app.dashboard.change');
  const date = (value: string) =>
    new Intl.DateTimeFormat(i18n.language === 'pt_BR' ? 'pt-BR' : 'en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));

  return (
    <AdminPage>
      <AdminPageHeader
        title={t('app.dashboard.title')}
        description={`${t('app.dashboard.description')} · ${userInfo.name ?? 'User'}`}
        actions={
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{t('app.dashboard.periodLabel')}</span>
            <select
              className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground"
              aria-label={t('app.dashboard.periodLabel')}
              value={period}
              onChange={(event) => setPeriod(event.target.value as DashboardPeriod)}
            >
              {periods.map((value) => (
                <option key={value} value={value}>
                  {t(`app.dashboard.period${value}`)}
                </option>
              ))}
            </select>
          </label>
        }
      />
      {query.isLoading ? (
        <DashboardLoading />
      ) : query.error || !data ? (
        <Alert variant="destructive">
          <AlertDescription>{t('app.dashboard.loadError')}</AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-4" data-testid="dashboard-content">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              icon={DollarSign}
              label={t('app.dashboard.mrr')}
              value={formatMoney(data.kpis.mrr.value, i18n.language)}
              comparison={`${data.kpis.mrr.changePercent}% ${comparison}`}
            />
            <KpiCard
              icon={CreditCard}
              label={t('app.dashboard.activeSubscriptions')}
              value={formatNumber(data.kpis.activeSubscriptions.value, i18n.language)}
              comparison={`${data.kpis.activeSubscriptions.changePercent}% ${comparison}`}
            />
            <KpiCard
              icon={Users}
              label={t('app.dashboard.trialConversion')}
              value={`${data.kpis.trialConversion.value}%`}
              comparison={`${data.kpis.trialConversion.changePercent}% ${comparison}`}
            />
            <KpiCard
              icon={BarChart3}
              label={t('app.dashboard.churn')}
              value={`${data.kpis.churn.value}%`}
              comparison={`${data.kpis.churn.changePercent}% ${comparison}`}
            />
          </div>
          <div className="grid gap-4 xl:grid-cols-2">
            <ChartCard title={t('app.dashboard.revenueMrr')}>
              <NativeChart
                title={t('app.dashboard.revenueMrr')}
                option={options!.revenueOption}
                state={chartState(data.sectionStates.revenueMrr.status)}
                stateMessage={
                  data.sectionStates.revenueMrr.status === 'error'
                    ? t('app.dashboard.loadError')
                    : t('app.dashboard.empty')
                }
                theme={themeMode === ThemeMode.Dark ? 'dark' : 'light'}
                ariaLabel={t('app.dashboard.revenueMrr')}
              />
            </ChartCard>
            <ChartCard title={t('app.dashboard.plans')}>
              <NativeChart
                title={t('app.dashboard.plans')}
                option={options!.plansOption}
                state={chartState(data.sectionStates.plans.status)}
                stateMessage={
                  data.sectionStates.plans.status === 'error'
                    ? t('app.dashboard.loadError')
                    : t('app.dashboard.empty')
                }
                theme={themeMode === ThemeMode.Dark ? 'dark' : 'light'}
                ariaLabel={t('app.dashboard.plans')}
              />
            </ChartCard>
            <ChartCard title={t('app.dashboard.acquisition')}>
              <NativeChart
                title={t('app.dashboard.acquisition')}
                option={options!.acquisitionOption}
                state={chartState(data.sectionStates.acquisition.status)}
                stateMessage={
                  data.sectionStates.acquisition.status === 'error'
                    ? t('app.dashboard.loadError')
                    : t('app.dashboard.empty')
                }
                theme={themeMode === ThemeMode.Dark ? 'dark' : 'light'}
                ariaLabel={t('app.dashboard.acquisition')}
                height={280}
              />
            </ChartCard>
            <ChartCard title={t('app.dashboard.riskAccounts')}>
              <div className="space-y-3" aria-label={t('app.dashboard.riskAccounts')}>
                {data.sectionStates.riskAccounts.status === 'error' ? (
                  <p className="text-sm text-destructive">{t('app.dashboard.loadError')}</p>
                ) : data.riskAccounts.length ? (
                  data.riskAccounts.map((account) => (
                    <div
                      key={account.id}
                      className="flex items-center justify-between gap-3 border-b border-border pb-3 last:border-0 last:pb-0"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium">{account.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {t('app.dashboard.riskReason')}
                        </p>
                      </div>
                      <Badge variant="destructive">{account.healthScore}</Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">{t('app.dashboard.empty')}</p>
                )}
              </div>
            </ChartCard>
          </div>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Activity className="h-4 w-4 text-primary" />
                {t('app.dashboard.recentActivity')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.sectionStates.recentActivity.status === 'error' ? (
                <p className="text-sm text-destructive">{t('app.dashboard.loadError')}</p>
              ) : data.recentActivity.length ? (
                <div className="space-y-3">
                  {data.recentActivity.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-start gap-3 border-b border-border pb-3 last:border-0 last:pb-0"
                    >
                      <span className="mt-0.5 rounded-full bg-primary/10 p-1.5 text-primary">
                        <AlertTriangle className="h-3.5 w-3.5" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm">{event.summary}</p>
                        <p className="text-xs text-muted-foreground">
                          {event.actorName} · {date(event.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">{t('app.dashboard.empty')}</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </AdminPage>
  );
}
