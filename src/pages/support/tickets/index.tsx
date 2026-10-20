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
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import customerService from '@/api/services/domains/customerService';
import ticketService, { type TicketListParams } from '@/api/services/domains/ticketService';
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
import type { SupportTicket, SupportTicketStatus } from '#/domain';

import { TicketCreateModal } from './ticket-create-modal';
import { TicketDeleteConfirmModal } from './ticket-delete-confirm-modal';
import { TicketDetailModal } from './ticket-detail-modal';
import { TicketEditModal } from './ticket-edit-modal';

type TicketFilters = {
  search: string;
  status: NonNullable<TicketListParams['status']>;
  priority: NonNullable<TicketListParams['priority']>;
};

const EMPTY_TICKET_FILTERS: TicketFilters = {
  search: '',
  status: '',
  priority: '',
};

const isOverdue = (ticket: SupportTicket) =>
  ticket.status !== 'resolved' && Date.parse(ticket.slaDueAt) < Date.now();

export default function TicketsPage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'pt_BR' ? 'pt-BR' : 'en-US';
  const permissions = useHasRequiredPermission(useMatchRouteMeta()?.label);
  const { mode, setMode } = useAdminDataViewMode();
  const client = useQueryClient();
  const [filters, setFilters] = useState<TicketFilters>(EMPTY_TICKET_FILTERS);
  const searchForm = useForm<TicketFilters>({ defaultValues: EMPTY_TICKET_FILTERS });
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10 });
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<SupportTicket | null>(null);
  const [details, setDetails] = useState<SupportTicket | null>(null);
  const [deleting, setDeleting] = useState<SupportTicket | null>(null);

  const query = useQuery({
    queryKey: ['domains', 'tickets', filters, pagination],
    queryFn: () =>
      ticketService.getTickets({
        ...filters,
        page: pagination.page,
        items_per_page: pagination.pageSize,
      }),
  });
  const customerQuery = useQuery({
    queryKey: ['domains', 'customers', 'ticket-options'],
    queryFn: () => customerService.getCustomers({ page: 1, items_per_page: 100 }),
  });
  const customers = useMemo(() => customerQuery.data?.data ?? [], [customerQuery.data?.data]);
  const customerById = useMemo(
    () => new Map(customers.map((customer) => [customer.id, customer.name])),
    [customers],
  );
  const invalidate = () => client.invalidateQueries({ queryKey: ['domains', 'tickets'] });
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: SupportTicketStatus }) =>
      ticketService.changeTicketStatus(id, status),
    onSuccess: () => {
      void invalidate();
      appToast.success(t('app.tickets.statusUpdated'));
    },
    onError: () => appToast.error(t('app.tickets.statusError')),
  });
  const reopen = useMutation({
    mutationFn: ticketService.reopenTicket,
    onSuccess: () => {
      void invalidate();
      appToast.success(t('app.tickets.reopened'));
    },
    onError: () => appToast.error(t('app.tickets.statusError')),
  });
  const remove = useMutation({
    mutationFn: ticketService.deleteTicket,
    onSuccess: () => {
      setDeleting(null);
      void invalidate();
      appToast.success(t('app.tickets.deleted'));
    },
    onError: () => appToast.error(t('app.tickets.deleteError')),
  });

  const tickets = query.data?.data ?? [];
  const option = (value: string) => t(`app.common.options.${value}`);
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
        aria-label={t('app.tickets.viewAria', { subject: ticket.subject })}
        onClick={() => setDetails(ticket)}
      >
        <Eye className="h-4 w-4" />
      </Button>
      {permissions.canUpdate ? (
        <>
          <Button
            size="icon"
            variant="ghost"
            aria-label={t('app.tickets.editAria', { subject: ticket.subject })}
            onClick={() => setEditing(ticket)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          {ticket.status === 'open' ? (
            <>
              <Button
                size="icon"
                variant="ghost"
                aria-label={t('app.tickets.startAria', { subject: ticket.subject })}
                onClick={() => transition(ticket, 'in_progress')}
              >
                <Play className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                aria-label={t('app.tickets.waitAria', { subject: ticket.subject })}
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
              aria-label={t('app.tickets.waitAria', { subject: ticket.subject })}
              onClick={() => transition(ticket, 'waiting')}
            >
              <PauseCircle className="h-4 w-4" />
            </Button>
          ) : null}
          {ticket.status === 'waiting' ? (
            <Button
              size="icon"
              variant="ghost"
              aria-label={t('app.tickets.resumeAria', { subject: ticket.subject })}
              onClick={() => transition(ticket, 'in_progress')}
            >
              <Play className="h-4 w-4" />
            </Button>
          ) : null}
          {ticket.status === 'in_progress' || ticket.status === 'waiting' ? (
            <Button
              size="icon"
              variant="ghost"
              aria-label={t('app.tickets.resolveAria', { subject: ticket.subject })}
              onClick={() => transition(ticket, 'resolved')}
            >
              <CheckCircle2 className="h-4 w-4" />
            </Button>
          ) : null}
          {ticket.status === 'resolved' ? (
            <Button
              size="icon"
              variant="ghost"
              aria-label={t('app.tickets.reopenAria', { subject: ticket.subject })}
              onClick={() => reopen.mutate(ticket.id)}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          ) : null}
        </>
      ) : null}
      {permissions.canDelete ? (
        <Button
          size="icon"
          variant="ghost"
          aria-label={t('app.tickets.deleteAria', { subject: ticket.subject })}
          onClick={() => setDeleting(ticket)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      ) : null}
    </div>
  );

  const overdue = (ticket: SupportTicket) =>
    isOverdue(ticket) ? (
      <Badge variant="destructive">{t('app.tickets.overdue')}</Badge>
    ) : (
      <Badge variant="outline">{t('app.tickets.onTrack')}</Badge>
    );

  const columns: ColumnDef<SupportTicket>[] = [
    { accessorKey: 'subject', header: t('app.tickets.subject') },
    {
      id: 'customer',
      header: t('app.tickets.customer'),
      cell: ({ row }) => customerName(row.original),
    },
    {
      accessorKey: 'priority',
      header: t('app.tickets.priority'),
      cell: ({ row }) => <Badge variant="outline">{option(row.original.priority)}</Badge>,
    },
    {
      accessorKey: 'status',
      header: t('app.common.fields.status'),
      cell: ({ row }) => <Badge variant="secondary">{option(row.original.status)}</Badge>,
    },
    { accessorKey: 'assignee', header: t('app.tickets.assignee') },
    {
      accessorKey: 'slaDueAt',
      header: t('app.tickets.sla'),
      cell: ({ row }) => (
        <div className="space-y-1">
          <div>{date(row.original.slaDueAt)}</div>
          {overdue(row.original)}
        </div>
      ),
    },
    {
      id: 'actions',
      header: t('app.common.fields.actions'),
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

  const onSearch = (values: TicketFilters) => {
    setFilters(values);
    setPagination((current) => ({ ...current, page: 1 }));
  };

  const onSearchReset = () => {
    searchForm.reset(EMPTY_TICKET_FILTERS);
    setFilters(EMPTY_TICKET_FILTERS);
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
              options={filterOptions(['open', 'in_progress', 'waiting', 'resolved'])}
              disabled={query.isLoading}
            />
            <SearchFieldSelect
              control={searchForm.control}
              name="priority"
              label={t('app.tickets.priority')}
              placeholder={t('app.common.states.all')}
              options={filterOptions(['low', 'medium', 'high', 'urgent'])}
              disabled={query.isLoading}
            />
          </AdminSearchPanel>
        </AdminForm>
      }
      listTitle={t('app.tickets.listTitle')}
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
              {t('app.tickets.new')}
            </Button>
          ) : null}
        </>
      }
    >
      <AdminDataView
        data={tickets}
        getItemId={(ticket) => ticket.id}
        isLoading={query.isLoading}
        error={query.error}
        showToggle={false}
        renderActions={actions}
        labels={{
          table: t('app.dataView.table'),
          grid: t('app.dataView.grid'),
          list: t('app.dataView.list'),
          loading: t('app.tickets.loading'),
          empty: t('app.tickets.empty'),
          error: t('app.tickets.loadError'),
        }}
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
      <TicketCreateModal open={creating} customers={customers} onOpenChange={setCreating} />
      <TicketEditModal
        ticket={editing}
        customers={customers}
        show={editing !== null}
        onClose={() => setEditing(null)}
      />
      <TicketDetailModal
        ticket={details}
        customerName={details ? customerName(details) : ''}
        locale={locale}
        onClose={() => setDetails(null)}
      />
      <TicketDeleteConfirmModal
        ticket={deleting}
        show={deleting !== null}
        isPending={remove.isPending}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && remove.mutate(deleting.id)}
      />
    </AdminListPage>
  );
}
