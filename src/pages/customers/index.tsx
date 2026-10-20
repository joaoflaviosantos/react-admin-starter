import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import { Archive, Eye, Pencil, Plus } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import customerService, { type CustomerListParams } from '@/api/services/domains/customerService';
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
import type { Customer, CustomerInput } from '#/domain';

import { CustomerDetailDialog } from './customer-detail-dialog';
import { CustomerFormDialog } from './customer-form-dialog';

const filterClass =
  'h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-sm';

export default function CustomersPage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'pt_BR' ? 'pt-BR' : 'en-US';
  const permissions = useHasRequiredPermission(useMatchRouteMeta()?.label);
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Pick<CustomerListParams, 'status' | 'plan' | 'source'>>({
    status: '',
    plan: '',
    source: '',
  });
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10 });
  const [editing, setEditing] = useState<Customer | null | undefined>(undefined);
  const [details, setDetails] = useState<Customer | null>(null);

  const query = useQuery({
    queryKey: ['domains', 'customers', search, filters, pagination],
    queryFn: () =>
      customerService.getCustomers({
        search,
        ...filters,
        sort_by: 'healthScore',
        sort_order: 'asc',
        page: pagination.page,
        items_per_page: pagination.pageSize,
      }),
  });
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['domains', 'customers'] });
  const save = useMutation({
    mutationFn: (payload: CustomerInput) =>
      editing
        ? customerService.updateCustomer(editing.id, payload)
        : customerService.createCustomer(payload),
    onSuccess: () => {
      setEditing(undefined);
      void invalidate();
      appToast.success(t('app.customers.saved'));
    },
    onError: () => appToast.error(t('app.customers.saveError')),
  });
  const archive = useMutation({
    mutationFn: (id: string) => customerService.archiveCustomer(id),
    onSuccess: () => {
      void invalidate();
      appToast.success(t('app.customers.archived'));
    },
    onError: () => appToast.error(t('app.customers.archiveError')),
  });
  const customers = query.data?.data ?? [];
  const money = (value: number) =>
    new Intl.NumberFormat(locale, { style: 'currency', currency: 'BRL' }).format(value / 100);
  const option = (value: string) => t(`app.common.options.${value}`);

  const actions = (customer: Customer) => (
    <div className="flex items-center gap-1">
      <Button
        size="icon"
        variant="ghost"
        aria-label={t('app.customers.detailAria', { name: customer.name })}
        onClick={() => setDetails(customer)}
      >
        <Eye className="h-4 w-4" />
      </Button>
      {permissions.canUpdate ? (
        <Button
          size="icon"
          variant="ghost"
          aria-label={t('app.customers.editAria', { name: customer.name })}
          onClick={() => setEditing(customer)}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      ) : null}
      {permissions.canDelete ? (
        <ConfirmDialog
          title={t('app.customers.archiveTitle', { name: customer.name })}
          description={t('app.customers.archiveDescription')}
          confirmLabel={t('app.customers.archive')}
          cancelLabel={t('app.common.actions.cancel')}
          onConfirm={() => archive.mutate(customer.id)}
          trigger={
            <Button
              size="icon"
              variant="ghost"
              aria-label={t('app.customers.archiveAria', { name: customer.name })}
            >
              <Archive className="h-4 w-4" />
            </Button>
          }
        />
      ) : null}
    </div>
  );

  const columns: ColumnDef<Customer>[] = [
    { accessorKey: 'name', header: t('app.common.fields.name') },
    {
      id: 'contact',
      header: t('app.customers.contact'),
      cell: ({ row }) => (
        <div>
          <div>{row.original.contactName}</div>
          <div className="text-xs text-muted-foreground">{row.original.email}</div>
        </div>
      ),
    },
    { accessorKey: 'industry', header: t('app.customers.industry') },
    {
      accessorKey: 'plan',
      header: t('app.customers.plan'),
      cell: ({ row }) => <Badge variant="outline">{option(row.original.plan)}</Badge>,
    },
    {
      accessorKey: 'mrrCents',
      header: t('app.customers.mrr'),
      cell: ({ row }) => money(row.original.mrrCents),
    },
    {
      accessorKey: 'healthScore',
      header: t('app.customers.health'),
      cell: ({ row }) => `${row.original.healthScore}/100`,
    },
    {
      accessorKey: 'seatsUsed',
      header: t('app.customers.seats'),
      cell: ({ row }) => `${row.original.seatsUsed}/${row.original.seatsLimit}`,
    },
    {
      id: 'actions',
      header: t('app.common.fields.actions'),
      cell: ({ row }) => actions(row.original),
    },
  ];

  const summary = (customer: Customer, context: AdminDataViewItemContext, compact = false) => (
    <Card className={compact ? 'shadow-none' : undefined}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base">{customer.name}</CardTitle>
          <p className="text-sm text-muted-foreground">{customer.contactName}</p>
        </div>
        {context.actions}
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3 text-sm">
        <span>{option(customer.plan)}</span>
        <span>{money(customer.mrrCents)}</span>
        <span>
          {t('app.customers.health')}: {customer.healthScore}/100
        </span>
        <span>
          {t('app.customers.seats')}: {customer.seatsUsed}/{customer.seatsLimit}
        </span>
      </CardContent>
    </Card>
  );

  const updateFilter = (name: 'status' | 'plan' | 'source', value: string) => {
    setFilters((current) => ({ ...current, [name]: value }));
    setPagination((current) => ({ ...current, page: 1 }));
  };

  return (
    <AdminPage>
      <AdminPageHeader
        title={t('app.customers.title')}
        description={t('app.customers.description')}
        actions={
          permissions.canCreate ? (
            <Button onClick={() => setEditing(null)}>
              <Plus className="mr-2 h-4 w-4" />
              {t('app.customers.new')}
            </Button>
          ) : undefined
        }
      />
      <AdminDataView
        data={customers}
        getItemId={(customer) => customer.id}
        isLoading={query.isLoading}
        error={query.error}
        renderActions={actions}
        labels={{
          table: t('app.dataView.table'),
          grid: t('app.dataView.grid'),
          list: t('app.dataView.list'),
          loading: t('app.customers.loading'),
          empty: t('app.customers.empty'),
          error: t('app.customers.loadError'),
        }}
        toolbar={
          <div className="flex flex-wrap gap-2">
            <Input
              className="min-w-52 flex-1"
              type="search"
              aria-label={t('app.customers.searchAria')}
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPagination((current) => ({ ...current, page: 1 }));
              }}
            />
            {(['status', 'plan', 'source'] as const).map((name) => (
              <select
                key={name}
                aria-label={t(
                  name === 'status'
                    ? 'app.common.fields.status'
                    : `app.customers.${name}`,
                )}
                className={filterClass}
                value={filters[name]}
                onChange={(event) => updateFilter(name, event.target.value)}
              >
                <option value="">{t('app.common.states.all')}</option>
                {(name === 'status'
                  ? ['trialing', 'active', 'past_due', 'churned']
                  : name === 'plan'
                    ? ['starter', 'growth', 'scale']
                    : ['organic', 'paid_search', 'referral', 'partner', 'outbound']
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
        renderGridItem={(customer, context) => summary(customer, context)}
        renderListItem={(customer, context) => summary(customer, context, true)}
        pagination={
          <AdminTablePagination
            pageIndex={query.data?.page ?? pagination.page}
            pageSize={query.data?.items_per_page ?? pagination.pageSize}
            totalCount={query.data?.total_count ?? 0}
            onPaginationChange={(page, pageSize) => setPagination({ page, pageSize })}
          />
        }
      />
      <CustomerFormDialog
        open={editing !== undefined}
        customer={editing ?? null}
        pending={save.isPending}
        onOpenChange={(open) => !open && setEditing(undefined)}
        onSubmit={(payload) => save.mutate(payload)}
      />
      <CustomerDetailDialog customer={details} locale={locale} onClose={() => setDetails(null)} />
    </AdminPage>
  );
}
