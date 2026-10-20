import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { handleMockRequest } from '../../handlers';
import { getState, resetToSeed } from '../../store';

const adminHeaders = { Authorization: 'Bearer mock-token-user-admin' };
const viewerHeaders = { Authorization: 'Bearer mock-token-user-viewer' };
const request = (
  url: string,
  method = 'get',
  data?: unknown,
  params?: unknown,
  headers: Record<string, string> = adminHeaders,
) => handleMockRequest({ url, method, data, params, headers } as never);

const validTicket = {
  customerId: 'customer-acme',
  subject: 'Export is taking too long',
  requesterEmail: 'marina@acme.test',
  priority: 'high',
  status: 'open',
  assignee: 'Beatriz Silva',
  slaDueAt: '2026-10-02T12:00:00.000Z',
  description: 'The monthly billing export has remained pending for twenty minutes.',
} as const;

describe('Domain Support Tickets mock handler', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-30T12:00:00.000Z'));
    resetToSeed();
  });
  afterEach(() => vi.useRealTimers());

  it('combines search, status, priority and SLA filters with counts and pagination', () => {
    const response = request('/v1/support/tickets', 'get', undefined, {
      search: 'payment',
      status: 'open',
      priority: 'urgent',
      sla: 'overdue',
      page: 1,
      items_per_page: 1,
    });

    expect(response.status).toBe(200);
    expect(response.data).toMatchObject({
      total_count: 1,
      page: 1,
      items_per_page: 1,
      has_more: false,
      counts: { all: 1, open: 1, in_progress: 0, waiting: 0, resolved: 0, overdue: 1 },
    });
    expect((response.data as { data: { id: string }[] }).data.map((item) => item.id)).toEqual([
      'ticket-1001',
    ]);
  });

  it('creates, reads and edits every mutable field while recording sanitized audit context', () => {
    const created = request('/v1/support/tickets', 'post', validTicket);
    expect(created.status).toBe(201);
    expect(created.data).toMatchObject(validTicket);
    const id = (created.data as { id: string }).id;

    expect(request(`/v1/support/tickets/${id}`).data).toMatchObject({
      id,
      customerId: 'customer-acme',
      requesterEmail: 'marina@acme.test',
    });
    expect(
      request(`/v1/support/tickets/${id}`, 'patch', {
        subject: 'Export completed with missing rows',
        priority: 'urgent',
        assignee: 'Carlos Nunes',
      }).data,
    ).toMatchObject({
      id,
      subject: 'Export completed with missing rows',
      priority: 'urgent',
      assignee: 'Carlos Nunes',
      status: 'open',
    });
    expect(getState().domains.auditLogs[0]).toMatchObject({
      action: 'ticket.updated',
      resourceId: id,
      metadata: { priority: 'urgent', assignee: 'Carlos Nunes' },
    });
  });

  it('rejects invalid relationships and fields without mutating the store', () => {
    for (const payload of [
      { ...validTicket, customerId: 'missing' },
      { ...validTicket, subject: '' },
      { ...validTicket, requesterEmail: 'bad' },
      { ...validTicket, priority: 'critical' },
      { ...validTicket, assignee: '' },
      { ...validTicket, slaDueAt: 'bad' },
      { ...validTicket, description: '' },
    ]) {
      const before = structuredClone(getState().domains);
      expect(request('/v1/support/tickets', 'post', payload).status).toBe(422);
      expect(getState().domains).toEqual(before);
    }
    const before = structuredClone(getState().domains);
    expect(request('/v1/support/tickets/ticket-1001', 'patch', { status: 'resolved' }).status).toBe(
      422,
    );
    expect(getState().domains).toEqual(before);
  });

  it('enforces exact status transitions and reopens resolved tickets idempotently', () => {
    expect(
      request('/v1/support/tickets/ticket-1001/status', 'post', {
        status: 'in_progress',
      }).data,
    ).toMatchObject({ status: 'in_progress' });
    expect(
      request('/v1/support/tickets/ticket-1001/status', 'post', {
        status: 'waiting',
      }).data,
    ).toMatchObject({ status: 'waiting' });
    expect(
      request('/v1/support/tickets/ticket-1001/status', 'post', {
        status: 'resolved',
      }).data,
    ).toMatchObject({ status: 'resolved' });
    expect(
      request('/v1/support/tickets/ticket-1001/status', 'post', {
        status: 'waiting',
      }).status,
    ).toBe(422);

    const reopened = request('/v1/support/tickets/ticket-1001/reopen', 'post');
    expect(reopened.data).toMatchObject({ status: 'open' });
    const auditCount = getState().domains.auditLogs.length;
    expect(request('/v1/support/tickets/ticket-1001/reopen', 'post').data).toEqual(reopened.data);
    expect(getState().domains.auditLogs).toHaveLength(auditCount);
  });

  it('deletes a ticket and denies every viewer mutation before state changes', () => {
    expect(request('/v1/support/tickets/ticket-1005', 'delete').data).toEqual({
      deleted: ['ticket-1005'],
    });
    expect(getState().domains.supportTickets.some((item) => item.id === 'ticket-1005')).toBe(false);

    for (const [method, url, payload] of [
      ['post', '/v1/support/tickets', validTicket],
      ['patch', '/v1/support/tickets/ticket-1001', { priority: 'low' }],
      ['post', '/v1/support/tickets/ticket-1001/status', { status: 'in_progress' }],
      ['post', '/v1/support/tickets/ticket-1004/reopen', undefined],
      ['delete', '/v1/support/tickets/ticket-1001', undefined],
    ] as const) {
      const before = structuredClone(getState().domains);
      expect(request(url, method, payload, undefined, viewerHeaders).status).toBe(403);
      expect(getState().domains).toEqual(before);
    }
  });
});
