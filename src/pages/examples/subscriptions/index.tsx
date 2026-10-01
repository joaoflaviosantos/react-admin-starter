import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import { Pencil, Plus, RotateCcw, XCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import customerService from '@/api/services/examples/customerService';
import subscriptionService, {
  type SubscriptionListParams,
} from '@/api/services/examples/subscriptionService';
import ConfirmDialog from '@/components/admin/confirm-dialog';
import { AdminTable, AdminTablePagination } from '@/components/admin/data-table';
import { AdminDataView, type AdminDataViewItemContext } from '@/components/admin/data-view';
import { AdminPage, AdminPageHeader } from '@/components/admin/page';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useHasRequiredPermission } from '@/hooks/permissions/use-has-required-permission';
import { appToast } from '@/lib/toast';
import { useMatchRouteMeta } from '@/router/hooks';
import type { Subscription, SubscriptionInput } from '#/examples';

import { SubscriptionFormDialog } from './subscription-form-dialog';

const filterClass =
  'h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-sm';

export default function SubscriptionsPage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'pt_BR' ? 'pt-BR' : 'en-US';
  const permissions = useHasRequiredPermission(useMatchRouteMeta()?.label);
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<
    Pick<SubscriptionListParams, 'status' | 'plan' | 'interval'>
  >({ status: '', plan: '', interval: '' });
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10 });
  const [editing, setEditing] = useState<Subscription | null | undefined>(undefined);

  const query = useQuery({
    queryKey: ['examples', 'subscriptions', search, filters, pagination],
    queryFn: () =>
      subscriptionService.getSubscriptions({
        search,
        ...filters,
        page: pagination.page,
        items_per_page: pagination.pageSize,
      }),
  });
  const customerQuery = useQuery({
    queryKey: ['examples', 'customers', 'subscription-options'],
    queryFn: () => customerService.getCustomers({ page: 1, items_per_page: 100 }),
  });
  const customers = useMemo(() => customerQuery.data?.data ?? [], [customerQuery.data?.data]);
  const customerById = useMemo(
    () => new Map(customers.map((customer) => [customer.id, customer])),
    [customers],
  );
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['examples', 'subscriptions'] });
  const save = useMutation({
    mutationFn: (payload: SubscriptionInput) =>
      editing
        ? subscriptionService.updateSubscription(editing.id, payload)
        : subscriptionService.createSubscription(payload),
    onSuccess: () => {
      setEditing(undefined);
      void invalidate();
      appToast.success(t('examples.subscriptions.saved'));
    },
    onError: () => appToast.error(t('examples.subscriptions.saveError')),
  });
  const lifecycle = useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'cancel' | 'reactivate' }) =>
      action === 'cancel'
        ? subscriptionService.cancelSubscription(id)
        : subscriptionService.reactivateSubscription(id),
    onSuccess: (_, variables) => {
      void invalidate();
      appToast.success(
        t(
          variables.action === 'cancel'
            ? 'examples.subscriptions.canceled'
            : 'examples.subscriptions.reactivated',
        ),
      );
    },
    onError: () => appToast.error(t('examples.subscriptions.lifecycleError')),
  });
  const subscriptions = query.data?.data ?? [];
  const option = (value: string) => t(`examples.common.options.${value}`);
  const money = (value: number) =>
    new Intl.NumberFormat(locale, { style: 'currency', currency: 'BRL' }).format(value / 100);
  const date = (value: string) =>
    new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(value));
  const customerName = (subscription: Subscription) =>
    customerById.get(subscription.customerId)?.name ?? subscription.customerId;

  const actions = (subscription: Subscription) => {
    const name = customerName(subscription);
    const canceled = subscription.status === 'canceled';
    return permissions.canUpdate ? (
      <div className="flex items-center gap-1">
        <Button
          size="icon"
          variant="ghost"
          aria-label={t('examples.subscriptions.editAria', { name })}
          onClick={() => setEditing(subscription)}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <ConfirmDialog
          title={t(
            canceled
              ? 'examples.subscriptions.reactivateTitle'
              : 'examples.subscriptions.cancelTitle',
            { name },
          )}
          description={t(
            canceled
              ? 'examples.subscriptions.reactivateDescription'
              : 'examples.subscriptions.cancelDescription',
          )}
          confirmLabel={t(
            canceled ? 'examples.subscriptions.reactivate' : 'examples.subscriptions.cancel',
          )}
          cancelLabel={t('examples.common.actions.close')}
          onConfirm={() =>
            lifecycle.mutate({ id: subscription.id, action: canceled ? 'reactivate' : 'cancel' })
          }
          trigger={
            <Button
              size="icon"
              variant="ghost"
              aria-label={t(
                canceled
                  ? 'examples.subscriptions.reactivateAria'
                  : 'examples.subscriptions.cancelAria',
                { name },
              )}
            >
              {canceled ? <RotateCcw className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
            </Button>
          }
        />
      </div>
    ) : null;
  };

  const columns: ColumnDef<Subscription>[] = [
    {
      id: 'customer',
      header: t('examples.subscriptions.customer'),
      cell: ({ row }) => customerName(row.original),
    },
    {
      accessorKey: 'plan',
      header: t('examples.subscriptions.plan'),
      cell: ({ row }) => <Badge variant="outline">{option(row.original.plan)}</Badge>,
    },
    {
      accessorKey: 'status',
      header: t('examples.common.fields.status'),
      cell: ({ row }) => (
        <Badge variant={row.original.status === 'past_due' ? 'destructive' : 'secondary'}>
          {option(row.original.status)}
        </Badge>
      ),
    },
    {
      accessorKey: 'interval',
      header: t('examples.subscriptions.interval'),
      cell: ({ row }) => option(row.original.interval),
    },
    { accessorKey: 'seats', header: t('examples.subscriptions.seats') },
    {
      accessorKey: 'unitPriceCents',
      header: t('examples.subscriptions.unitPrice'),
      cell: ({ row }) => money(row.original.unitPriceCents),
    },
    {
      accessorKey: 'currentPeriodEnd',
      header: t('examples.subscriptions.periodEnd'),
      cell: ({ row }) => date(row.original.currentPeriodEnd),
    },
    {
      id: 'actions',
      header: t('examples.common.fields.actions'),
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
          {t('examples.subscriptions.seats')}: {subscription.seats}
        </span>
        <span>{date(subscription.currentPeriodEnd)}</span>
      </CardContent>
    </Card>
  );

  const updateFilter = (name: 'status' | 'plan' | 'interval', value: string) => {
    setFilters((current) => ({ ...current, [name]: value }));
    setPagination((current) => ({ ...current, page: 1 }));
  };
  const counts = query.data?.counts;

  return (
    <AdminPage>
      <AdminPageHeader
        title={t('examples.subscriptions.title')}
        description={t('examples.subscriptions.description')}
        actions={
          permissions.canCreate ? (
            <Button onClick={() => setEditing(null)}>
              <Plus className="mr-2 h-4 w-4" />
              {t('examples.subscriptions.new')}
            </Button>
          ) : undefined
        }
      />
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-5">
        {(['all', 'active', 'trialing', 'past_due', 'canceled'] as const).map((status) => (
          <Card key={status}>
            <CardContent className="p-4">
              <p className="text-xs font-medium uppercase text-muted-foreground">
                {option(status)}
              </p>
              <p className="mt-1 text-2xl font-semibold">{counts?.[status] ?? 0}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <AdminDataView
        data={subscriptions}
        getItemId={(subscription) => subscription.id}
        isLoading={query.isLoading}
        error={query.error}
        renderActions={actions}
        labels={{
          table: t('examples.dataView.table'),
          grid: t('examples.dataView.grid'),
          list: t('examples.dataView.list'),
          loading: t('examples.subscriptions.loading'),
          empty: t('examples.subscriptions.empty'),
          error: t('examples.subscriptions.loadError'),
        }}
        toolbar={
          <div className="flex flex-wrap gap-2">
            <Input
              className="min-w-52 flex-1"
              type="search"
              aria-label={t('examples.subscriptions.searchAria')}
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPagination((current) => ({ ...current, page: 1 }));
              }}
            />
            {(['status', 'plan', 'interval'] as const).map((name) => (
              <select
                key={name}
                aria-label={t(
                  name === 'status'
                    ? 'examples.common.fields.status'
                    : `examples.subscriptions.${name}`,
                )}
                className={filterClass}
                value={filters[name]}
                onChange={(event) => updateFilter(name, event.target.value)}
              >
                <option value="">{t('examples.common.states.all')}</option>
                {(name === 'status'
                  ? ['trialing', 'active', 'past_due', 'canceled']
                  : name === 'plan'
                    ? ['starter', 'growth', 'scale']
                    : ['monthly', 'yearly']
                ).map((value) => (
                  <option key={value} value={value}>
                    {option(value)}
                  </option>
                ))}
              </select>
            ))}
          </div>
        }
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
      <SubscriptionFormDialog
        open={editing !== undefined}
        subscription={editing ?? null}
        customers={customers}
        pending={save.isPending}
        onOpenChange={(open) => !open && setEditing(undefined)}
        onSubmit={(payload) => save.mutate(payload)}
      />
    </AdminPage>
  );
}
