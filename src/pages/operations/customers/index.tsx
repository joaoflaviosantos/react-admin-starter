import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import { Archive, Eye, Pencil, Plus } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import customerService, { type CustomerListParams } from '@/api/services/domains/customerService';
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
import type { Customer } from '#/domain';

import { CustomerCreateModal } from './customer-create-modal';
import { CustomerDeleteConfirmModal } from './customer-delete-confirm-modal';
import { CustomerDetailModal } from './customer-detail-modal';
import { CustomerEditModal } from './customer-edit-modal';

type CustomerFilters = {
  search: string;
  status: NonNullable<CustomerListParams['status']>;
  plan: NonNullable<CustomerListParams['plan']>;
};

const EMPTY_CUSTOMER_FILTERS: CustomerFilters = {
  search: '',
  status: '',
  plan: '',
};

export default function CustomersPage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'pt_BR' ? 'pt-BR' : 'en-US';
  const permissions = useHasRequiredPermission(useMatchRouteMeta()?.label);
  const { mode, setMode } = useAdminDataViewMode();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<CustomerFilters>(EMPTY_CUSTOMER_FILTERS);
  const searchForm = useForm<CustomerFilters>({ defaultValues: EMPTY_CUSTOMER_FILTERS });
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10 });
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [details, setDetails] = useState<Customer | null>(null);
  const [deleting, setDeleting] = useState<Customer | null>(null);

  const query = useQuery({
    queryKey: ['domains', 'customers', filters, pagination],
    queryFn: () =>
      customerService.getCustomers({
        ...filters,
        sort_by: 'healthScore',
        sort_order: 'asc',
        page: pagination.page,
        items_per_page: pagination.pageSize,
      }),
  });
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['domains', 'customers'] });
  const archive = useMutation({
    mutationFn: (id: string) => customerService.archiveCustomer(id),
    onSuccess: () => {
      setDeleting(null);
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
        <Button
          size="icon"
          variant="ghost"
          aria-label={t('app.customers.archiveAria', { name: customer.name })}
          onClick={() => setDeleting(customer)}
        >
          <Archive className="h-4 w-4" />
        </Button>
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

  const onSearch = (values: CustomerFilters) => {
    setFilters(values);
    setPagination((current) => ({ ...current, page: 1 }));
  };

  const onSearchReset = () => {
    searchForm.reset(EMPTY_CUSTOMER_FILTERS);
    setFilters(EMPTY_CUSTOMER_FILTERS);
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
              options={filterOptions(['trialing', 'active', 'past_due', 'churned'])}
              disabled={query.isLoading}
            />
            <SearchFieldSelect
              control={searchForm.control}
              name="plan"
              label={t('app.customers.plan')}
              placeholder={t('app.common.states.all')}
              options={filterOptions(['starter', 'growth', 'scale'])}
              disabled={query.isLoading}
            />
          </AdminSearchPanel>
        </AdminForm>
      }
      listTitle={t('app.customers.listTitle')}
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
              {t('app.customers.new')}
            </Button>
          ) : null}
        </>
      }
    >
      <AdminDataView
        data={customers}
        getItemId={(customer) => customer.id}
        isLoading={query.isLoading}
        error={query.error}
        showToggle={false}
        renderActions={actions}
        labels={{
          table: t('app.dataView.table'),
          grid: t('app.dataView.grid'),
          list: t('app.dataView.list'),
          loading: t('app.customers.loading'),
          empty: t('app.customers.empty'),
          error: t('app.customers.loadError'),
        }}
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
      <CustomerCreateModal open={creating} onOpenChange={setCreating} />
      <CustomerEditModal
        customer={editing}
        show={editing !== null}
        onClose={() => setEditing(null)}
      />
      <CustomerDetailModal customer={details} locale={locale} onClose={() => setDetails(null)} />
      <CustomerDeleteConfirmModal
        customer={deleting}
        show={deleting !== null}
        isPending={archive.isPending}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && archive.mutate(deleting.id)}
      />
    </AdminListPage>
  );
}
