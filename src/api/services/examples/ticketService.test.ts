import { beforeEach, describe, expect, it } from 'vitest';

import { resetToSeed } from '@/api/mock/store';
import { setItem } from '@/utils/storage';
import { StorageEnum } from '#/enum';

import ticketService from './ticketService';

describe('Ticket service', () => {
  beforeEach(() => {
    resetToSeed();
    localStorage.clear();
    setItem(StorageEnum.Token, { access_token: 'mock-token-user-admin', token_type: 'bearer' });
  });

  it('lists, creates, reads, updates, transitions, reopens and deletes tickets', async () => {
    expect(
      (
        await ticketService.getTickets({
          search: 'payment',
          status: 'open',
          priority: 'urgent',
          sla: 'overdue',
        })
      ).data[0]?.id,
    ).toBe('ticket-1001');
    const created = await ticketService.createTicket({
      customerId: 'customer-acme',
      subject: 'Export is taking too long',
      requesterEmail: 'marina@acme.test',
      priority: 'high',
      status: 'open',
      assignee: 'Beatriz Silva',
      slaDueAt: '2026-10-02T12:00:00.000Z',
      description: 'The monthly billing export has remained pending for twenty minutes.',
    });
    expect(await ticketService.getTicket(created.id)).toMatchObject({
      subject: 'Export is taking too long',
    });
    expect(await ticketService.updateTicket(created.id, { priority: 'urgent' })).toMatchObject({
      priority: 'urgent',
      status: 'open',
    });
    expect(await ticketService.changeTicketStatus(created.id, 'in_progress')).toMatchObject({
      status: 'in_progress',
    });
    expect(await ticketService.changeTicketStatus(created.id, 'resolved')).toMatchObject({
      status: 'resolved',
    });
    expect(await ticketService.reopenTicket(created.id)).toMatchObject({ status: 'open' });
    expect(await ticketService.deleteTicket(created.id)).toEqual({ deleted: [created.id] });
  });
});
