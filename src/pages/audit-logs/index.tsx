import { useQuery } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import { Eye } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import auditLogService, { type AuditLogListParams } from '@/api/services/domains/auditLogService';
import { AdminTable, AdminTablePagination } from '@/components/admin/data-table';
import { AdminDataView, type AdminDataViewItemContext } from '@/components/admin/data-view';
import { AdminPage, AdminPageHeader } from '@/components/admin/page';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useMatchRouteMeta } from '@/router/hooks';
import { useHasRequiredPermission } from '@/hooks/permissions/use-has-required-permission';
import type { AuditLog } from '#/domain';

const filterClass =
  'h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-sm';

function AuditDetail({ event, onClose }: { event: AuditLog | null; onClose: () => void }) {
  const { t, i18n } = useTranslation();
  if (!event) return null;
  const date = new Intl.DateTimeFormat(i18n.language === 'pt_BR' ? 'pt-BR' : 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(event.createdAt));
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('app.auditLogs.details')}</DialogTitle>
        </DialogHeader>
        <DialogBody className="space-y-5">
          <div>
            <h3 className="font-semibold">{event.summary}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{date}</p>
          </div>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium uppercase text-muted-foreground">
                {t('app.auditLogs.actor')}
              </dt>
              <dd className="mt-1 text-sm">
                {event.actorName} · {event.actorEmail}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase text-muted-foreground">
                {t('app.auditLogs.action')}
              </dt>
              <dd className="mt-1 text-sm">
                <Badge variant="outline">{event.action}</Badge>
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase text-muted-foreground">
                {t('app.auditLogs.resource')}
              </dt>
              <dd className="mt-1 text-sm">
                {event.resourceType} · {event.resourceId}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase text-muted-foreground">
                {t('app.auditLogs.ipAddress')}
              </dt>
              <dd className="mt-1 text-sm">{event.ipAddress}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs font-medium uppercase text-muted-foreground">
                {t('app.auditLogs.userAgent')}
              </dt>
              <dd className="mt-1 break-words text-sm">{event.userAgent}</dd>
            </div>
          </dl>
          <div>
            <h4 className="text-xs font-medium uppercase text-muted-foreground">
              {t('app.auditLogs.metadata')}
            </h4>
            <pre className="mt-2 max-h-48 overflow-auto rounded-md bg-muted p-3 text-xs">
              {JSON.stringify(event.metadata, null, 2)}
            </pre>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button type="button" onClick={onClose}>
            {t('app.common.actions.close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function AuditLogsPage() {
  const { t, i18n } = useTranslation();
  useHasRequiredPermission(useMatchRouteMeta()?.label);
  const [filters, setFilters] = useState<AuditLogListParams>({
    search: '',
    actor: '',
    action: '',
    resource: '',
    from: '',
    to: '',
  });
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10 });
  const [details, setDetails] = useState<AuditLog | null>(null);
  const query = useQuery({
    queryKey: ['domains', 'audit-logs', filters, pagination],
    queryFn: () =>
      auditLogService.getAuditLogs({
        ...filters,
        page: pagination.page,
        items_per_page: pagination.pageSize,
      }),
  });
  const events = query.data?.data ?? [];
  const date = (value: string) =>
    new Intl.DateTimeFormat(i18n.language === 'pt_BR' ? 'pt-BR' : 'en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  const actions = (event: AuditLog) => (
    <Button
      size="icon"
      variant="ghost"
      aria-label={t('app.auditLogs.viewAria', { id: event.id })}
      onClick={() => setDetails(event)}
    >
      <Eye className="h-4 w-4" />
    </Button>
  );
  const columns: ColumnDef<AuditLog>[] = [
    {
      accessorKey: 'createdAt',
      header: t('app.auditLogs.date'),
      cell: ({ row }) => date(row.original.createdAt),
    },
    {
      id: 'actor',
      header: t('app.auditLogs.actor'),
      cell: ({ row }) => <span>{row.original.actorName}</span>,
    },
    {
      accessorKey: 'action',
      header: t('app.auditLogs.action'),
      cell: ({ row }) => <Badge variant="outline">{row.original.action}</Badge>,
    },
    {
      id: 'resource',
      header: t('app.auditLogs.resource'),
      cell: ({ row }) => `${row.original.resourceType} · ${row.original.resourceId}`,
    },
    { accessorKey: 'summary', header: t('app.auditLogs.summary') },
    {
      id: 'actions',
      header: t('app.common.fields.actions'),
      cell: ({ row }) => actions(row.original),
    },
  ];
  const summary = (event: AuditLog, context: AdminDataViewItemContext, compact = false) => (
    <Card className={compact ? 'shadow-none' : undefined} data-audit-id={event.id}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="min-w-0">
          <CardTitle className="truncate text-base">{event.summary}</CardTitle>
          <p className="text-xs text-muted-foreground">
            {event.actorName} · {date(event.createdAt)}
          </p>
        </div>
        {context.actions}
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-2 text-sm">
        <Badge variant="outline">{event.action}</Badge>
        <span>
          {event.resourceType} · {event.resourceId}
        </span>
      </CardContent>
    </Card>
  );
  const updateFilter = (name: keyof AuditLogListParams, value: string) => {
    setFilters((current) => ({ ...current, [name]: value }));
    setPagination((current) => ({ ...current, page: 1 }));
  };
  return (
    <AdminPage>
      <AdminPageHeader
        title={t('app.auditLogs.title')}
        description={t('app.auditLogs.description')}
      />
      <p className="mb-4 text-sm text-muted-foreground">{t('app.auditLogs.noActions')}</p>
      <AdminDataView
        data={events}
        getItemId={(event) => event.id}
        isLoading={query.isLoading}
        error={query.error}
        renderActions={actions}
        labels={{
          table: t('app.dataView.table'),
          grid: t('app.dataView.grid'),
          list: t('app.dataView.list'),
          loading: t('app.auditLogs.loading'),
          empty: t('app.auditLogs.empty'),
          error: t('app.auditLogs.loadError'),
        }}
        toolbar={
          <div className="flex flex-wrap gap-2">
            <Input
              className="min-w-52 flex-1"
              type="search"
              aria-label={t('app.auditLogs.searchAria')}
              value={filters.search}
              onChange={(event) => updateFilter('search', event.target.value)}
            />
            <Input
              className="w-36"
              aria-label={t('app.auditLogs.actorAria')}
              placeholder={t('app.auditLogs.actor')}
              value={filters.actor}
              onChange={(event) => updateFilter('actor', event.target.value)}
            />
            <Input
              className="w-36"
              aria-label={t('app.auditLogs.actionAria')}
              placeholder={t('app.auditLogs.action')}
              value={filters.action}
              onChange={(event) => updateFilter('action', event.target.value)}
            />
            <select
              className={filterClass}
              aria-label={t('app.auditLogs.resourceAria')}
              value={filters.resource}
              onChange={(event) => updateFilter('resource', event.target.value)}
            >
              <option value="">{t('app.common.states.all')}</option>
              {['customer', 'subscription', 'invoice', 'support_ticket', 'api_key'].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
            <Input
              className="w-36"
              type="date"
              aria-label={t('app.auditLogs.from')}
              value={filters.from}
              onChange={(event) => updateFilter('from', event.target.value)}
            />
            <Input
              className="w-36"
              type="date"
              aria-label={t('app.auditLogs.to')}
              value={filters.to}
              onChange={(event) => updateFilter('to', event.target.value)}
            />
          </div>
        }
        renderTable={({ data }) => <AdminTable columns={columns} data={data} rowKey="id" />}
        renderGridItem={(event, context) => summary(event, context)}
        renderListItem={(event, context) => summary(event, context, true)}
        pagination={
          <AdminTablePagination
            pageIndex={query.data?.page ?? pagination.page}
            pageSize={query.data?.items_per_page ?? pagination.pageSize}
            totalCount={query.data?.total_count ?? 0}
            onPaginationChange={(page, pageSize) => setPagination({ page, pageSize })}
          />
        }
      />
      <AuditDetail event={details} onClose={() => setDetails(null)} />
    </AdminPage>
  );
}
