import { useQuery } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import type { TFunction } from 'i18next';
import { Eye } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import auditLogService, { type AuditLogListParams } from '@/api/services/domains/auditLogService';
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
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useMatchRouteMeta } from '@/router/hooks';
import { useHasRequiredPermission } from '@/hooks/permissions/use-has-required-permission';
import type { AuditLog } from '#/domain';

type AuditFilters = Pick<AuditLogListParams, 'search' | 'action' | 'resource'>;

const EMPTY_AUDIT_FILTERS: AuditFilters = {
  search: '',
  action: '',
  resource: '',
};

const fallbackLabel = (value: string) => {
  const label = value.replace(/[._]/g, ' ').trim();
  return label.charAt(0).toUpperCase() + label.slice(1);
};

const actionLabel = (action: string, t: TFunction) => {
  const key = action.replace(/\./g, '_');
  const label = t(`app.auditLogs.actions.${key}`, { defaultValue: '' });
  return label || fallbackLabel(action);
};

const resourceLabel = (resource: string, t: TFunction) =>
  t(`app.auditLogs.resourceTypes.${resource}`, { defaultValue: fallbackLabel(resource) });

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
                <Badge variant="outline" title={event.action}>
                  {actionLabel(event.action, t)}
                </Badge>
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase text-muted-foreground">
                {t('app.auditLogs.resource')}
              </dt>
              <dd className="mt-1 min-w-0 text-sm">
                <div className="truncate">{resourceLabel(event.resourceType, t)}</div>
                <div className="truncate font-mono text-xs text-muted-foreground">
                  {event.resourceId}
                </div>
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
  const { mode, setMode } = useAdminDataViewMode();
  const [filters, setFilters] = useState<AuditFilters>(EMPTY_AUDIT_FILTERS);
  const searchForm = useForm<AuditFilters>({ defaultValues: EMPTY_AUDIT_FILTERS });
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
      cell: ({ row }) => (
        <Badge variant="outline" title={row.original.action}>
          {actionLabel(row.original.action, t)}
        </Badge>
      ),
    },
    {
      id: 'resource',
      header: t('app.auditLogs.resource'),
      cell: ({ row }) => (
        <div className="min-w-0">
          <div className="truncate">{resourceLabel(row.original.resourceType, t)}</div>
          <div className="truncate font-mono text-xs text-muted-foreground">
            {row.original.resourceId}
          </div>
        </div>
      ),
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
      <CardContent className="flex flex-wrap items-start gap-2 text-sm">
        <Badge variant="outline" title={event.action}>
          {actionLabel(event.action, t)}
        </Badge>
        <div className="min-w-0">
          <div className="truncate">{resourceLabel(event.resourceType, t)}</div>
          <div className="truncate font-mono text-xs text-muted-foreground">{event.resourceId}</div>
        </div>
      </CardContent>
    </Card>
  );
  const onSearch = (values: AuditFilters) => {
    setFilters(values);
    setPagination((current) => ({ ...current, page: 1 }));
  };

  const onSearchReset = () => {
    searchForm.reset(EMPTY_AUDIT_FILTERS);
    setFilters(EMPTY_AUDIT_FILTERS);
    setPagination((current) => ({ ...current, page: 1 }));
  };

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
            <SearchFieldInput
              control={searchForm.control}
              name="action"
              label={t('app.auditLogs.action')}
              disabled={query.isLoading}
            />
            <SearchFieldSelect
              control={searchForm.control}
              name="resource"
              label={t('app.auditLogs.resource')}
              placeholder={t('app.common.states.all')}
              options={['customer', 'subscription', 'invoice', 'support_ticket', 'api_key'].map(
                (value) => ({ value, label: resourceLabel(value, t) }),
              )}
              disabled={query.isLoading}
            />
          </AdminSearchPanel>
        </AdminForm>
      }
      listTitle={t('app.auditLogs.listTitle')}
      listActions={
        <DataViewToggle
          mode={mode}
          onChange={setMode}
          labels={{
            table: t('app.dataView.table'),
            grid: t('app.dataView.grid'),
            list: t('app.dataView.list'),
          }}
        />
      }
    >
      <AdminDataView
        data={events}
        getItemId={(event) => event.id}
        isLoading={query.isLoading}
        error={query.error}
        showToggle={false}
        renderActions={actions}
        labels={{
          table: t('app.dataView.table'),
          grid: t('app.dataView.grid'),
          list: t('app.dataView.list'),
          loading: t('app.auditLogs.loading'),
          empty: t('app.auditLogs.empty'),
          error: t('app.auditLogs.loadError'),
        }}
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
    </AdminListPage>
  );
}
