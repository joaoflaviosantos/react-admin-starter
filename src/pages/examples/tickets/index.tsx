import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import {
  CheckCircle2,
  Eye,
  PauseCircle,
  Pencil,
  Play,
  Plus,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import customerService from '@/api/services/examples/customerService';
import ticketService, { type TicketListParams } from '@/api/services/examples/ticketService';
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
import type {
  SupportTicket,
  SupportTicketInput,
  SupportTicketPatch,
  SupportTicketStatus,
} from '#/examples';

import { TicketDetailDialog } from './ticket-detail-dialog';
import { TicketFormDialog } from './ticket-form-dialog';

const filterClass =
  'h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-sm';
const isOverdue = (ticket: SupportTicket) =>
  ticket.status !== 'resolved' && Date.parse(ticket.slaDueAt) < Date.now();

export default function TicketsPage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'pt_BR' ? 'pt-BR' : 'en-US';
  const permissions = useHasRequiredPermission(useMatchRouteMeta()?.label);
  const client = useQueryClient();
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Pick<TicketListParams, 'status' | 'priority' | 'sla'>>({
    status: '',
    priority: '',
    sla: '',
  });
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10 });
  const [editing, setEditing] = useState<SupportTicket | null | undefined>(undefined);
  const [details, setDetails] = useState<SupportTicket | null>(null);

  const query = useQuery({
    queryKey: ['examples', 'tickets', search, filters, pagination],
    queryFn: () =>
      ticketService.getTickets({
        search,
        ...filters,
        page: pagination.page,
        items_per_page: pagination.pageSize,
      }),
  });
  const customerQuery = useQuery({
    queryKey: ['examples', 'customers', 'ticket-options'],
    queryFn: () => customerService.getCustomers({ page: 1, items_per_page: 100 }),
  });
  const customers = useMemo(() => customerQuery.data?.data ?? [], [customerQuery.data?.data]);
  const customerById = useMemo(
    () => new Map(customers.map((customer) => [customer.id, customer.name])),
    [customers],
  );
  const invalidate = () => client.invalidateQueries({ queryKey: ['examples', 'tickets'] });
  const save = useMutation({
    mutationFn: (payload: SupportTicketInput | SupportTicketPatch) =>
      editing
        ? ticketService.updateTicket(editing.id, payload as SupportTicketPatch)
        : ticketService.createTicket(payload as SupportTicketInput),
    onSuccess: () => {
      setEditing(undefined);
      void invalidate();
      appToast.success(t('examples.tickets.saved'));
    },
    onError: () => appToast.error(t('examples.tickets.saveError')),
  });
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: SupportTicketStatus }) =>
      ticketService.changeTicketStatus(id, status),
    onSuccess: () => {
      void invalidate();
      appToast.success(t('examples.tickets.statusUpdated'));
    },
    onError: () => appToast.error(t('examples.tickets.statusError')),
  });
  const reopen = useMutation({
    mutationFn: ticketService.reopenTicket,
    onSuccess: () => {
      void invalidate();
      appToast.success(t('examples.tickets.reopened'));
    },
    onError: () => appToast.error(t('examples.tickets.statusError')),
  });
  const remove = useMutation({
    mutationFn: ticketService.deleteTicket,
    onSuccess: () => {
      void invalidate();
      appToast.success(t('examples.tickets.deleted'));
    },
    onError: () => appToast.error(t('examples.tickets.deleteError')),
  });

  const tickets = query.data?.data ?? [];
  const option = (value: string) => t(`examples.common.options.${value}`);
  const date = (value: string) =>
    new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(
      new Date(value),
    );
  const customerName = (ticket: SupportTicket) =>
    customerById.get(ticket.customerId) ?? ticket.customerId;
  const transition = (ticket: SupportTicket, status: SupportTicketStatus) =>
    statusMutation.mutate({ id: ticket.id, status });

  const actions = (ticket: SupportTicket) => (
    <div className="flex items-center gap-1">
      <Button
        size="icon"
        variant="ghost"
        aria-label={t('examples.tickets.viewAria', { subject: ticket.subject })}
        onClick={() => setDetails(ticket)}
      >
        <Eye className="h-4 w-4" />
      </Button>
      {permissions.canUpdate ? (
        <>
          <Button
            size="icon"
            variant="ghost"
            aria-label={t('examples.tickets.editAria', { subject: ticket.subject })}
            onClick={() => setEditing(ticket)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          {ticket.status === 'open' ? (
            <>
              <Button
                size="icon"
                variant="ghost"
                aria-label={t('examples.tickets.startAria', { subject: ticket.subject })}
                onClick={() => transition(ticket, 'in_progress')}
              >
                <Play className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                aria-label={t('examples.tickets.waitAria', { subject: ticket.subject })}
                onClick={() => transition(ticket, 'waiting')}
              >
                <PauseCircle className="h-4 w-4" />
              </Button>
            </>
          ) : null}
          {ticket.status === 'in_progress' ? (
            <Button
              size="icon"
              variant="ghost"
              aria-label={t('examples.tickets.waitAria', { subject: ticket.subject })}
              onClick={() => transition(ticket, 'waiting')}
            >
              <PauseCircle className="h-4 w-4" />
            </Button>
          ) : null}
          {ticket.status === 'waiting' ? (
            <Button
              size="icon"
              variant="ghost"
              aria-label={t('examples.tickets.resumeAria', { subject: ticket.subject })}
              onClick={() => transition(ticket, 'in_progress')}
            >
              <Play className="h-4 w-4" />
            </Button>
          ) : null}
          {ticket.status === 'in_progress' || ticket.status === 'waiting' ? (
            <Button
              size="icon"
              variant="ghost"
              aria-label={t('examples.tickets.resolveAria', { subject: ticket.subject })}
              onClick={() => transition(ticket, 'resolved')}
            >
              <CheckCircle2 className="h-4 w-4" />
            </Button>
          ) : null}
          {ticket.status === 'resolved' ? (
            <Button
              size="icon"
              variant="ghost"
              aria-label={t('examples.tickets.reopenAria', { subject: ticket.subject })}
              onClick={() => reopen.mutate(ticket.id)}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          ) : null}
        </>
      ) : null}
      {permissions.canDelete ? (
        <ConfirmDialog
          title={t('examples.tickets.deleteTitle', { subject: ticket.subject })}
          description={t('examples.common.confirm.irreversible')}
          confirmLabel={t('examples.common.actions.delete')}
          cancelLabel={t('examples.common.actions.cancel')}
          onConfirm={() => remove.mutate(ticket.id)}
          trigger={
            <Button
              size="icon"
              variant="ghost"
              aria-label={t('examples.tickets.deleteAria', { subject: ticket.subject })}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          }
        />
      ) : null}
    </div>
  );

  const overdue = (ticket: SupportTicket) =>
    isOverdue(ticket) ? (
      <Badge variant="destructive">{t('examples.tickets.overdue')}</Badge>
    ) : (
      <Badge variant="outline">{t('examples.tickets.onTrack')}</Badge>
    );

  const columns: ColumnDef<SupportTicket>[] = [
    { accessorKey: 'subject', header: t('examples.tickets.subject') },
    {
      id: 'customer',
      header: t('examples.tickets.customer'),
      cell: ({ row }) => customerName(row.original),
    },
    {
      accessorKey: 'priority',
      header: t('examples.tickets.priority'),
      cell: ({ row }) => <Badge variant="outline">{option(row.original.priority)}</Badge>,
    },
    {
      accessorKey: 'status',
      header: t('examples.common.fields.status'),
      cell: ({ row }) => <Badge variant="secondary">{option(row.original.status)}</Badge>,
    },
    { accessorKey: 'assignee', header: t('examples.tickets.assignee') },
    {
      accessorKey: 'slaDueAt',
      header: t('examples.tickets.sla'),
      cell: ({ row }) => (
        <div className="space-y-1">
          <div>{date(row.original.slaDueAt)}</div>
          {overdue(row.original)}
        </div>
      ),
    },
    {
      id: 'actions',
      header: t('examples.common.fields.actions'),
      cell: ({ row }) => actions(row.original),
    },
  ];

  const summary = (ticket: SupportTicket, context: AdminDataViewItemContext, compact = false) => (
    <Card className={compact ? 'shadow-none' : undefined} data-ticket-id={ticket.id}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="min-w-0">
          <CardTitle className="truncate text-base">{ticket.subject}</CardTitle>
          <p className="text-sm text-muted-foreground">{customerName(ticket)}</p>
        </div>
        {context.actions}
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3 text-sm">
        <Badge variant="outline">{option(ticket.priority)}</Badge>
        <Badge variant="secondary">{option(ticket.status)}</Badge>
        <span>{ticket.assignee}</span>
        <span className="text-right">{overdue(ticket)}</span>
      </CardContent>
    </Card>
  );

  const updateFilter = (name: 'status' | 'priority' | 'sla', value: string) => {
    setFilters((current) => ({ ...current, [name]: value }));
    setPagination((current) => ({ ...current, page: 1 }));
  };
  const counts = query.data?.counts;

  return (
    <AdminPage>
      <AdminPageHeader
        title={t('examples.tickets.title')}
        description={t('examples.tickets.description')}
        actions={
          permissions.canCreate ? (
            <Button onClick={() => setEditing(null)}>
              <Plus className="mr-2 h-4 w-4" />
              {t('examples.tickets.new')}
            </Button>
          ) : undefined
        }
      />
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-6">
        {(['all', 'open', 'in_progress', 'waiting', 'resolved', 'overdue'] as const).map(
          (status) => (
            <Card key={status}>
              <CardContent className="p-4">
                <p className="text-xs font-medium uppercase text-muted-foreground">
                  {option(status)}
                </p>
                <p className="mt-1 text-2xl font-semibold" data-testid={`tickets-count-${status}`}>
                  {counts?.[status] ?? 0}
                </p>
              </CardContent>
            </Card>
          ),
        )}
      </div>
      <AdminDataView
        data={tickets}
        getItemId={(ticket) => ticket.id}
        isLoading={query.isLoading}
        error={query.error}
        renderActions={actions}
        labels={{
          table: t('examples.dataView.table'),
          grid: t('examples.dataView.grid'),
          list: t('examples.dataView.list'),
          loading: t('examples.tickets.loading'),
          empty: t('examples.tickets.empty'),
          error: t('examples.tickets.loadError'),
        }}
        toolbar={
          <div className="flex flex-wrap gap-2">
            <Input
              className="min-w-52 flex-1"
              type="search"
              aria-label={t('examples.tickets.searchAria')}
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPagination((current) => ({ ...current, page: 1 }));
              }}
            />
            {(['status', 'priority', 'sla'] as const).map((name) => (
              <select
                key={name}
                className={filterClass}
                aria-label={t(
                  name === 'status'
                    ? 'examples.common.fields.status'
                    : name === 'priority'
                      ? 'examples.tickets.priority'
                      : 'examples.tickets.slaStatus',
                )}
                value={filters[name]}
                onChange={(event) => updateFilter(name, event.target.value)}
              >
                <option value="">{t('examples.common.states.all')}</option>
                {(name === 'status'
                  ? ['open', 'in_progress', 'waiting', 'resolved']
                  : name === 'priority'
                    ? ['low', 'medium', 'high', 'urgent']
                    : ['overdue', 'on_track']
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
        renderGridItem={(ticket, context) => summary(ticket, context)}
        renderListItem={(ticket, context) => summary(ticket, context, true)}
        pagination={
          <AdminTablePagination
            pageIndex={query.data?.page ?? pagination.page}
            pageSize={query.data?.items_per_page ?? pagination.pageSize}
            totalCount={query.data?.total_count ?? 0}
            onPaginationChange={(page, pageSize) => setPagination({ page, pageSize })}
          />
        }
      />
      <TicketFormDialog
        open={editing !== undefined}
        ticket={editing ?? null}
        customers={customers}
        pending={save.isPending}
        onOpenChange={(open) => !open && setEditing(undefined)}
        onSubmit={(payload) => save.mutate(payload)}
      />
      <TicketDetailDialog
        ticket={details}
        customerName={details ? customerName(details) : ''}
        locale={locale}
        onClose={() => setDetails(null)}
      />
    </AdminPage>
  );
}
