export type SupportTicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type SupportTicketStatus = 'open' | 'in_progress' | 'waiting' | 'resolved';
export type SupportTicketSla = 'overdue' | 'on_track';

export type SupportTicketInput = {
  customerId: string;
  subject: string;
  requesterEmail: string;
  priority: SupportTicketPriority;
  status: SupportTicketStatus;
  assignee: string;
  slaDueAt: string;
  description: string;
};

export type SupportTicketPatch = Partial<Omit<SupportTicketInput, 'status'>>;

export type SupportTicket = {
  id: string;
  customerId: string;
  subject: string;
  requesterEmail: string;
  priority: SupportTicketPriority;
  status: SupportTicketStatus;
  assignee: string;
  slaDueAt: string;
  createdAt: string;
  updatedAt: string;
  description: string;
};

export type SupportTicketCounts = Record<SupportTicketStatus, number> & {
  all: number;
  overdue: number;
};
