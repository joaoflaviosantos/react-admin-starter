import type {
  SupportTicket,
  SupportTicketCounts,
  SupportTicketInput,
  SupportTicketPatch,
  SupportTicketPriority,
  SupportTicketStatus,
} from '#/examples';

import { getState } from '../../store';
import type { ExamplesDomainHandler } from './domains';
import { appendAuditLog, mockError, paginate, readPagination, readRequestBody } from './shared';

const baseUrl = '/v1/examples/support/tickets';
const statuses: SupportTicketStatus[] = ['open', 'in_progress', 'waiting', 'resolved'];
const priorities: SupportTicketPriority[] = ['low', 'medium', 'high', 'urgent'];
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const text = (value: unknown, min: number, max: number): value is string =>
  typeof value === 'string' && value.trim().length >= min && value.trim().length <= max;
const isIsoDate = (value: unknown): value is string =>
  typeof value === 'string' && !Number.isNaN(Date.parse(value));
const isOverdue = (ticket: SupportTicket) =>
  ticket.status !== 'resolved' && Date.parse(ticket.slaDueAt) < Date.now();

function validTicket(value: SupportTicketInput): boolean {
  return (
    !!value &&
    typeof value.customerId === 'string' &&
    text(value.subject, 3, 160) &&
    typeof value.requesterEmail === 'string' &&
    emailPattern.test(value.requesterEmail.trim()) &&
    priorities.includes(value.priority) &&
    statuses.includes(value.status) &&
    text(value.assignee, 2, 120) &&
    isIsoDate(value.slaDueAt) &&
    text(value.description, 10, 2000)
  );
}

function normalize(value: SupportTicketInput): SupportTicketInput {
  return {
    ...value,
    customerId: value.customerId.trim(),
    subject: value.subject.trim(),
    requesterEmail: value.requesterEmail.trim().toLowerCase(),
    assignee: value.assignee.trim(),
    description: value.description.trim(),
  };
}

const transitions: Record<SupportTicketStatus, SupportTicketStatus[]> = {
  open: ['in_progress', 'waiting'],
  in_progress: ['waiting', 'resolved'],
  waiting: ['in_progress', 'resolved'],
  resolved: [],
};

export const handleTicketsRequest: ExamplesDomainHandler = ({ config, method, pathname, user }) => {
  const store = getState().examples;
  const tickets = store.supportTickets;

  if (method === 'GET' && pathname === baseUrl) {
    const params = config.params as Record<string, unknown> | undefined;
    const search = String(params?.search ?? '')
      .trim()
      .toLowerCase();
    const status = String(params?.status ?? '');
    const priority = String(params?.priority ?? '');
    const sla = String(params?.sla ?? '');
    const filtered = tickets
      .filter((ticket) => {
        const customer = store.customers.find((item) => item.id === ticket.customerId);
        const overdue = isOverdue(ticket);
        return (
          (!search ||
            `${ticket.subject} ${ticket.requesterEmail} ${ticket.assignee} ${ticket.description} ${customer?.name ?? ''}`
              .toLowerCase()
              .includes(search)) &&
          (!status || ticket.status === status) &&
          (!priority || ticket.priority === priority) &&
          (!sla || (sla === 'overdue' ? overdue : !overdue))
        );
      })
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
    const counts = statuses.reduce<SupportTicketCounts>(
      (result, item) => ({
        ...result,
        [item]: filtered.filter((ticket) => ticket.status === item).length,
      }),
      {
        all: filtered.length,
        open: 0,
        in_progress: 0,
        waiting: 0,
        resolved: 0,
        overdue: filtered.filter(isOverdue).length,
      },
    );
    const { page, itemsPerPage } = readPagination(config);
    return {
      status: 200,
      data: { ...paginate(structuredClone(filtered), page, itemsPerPage), counts },
    };
  }

  if (method === 'POST' && pathname === baseUrl) {
    const payload = readRequestBody(config.data) as SupportTicketInput;
    if (
      !validTicket(payload) ||
      payload.status !== 'open' ||
      !store.customers.some((customer) => customer.id === payload.customerId)
    ) {
      return mockError(422, 'Support ticket payload is invalid.');
    }
    const timestamp = new Date().toISOString();
    const created: SupportTicket = {
      ...normalize(payload),
      id: `ticket-${crypto.randomUUID()}`,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    tickets.unshift(created);
    appendAuditLog(user, {
      action: 'ticket.created',
      resourceType: 'support_ticket',
      resourceId: created.id,
      summary: `Created ticket ${created.subject}`,
      metadata: { customerId: created.customerId, priority: created.priority },
    });
    return { status: 201, data: structuredClone(created) };
  }

  const statusMatch = pathname.match(/^\/v1\/examples\/support\/tickets\/([^/]+)\/status$/);
  if (method === 'POST' && statusMatch) {
    const ticket = tickets.find((item) => item.id === statusMatch[1]);
    if (!ticket) return mockError(404, 'Support ticket not found.');
    const nextStatus = (readRequestBody(config.data) as { status?: unknown })?.status;
    if (!statuses.includes(nextStatus as SupportTicketStatus)) {
      return mockError(422, 'Support ticket status is invalid.');
    }
    if (nextStatus === ticket.status) return { status: 200, data: structuredClone(ticket) };
    if (!transitions[ticket.status].includes(nextStatus as SupportTicketStatus)) {
      return mockError(422, 'Support ticket transition is invalid.');
    }
    ticket.status = nextStatus as SupportTicketStatus;
    ticket.updatedAt = new Date().toISOString();
    appendAuditLog(user, {
      action: 'ticket.status_changed',
      resourceType: 'support_ticket',
      resourceId: ticket.id,
      summary: `Changed ticket ${ticket.id} to ${ticket.status}`,
      metadata: { status: ticket.status, priority: ticket.priority },
    });
    return { status: 200, data: structuredClone(ticket) };
  }

  const reopenMatch = pathname.match(/^\/v1\/examples\/support\/tickets\/([^/]+)\/reopen$/);
  if (method === 'POST' && reopenMatch) {
    const ticket = tickets.find((item) => item.id === reopenMatch[1]);
    if (!ticket) return mockError(404, 'Support ticket not found.');
    if (ticket.status === 'open') return { status: 200, data: structuredClone(ticket) };
    if (ticket.status !== 'resolved')
      return mockError(422, 'Only resolved tickets can be reopened.');
    ticket.status = 'open';
    ticket.updatedAt = new Date().toISOString();
    appendAuditLog(user, {
      action: 'ticket.reopened',
      resourceType: 'support_ticket',
      resourceId: ticket.id,
      summary: `Reopened ticket ${ticket.id}`,
      metadata: { status: ticket.status, priority: ticket.priority },
    });
    return { status: 200, data: structuredClone(ticket) };
  }

  const match = pathname.match(/^\/v1\/examples\/support\/tickets\/([^/]+)$/);
  if (!match) return null;
  const ticket = tickets.find((item) => item.id === match[1]);
  if (!ticket) return mockError(404, 'Support ticket not found.');
  if (method === 'GET') return { status: 200, data: structuredClone(ticket) };

  if (method === 'PATCH') {
    const payload = readRequestBody(config.data) as SupportTicketPatch & { status?: unknown };
    if (!payload || !Object.keys(payload).length || 'status' in payload) {
      return mockError(422, 'Support ticket payload is invalid.');
    }
    const merged = { ...ticket, ...payload } as SupportTicketInput;
    if (
      !validTicket(merged) ||
      !store.customers.some((customer) => customer.id === merged.customerId)
    ) {
      return mockError(422, 'Support ticket payload is invalid.');
    }
    Object.assign(ticket, normalize(merged), { updatedAt: new Date().toISOString() });
    appendAuditLog(user, {
      action: 'ticket.updated',
      resourceType: 'support_ticket',
      resourceId: ticket.id,
      summary: `Updated ticket ${ticket.subject}`,
      metadata: { priority: ticket.priority, assignee: ticket.assignee },
    });
    return { status: 200, data: structuredClone(ticket) };
  }

  if (method === 'DELETE') {
    tickets.splice(tickets.indexOf(ticket), 1);
    appendAuditLog(user, {
      action: 'ticket.deleted',
      resourceType: 'support_ticket',
      resourceId: ticket.id,
      summary: `Deleted ticket ${ticket.subject}`,
      metadata: { customerId: ticket.customerId },
    });
    return { status: 200, data: { deleted: [ticket.id] } };
  }
  return null;
};
