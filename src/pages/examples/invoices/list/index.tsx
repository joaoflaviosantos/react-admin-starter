import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import invoiceService, { type InvoiceListParams } from '@/api/services/examples/invoiceService';
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
import { useMatchRouteMeta, useRouter } from '@/router/hooks';
import type { Invoice, InvoiceStatus } from '#/examples';

const filterClass =
  'h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-sm';

export default function InvoiceListPage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'pt_BR' ? 'pt-BR' : 'en-US';
  const permissions = useHasRequiredPermission(useMatchRouteMeta()?.label);
  const router = useRouter();
  const client = useQueryClient();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<InvoiceStatus | ''>('');
  const [sort, setSort] = useState<Pick<InvoiceListParams, 'sort_by' | 'sort_order'>>({
    sort_by: 'issueDate',
    sort_order: 'desc',
  });
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10 });
  const [selected, setSelected] = useState<string[]>([]);
  const query = useQuery({
    queryKey: ['examples', 'invoices', search, status, sort, pagination],
    queryFn: () =>
      invoiceService.getInvoices({
        search,
        status,
        ...sort,
        page: pagination.page,
        items_per_page: pagination.pageSize,
      }),
  });
  const remove = useMutation({
    mutationFn: invoiceService.deleteInvoices,
    onSuccess: () => {
      setSelected([]);
      void client.invalidateQueries({ queryKey: ['examples', 'invoices'] });
      appToast.success(t('examples.invoices.deleted'));
    },
    onError: (error) => appToast.error(t('examples.invoices.deleteError'), error.message),
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
        aria-label={t('examples.invoices.viewAria', { number: invoice.number })}
        onClick={() => router.push(`/examples/revenue/invoices/${invoice.id}`)}
      >
        <Eye className="h-4 w-4" />
      </Button>
      {permissions.canUpdate ? (
        <Button
          size="icon"
          variant="ghost"
          aria-label={t('examples.invoices.editAria', { number: invoice.number })}
          onClick={() => router.push(`/examples/revenue/invoices/${invoice.id}/edit`)}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      ) : null}
      {permissions.canDelete ? (
        <ConfirmDialog
          title={t('examples.invoices.deleteTitle')}
          description={t('examples.common.confirm.irreversible')}
          confirmLabel={t('examples.common.actions.delete')}
          cancelLabel={t('examples.common.actions.cancel')}
          onConfirm={() => remove.mutate([invoice.id])}
          trigger={
            <Button
              size="icon"
              variant="ghost"
              aria-label={t('examples.invoices.deleteAria', { number: invoice.number })}
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
                aria-label={t('examples.invoices.selectAria', { number: row.original.number })}
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
    { accessorKey: 'number', header: t('examples.invoices.number') },
    { accessorKey: 'customer', header: t('examples.invoices.customer') },
    { accessorKey: 'customerEmail', header: t('examples.common.fields.email') },
    {
      accessorKey: 'issueDate',
      header: t('examples.invoices.issueDate'),
      cell: ({ row }) => date(row.original.issueDate),
    },
    {
      accessorKey: 'total',
      header: t('examples.invoices.total'),
      cell: ({ row }) => money(row.original.total, row.original.currency),
    },
    {
      accessorKey: 'status',
      header: t('examples.invoices.status'),
      cell: ({ row }) => (
        <Badge variant={row.original.status === 'sent' ? 'default' : 'secondary'}>
          {t(`examples.common.options.${row.original.status}`)}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: t('examples.common.fields.actions'),
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
              aria-label={t('examples.invoices.selectAria', { number: invoice.number })}
              checked={context.isSelected}
              onChange={context.toggleSelected}
            />
          ) : null}
          {context.actions}
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3 text-sm">
        <Badge variant={invoice.status === 'sent' ? 'default' : 'secondary'}>
          {t(`examples.common.options.${invoice.status}`)}
        </Badge>
        <span className="text-right font-medium">{money(invoice.total, invoice.currency)}</span>
        <span>{date(invoice.issueDate)}</span>
        <span className="truncate text-right text-muted-foreground">{invoice.customerEmail}</span>
      </CardContent>
    </Card>
  );

  const updateSort = (value: string) => {
    const [sort_by, sort_order] = value.split(':') as [
      InvoiceListParams['sort_by'],
      InvoiceListParams['sort_order'],
    ];
    setSort({ sort_by, sort_order });
    setPagination((current) => ({ ...current, page: 1 }));
  };

  return (
    <AdminPage>
      <AdminPageHeader
        title={t('examples.invoices.title')}
        description={t('examples.invoices.description')}
        actions={
          permissions.canCreate ? (
            <Button onClick={() => router.push('/examples/revenue/invoices/new')}>
              <Plus className="mr-2 h-4 w-4" />
              {t('examples.invoices.new')}
            </Button>
          ) : undefined
        }
      />
      <AdminDataView
        data={invoices}
        getItemId={(invoice) => invoice.id}
        isLoading={query.isLoading}
        error={query.error}
        selectedIds={selected}
        onSelectedIdsChange={setSelected}
        renderActions={actions}
        labels={{
          table: t('examples.dataView.table'),
          grid: t('examples.dataView.grid'),
          list: t('examples.dataView.list'),
          loading: t('examples.invoices.loading'),
          empty: t('examples.invoices.empty'),
          error: t('examples.invoices.loadListError'),
        }}
        toolbar={
          <div className="flex flex-wrap gap-2">
            <Input
              className="min-w-52 flex-1"
              type="search"
              aria-label={t('examples.invoices.searchAria')}
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPagination((current) => ({ ...current, page: 1 }));
              }}
            />
            <select
              className={filterClass}
              aria-label={t('examples.common.fields.status')}
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as InvoiceStatus | '');
                setPagination((current) => ({ ...current, page: 1 }));
              }}
            >
              <option value="">{t('examples.common.states.all')}</option>
              {(['draft', 'sent'] as const).map((value) => (
                <option key={value} value={value}>
                  {t(`examples.common.options.${value}`)}
                </option>
              ))}
            </select>
            <select
              className={filterClass}
              aria-label={t('examples.invoices.sortAria')}
              value={`${sort.sort_by}:${sort.sort_order}`}
              onChange={(event) => updateSort(event.target.value)}
            >
              <option value="issueDate:desc">{t('examples.invoices.sortNewest')}</option>
              <option value="issueDate:asc">{t('examples.invoices.sortOldest')}</option>
              <option value="total:desc">{t('examples.invoices.sortHighest')}</option>
              <option value="total:asc">{t('examples.invoices.sortLowest')}</option>
            </select>
            {permissions.canDelete && selected.length ? (
              <ConfirmDialog
                title={t('examples.invoices.deleteSelectedTitle', { count: selected.length })}
                confirmLabel={t('examples.common.actions.delete')}
                cancelLabel={t('examples.common.actions.cancel')}
                onConfirm={() => remove.mutate(selected)}
                trigger={
                  <Button variant="destructive" aria-label={t('examples.invoices.deleteSelected')}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    {t('examples.invoices.deleteSelected')}
                  </Button>
                }
              />
            ) : null}
          </div>
        }
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
    </AdminPage>
  );
}
