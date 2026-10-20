import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import { Eye, Pencil, Plus, RotateCcw, XCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import customerService from '@/api/services/domains/customerService';
import subscriptionService, {
  type SubscriptionListParams,
} from '@/api/services/domains/subscriptionService';
import { AdminTable, AdminTablePagination } from '@/components/admin/data-table';
import {
  AdminDataView,
  DataViewToggle,
  useAdminDataViewMode,
  type AdminDataViewItemContext,
} from '@/components/admin/data-view';
import {
  AdminForm,
  AdminSearchPanel,
  SearchFieldInput,
  SearchFieldSelect,
} from '@/components/admin/form';
import { AdminListPage } from '@/components/admin/page';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useHasRequiredPermission } from '@/hooks/permissions/use-has-required-permission';
import { appToast } from '@/lib/toast';
import { useMatchRouteMeta } from '@/router/hooks';
import type { Subscription } from '#/domain';

import { SubscriptionCreateModal } from './subscription-create-modal';
import { SubscriptionDetailModal } from './subscription-detail-modal';
import { SubscriptionEditModal } from './subscription-edit-modal';
import { SubscriptionLifecycleConfirmModal } from './subscription-lifecycle-confirm-modal';

type SubscriptionFilters = {
  search: string;
  status: NonNullable<SubscriptionListParams['status']>;
  plan: NonNullable<SubscriptionListParams['plan']>;
};

const EMPTY_SUBSCRIPTION_FILTERS: SubscriptionFilters = {
  search: '',
  status: '',
  plan: '',
};

export default function SubscriptionsPage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'pt_BR' ? 'pt-BR' : 'en-US';
  const permissions = useHasRequiredPermission(useMatchRouteMeta()?.label);
  const { mode, setMode } = useAdminDataViewMode();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<SubscriptionFilters>(EMPTY_SUBSCRIPTION_FILTERS);
  const searchForm = useForm<SubscriptionFilters>({ defaultValues: EMPTY_SUBSCRIPTION_FILTERS });
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10 });
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Subscription | null>(null);
  const [details, setDetails] = useState<Subscription | null>(null);
  const [lifecycleTarget, setLifecycleTarget] = useState<{
    subscription: Subscription;
    action: 'cancel' | 'reactivate';
  } | null>(null);

  const query = useQuery({
    queryKey: ['domains', 'subscriptions', filters, pagination],
    queryFn: () =>
      subscriptionService.getSubscriptions({
        ...filters,
        page: pagination.page,
        items_per_page: pagination.pageSize,
      }),
  });
  const customerQuery = useQuery({
    queryKey: ['domains', 'customers', 'subscription-options'],
    queryFn: () => customerService.getCustomers({ page: 1, items_per_page: 100 }),
  });
  const customers = useMemo(() => customerQuery.data?.data ?? [], [customerQuery.data?.data]);
  const customerById = useMemo(
    () => new Map(customers.map((customer) => [customer.id, customer])),
    [customers],
  );
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['domains', 'subscriptions'] });
  const lifecycle = useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'cancel' | 'reactivate' }) =>
      action === 'cancel'
        ? subscriptionService.cancelSubscription(id)
        : subscriptionService.reactivateSubscription(id),
    onSuccess: (_, variables) => {
      setLifecycleTarget(null);
      void invalidate();
      appToast.success(
        t(
          variables.action === 'cancel'
            ? 'app.subscriptions.canceled'
            : 'app.subscriptions.reactivated',
        ),
      );
    },
    onError: () => appToast.error(t('app.subscriptions.lifecycleError')),
  });
  const subscriptions = query.data?.data ?? [];
  const option = (value: string) => t(`app.common.options.${value}`);
  const money = (value: number) =>
    new Intl.NumberFormat(locale, { style: 'currency', currency: 'BRL' }).format(value / 100);
  const date = (value: string) =>
    new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(value));
  const customerName = (subscription: Subscription) =>
    customerById.get(subscription.customerId)?.name ?? subscription.customerId;

  const actions = (subscription: Subscription) => {
    const name = customerName(subscription);
    const canceled = subscription.status === 'canceled';
    return (
      <div className="flex items-center gap-1">
        <Button
          size="icon"
          variant="ghost"
          aria-label={t('app.subscriptions.viewAria', { name })}
          onClick={() => setDetails(subscription)}
        >
          <Eye className="h-4 w-4" />
        </Button>
        {permissions.canUpdate ? (
          <>
            <Button
              size="icon"
              variant="ghost"
              aria-label={t('app.subscriptions.editAria', { name })}
              onClick={() => setEditing(subscription)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              aria-label={t(
                canceled ? 'app.subscriptions.reactivateAria' : 'app.subscriptions.cancelAria',
                { name },
              )}
              onClick={() =>
                setLifecycleTarget({
                  subscription,
                  action: canceled ? 'reactivate' : 'cancel',
                })
              }
            >
              {canceled ? <RotateCcw className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
            </Button>
          </>
        ) : null}
      </div>
    );
  };

  const columns: ColumnDef<Subscription>[] = [
    {
      id: 'customer',
      header: t('app.subscriptions.customer'),
      cell: ({ row }) => customerName(row.original),
    },
    {
      accessorKey: 'plan',
      header: t('app.subscriptions.plan'),
      cell: ({ row }) => <Badge variant="outline">{option(row.original.plan)}</Badge>,
    },
    {
      accessorKey: 'status',
      header: t('app.common.fields.status'),
      cell: ({ row }) => (
        <Badge variant={row.original.status === 'past_due' ? 'destructive' : 'secondary'}>
          {option(row.original.status)}
        </Badge>
      ),
    },
    {
      accessorKey: 'interval',
      header: t('app.subscriptions.interval'),
      cell: ({ row }) => option(row.original.interval),
    },
    { accessorKey: 'seats', header: t('app.subscriptions.seats') },
    {
      accessorKey: 'unitPriceCents',
      header: t('app.subscriptions.unitPrice'),
      cell: ({ row }) => money(row.original.unitPriceCents),
    },
    {
      accessorKey: 'currentPeriodEnd',
      header: t('app.subscriptions.periodEnd'),
      cell: ({ row }) => date(row.original.currentPeriodEnd),
    },
    {
      id: 'actions',
      header: t('app.common.fields.actions'),
      cell: ({ row }) => actions(row.original),
    },
  ];

  const summary = (
    subscription: Subscription,
    context: AdminDataViewItemContext,
    compact = false,
  ) => (
    <Card className={compact ? 'shadow-none' : undefined}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base">{customerName(subscription)}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {option(subscription.plan)} · {option(subscription.interval)}
          </p>
        </div>
        {context.actions}
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3 text-sm">
        <Badge variant={subscription.status === 'past_due' ? 'destructive' : 'secondary'}>
          {option(subscription.status)}
        </Badge>
        <span>{money(subscription.unitPriceCents)}</span>
        <span>
          {t('app.subscriptions.seats')}: {subscription.seats}
        </span>
        <span>{date(subscription.currentPeriodEnd)}</span>
      </CardContent>
    </Card>
  );

  const onSearch = (values: SubscriptionFilters) => {
    setFilters(values);
    setPagination((current) => ({ ...current, page: 1 }));
  };

  const onSearchReset = () => {
    searchForm.reset(EMPTY_SUBSCRIPTION_FILTERS);
    setFilters(EMPTY_SUBSCRIPTION_FILTERS);
    setPagination((current) => ({ ...current, page: 1 }));
  };

  const filterOptions = (values: string[]) =>
    values.map((value) => ({ value, label: option(value) }));

  return (
    <AdminListPage
      filters={
        <AdminForm form={searchForm} onSubmit={onSearch}>
          <AdminSearchPanel
            isLoading={query.isLoading}
            clearDisabled={!Object.values(filters).some(Boolean)}
            onClear={onSearchReset}
          >
            <SearchFieldInput
              control={searchForm.control}
              name="search"
              label={t('app.common.fields.search')}
              type="search"
              disabled={query.isLoading}
            />
            <SearchFieldSelect
              control={searchForm.control}
              name="status"
              label={t('app.common.fields.status')}
              placeholder={t('app.common.states.all')}
              options={filterOptions(['trialing', 'active', 'past_due', 'canceled'])}
              disabled={query.isLoading}
            />
            <SearchFieldSelect
              control={searchForm.control}
              name="plan"
              label={t('app.subscriptions.plan')}
              placeholder={t('app.common.states.all')}
              options={filterOptions(['starter', 'growth', 'scale'])}
              disabled={query.isLoading}
            />
          </AdminSearchPanel>
        </AdminForm>
      }
      listTitle={t('app.subscriptions.listTitle')}
      listActions={
        <>
          <DataViewToggle
            mode={mode}
            onChange={setMode}
            labels={{
              table: t('app.dataView.table'),
              grid: t('app.dataView.grid'),
              list: t('app.dataView.list'),
            }}
          />
          {permissions.canCreate ? (
            <Button onClick={() => setCreating(true)}>
              <Plus className="mr-2 h-4 w-4" />
              {t('app.subscriptions.new')}
            </Button>
          ) : null}
        </>
      }
    >
      <AdminDataView
        data={subscriptions}
        getItemId={(subscription) => subscription.id}
        isLoading={query.isLoading}
        error={query.error}
        showToggle={false}
        renderActions={actions}
        labels={{
          table: t('app.dataView.table'),
          grid: t('app.dataView.grid'),
          list: t('app.dataView.list'),
          loading: t('app.subscriptions.loading'),
          empty: t('app.subscriptions.empty'),
          error: t('app.subscriptions.loadError'),
        }}
        renderTable={({ data }) => <AdminTable columns={columns} data={data} rowKey="id" />}
        renderGridItem={(subscription, context) => summary(subscription, context)}
        renderListItem={(subscription, context) => summary(subscription, context, true)}
        pagination={
          <AdminTablePagination
            pageIndex={query.data?.page ?? pagination.page}
            pageSize={query.data?.items_per_page ?? pagination.pageSize}
            totalCount={query.data?.total_count ?? 0}
            onPaginationChange={(page, pageSize) => setPagination({ page, pageSize })}
          />
        }
      />
      <SubscriptionCreateModal open={creating} customers={customers} onOpenChange={setCreating} />
      <SubscriptionEditModal
        subscription={editing}
        customers={customers}
        show={editing !== null}
        onClose={() => setEditing(null)}
      />
      <SubscriptionDetailModal
        subscription={details}
        customerName={details ? customerName(details) : ''}
        locale={locale}
        onClose={() => setDetails(null)}
      />
      <SubscriptionLifecycleConfirmModal
        name={lifecycleTarget ? customerName(lifecycleTarget.subscription) : ''}
        action={lifecycleTarget?.action ?? null}
        show={lifecycleTarget !== null}
        isPending={lifecycle.isPending}
        onClose={() => setLifecycleTarget(null)}
        onConfirm={() =>
          lifecycleTarget &&
          lifecycle.mutate({
            id: lifecycleTarget.subscription.id,
            action: lifecycleTarget.action,
          })
        }
      />
    </AdminListPage>
  );
}
