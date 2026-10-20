import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import invoiceService, { type InvoiceListParams } from '@/api/services/domains/invoiceService';
import ConfirmDialog from '@/components/admin/confirm-dialog';
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
import { useMatchRouteMeta, useRouter } from '@/router/hooks';
import type { Invoice, InvoiceStatus } from '#/domain';

type InvoiceFilters = {
  search: string;
  status: InvoiceStatus | '';
  sort: string;
};

const DEFAULT_SORT: Pick<InvoiceListParams, 'sort_by' | 'sort_order'> = {
  sort_by: 'issueDate',
  sort_order: 'desc',
};

const EMPTY_INVOICE_FILTERS: InvoiceFilters = {
  search: '',
  status: '',
  sort: `${DEFAULT_SORT.sort_by}:${DEFAULT_SORT.sort_order}`,
};

export default function InvoiceListPage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'pt_BR' ? 'pt-BR' : 'en-US';
  const permissions = useHasRequiredPermission(useMatchRouteMeta()?.label);
  const { mode, setMode } = useAdminDataViewMode();
  const router = useRouter();
  const client = useQueryClient();
  const [filters, setFilters] = useState<InvoiceFilters>(EMPTY_INVOICE_FILTERS);
  const searchForm = useForm<InvoiceFilters>({ defaultValues: EMPTY_INVOICE_FILTERS });
  const [sort, setSort] = useState(DEFAULT_SORT);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10 });
  const [selected, setSelected] = useState<string[]>([]);
  const query = useQuery({
    queryKey: ['domains', 'invoices', filters, sort, pagination],
    queryFn: () =>
      invoiceService.getInvoices({
        search: filters.search,
        status: filters.status,
        ...sort,
        page: pagination.page,
        items_per_page: pagination.pageSize,
      }),
  });
  const remove = useMutation({
    mutationFn: invoiceService.deleteInvoices,
    onSuccess: () => {
      setSelected([]);
      void client.invalidateQueries({ queryKey: ['domains', 'invoices'] });
      appToast.success(t('app.invoices.deleted'));
    },
    onError: (error) => appToast.error(t('app.invoices.deleteError'), error.message),
  });
  const invoices = query.data?.data ?? [];
  const money = (minor: number, currency: string) =>
    new Intl.NumberFormat(locale, { style: 'currency', currency }).format(minor / 100);
  const date = (value: string) =>
    new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(`${value}T12:00:00Z`));

  const actions = (invoice: Invoice) => (
    <div className="flex items-center gap-1">
      <Button
        size="icon"
        variant="ghost"
        aria-label={t('app.invoices.viewAria', { number: invoice.number })}
        onClick={() => router.push(`/revenue/invoices/${invoice.id}`)}
      >
        <Eye className="h-4 w-4" />
      </Button>
      {permissions.canUpdate ? (
        <Button
          size="icon"
          variant="ghost"
          aria-label={t('app.invoices.editAria', { number: invoice.number })}
          onClick={() => router.push(`/revenue/invoices/${invoice.id}/edit`)}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      ) : null}
      {permissions.canDelete ? (
        <ConfirmDialog
          title={t('app.invoices.deleteTitle')}
          description={t('app.common.confirm.irreversible')}
          confirmLabel={t('app.common.actions.delete')}
          cancelLabel={t('app.common.actions.cancel')}
          onConfirm={() => remove.mutate([invoice.id])}
          trigger={
            <Button
              size="icon"
              variant="ghost"
              aria-label={t('app.invoices.deleteAria', { number: invoice.number })}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          }
        />
      ) : null}
    </div>
  );

  const columns: ColumnDef<Invoice>[] = [
    ...(permissions.canDelete
      ? [
          {
            id: 'select',
            header: '',
            cell: ({ row }: { row: { original: Invoice } }) => (
              <input
                type="checkbox"
                aria-label={t('app.invoices.selectAria', { number: row.original.number })}
                checked={selected.includes(row.original.id)}
                onChange={(event) =>
                  setSelected((ids) =>
                    event.target.checked
                      ? [...ids, row.original.id]
                      : ids.filter((id) => id !== row.original.id),
                  )
                }
              />
            ),
          } satisfies ColumnDef<Invoice>,
        ]
      : []),
    { accessorKey: 'number', header: t('app.invoices.number') },
    { accessorKey: 'customer', header: t('app.invoices.customer') },
    { accessorKey: 'customerEmail', header: t('app.common.fields.email') },
    {
      accessorKey: 'issueDate',
      header: t('app.invoices.issueDate'),
      cell: ({ row }) => date(row.original.issueDate),
    },
    {
      accessorKey: 'total',
      header: t('app.invoices.total'),
      cell: ({ row }) => money(row.original.total, row.original.currency),
    },
    {
      accessorKey: 'status',
      header: t('app.invoices.status'),
      cell: ({ row }) => (
        <Badge variant={row.original.status === 'sent' ? 'default' : 'secondary'}>
          {t(`app.common.options.${row.original.status}`)}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: t('app.common.fields.actions'),
      cell: ({ row }) => actions(row.original),
    },
  ];

  const summary = (invoice: Invoice, context: AdminDataViewItemContext, compact = false) => (
    <Card className={compact ? 'shadow-none' : undefined} data-invoice-id={invoice.id}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base">{invoice.number}</CardTitle>
          <p className="text-sm text-muted-foreground">{invoice.customer}</p>
        </div>
        <div className="flex items-center gap-2">
          {permissions.canDelete ? (
            <input
              type="checkbox"
              aria-label={t('app.invoices.selectAria', { number: invoice.number })}
              checked={context.isSelected}
              onChange={context.toggleSelected}
            />
          ) : null}
          {context.actions}
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3 text-sm">
        <Badge variant={invoice.status === 'sent' ? 'default' : 'secondary'}>
          {t(`app.common.options.${invoice.status}`)}
        </Badge>
        <span className="text-right font-medium">{money(invoice.total, invoice.currency)}</span>
        <span>{date(invoice.issueDate)}</span>
        <span className="truncate text-right text-muted-foreground">{invoice.customerEmail}</span>
      </CardContent>
    </Card>
  );

  const onSearch = (values: InvoiceFilters) => {
    const [sort_by, sort_order] = values.sort.split(':') as [
      InvoiceListParams['sort_by'],
      InvoiceListParams['sort_order'],
    ];
    setFilters(values);
    setSort({ sort_by, sort_order });
    setPagination((current) => ({ ...current, page: 1 }));
  };

  const onSearchReset = () => {
    searchForm.reset(EMPTY_INVOICE_FILTERS);
    setFilters(EMPTY_INVOICE_FILTERS);
    setSort(DEFAULT_SORT);
    setPagination((current) => ({ ...current, page: 1 }));
  };

  const sortOptions = [
    { value: 'issueDate:desc', label: t('app.invoices.sortNewest') },
    { value: 'issueDate:asc', label: t('app.invoices.sortOldest') },
    { value: 'total:desc', label: t('app.invoices.sortHighest') },
    { value: 'total:asc', label: t('app.invoices.sortLowest') },
  ];

  return (
    <AdminListPage
      filters={
        <AdminForm form={searchForm} onSubmit={onSearch}>
          <AdminSearchPanel
            isLoading={query.isLoading}
            clearDisabled={!filters.search && !filters.status}
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
              options={[
                { value: 'draft', label: t('app.common.options.draft') },
                { value: 'sent', label: t('app.common.options.sent') },
              ]}
              disabled={query.isLoading}
            />
            <SearchFieldSelect
              control={searchForm.control}
              name="sort"
              label={t('app.invoices.sortAria')}
              options={sortOptions}
              disabled={query.isLoading}
            />
          </AdminSearchPanel>
        </AdminForm>
      }
      listTitle={t('app.invoices.invoiceList')}
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
          {permissions.canDelete && selected.length ? (
            <ConfirmDialog
              title={t('app.invoices.deleteSelectedTitle', { count: selected.length })}
              confirmLabel={t('app.common.actions.delete')}
              cancelLabel={t('app.common.actions.cancel')}
              onConfirm={() => remove.mutate(selected)}
              trigger={
                <Button variant="destructive" aria-label={t('app.invoices.deleteSelected')}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t('app.invoices.deleteSelected')}
                </Button>
              }
            />
          ) : null}
          {permissions.canCreate ? (
            <Button onClick={() => router.push('/revenue/invoices/new')}>
              <Plus className="mr-2 h-4 w-4" />
              {t('app.invoices.new')}
            </Button>
          ) : null}
        </>
      }
    >
      <AdminDataView
        data={invoices}
        getItemId={(invoice) => invoice.id}
        isLoading={query.isLoading}
        error={query.error}
        showToggle={false}
        selectedIds={selected}
        onSelectedIdsChange={setSelected}
        renderActions={actions}
        labels={{
          table: t('app.dataView.table'),
          grid: t('app.dataView.grid'),
          list: t('app.dataView.list'),
          loading: t('app.invoices.loading'),
          empty: t('app.invoices.empty'),
          error: t('app.invoices.loadListError'),
        }}
        renderTable={({ data }) => <AdminTable columns={columns} data={data} rowKey="id" />}
        renderGridItem={(invoice, context) => summary(invoice, context)}
        renderListItem={(invoice, context) => summary(invoice, context, true)}
        pagination={
          <AdminTablePagination
            pageIndex={query.data?.page ?? pagination.page}
            pageSize={query.data?.items_per_page ?? pagination.pageSize}
            totalCount={query.data?.total_count ?? 0}
            onPaginationChange={(page, pageSize) => setPagination({ page, pageSize })}
          />
        }
      />
    </AdminListPage>
  );
}
