import apiClient from '@/api/apiClient';
import type {
  SupportTicket,
  SupportTicketCounts,
  SupportTicketInput,
  SupportTicketPatch,
  SupportTicketPriority,
  SupportTicketSla,
  SupportTicketStatus,
} from '#/examples';

export type TicketListParams = {
  search?: string;
  status?: SupportTicketStatus | '';
  priority?: SupportTicketPriority | '';
  sla?: SupportTicketSla | '';
  page?: number;
  items_per_page?: number;
};

export type TicketListResponse = {
  data: SupportTicket[];
  total_count: number;
  has_more: boolean;
  page: number;
  items_per_page: number;
  counts: SupportTicketCounts;
};

const baseUrl = '/v1/examples/support/tickets';
const getTickets = (params: TicketListParams = {}) =>
  apiClient.get<TicketListResponse>({ url: baseUrl, params });
const getTicket = (id: string) => apiClient.get<SupportTicket>({ url: `${baseUrl}/${id}` });
const createTicket = (payload: SupportTicketInput) =>
  apiClient.post<SupportTicket>({ url: baseUrl, data: payload });
const updateTicket = (id: string, payload: SupportTicketPatch) =>
  apiClient.patch<SupportTicket>({ url: `${baseUrl}/${id}`, data: payload });
const changeTicketStatus = (id: string, status: SupportTicketStatus) =>
  apiClient.post<SupportTicket>({ url: `${baseUrl}/${id}/status`, data: { status } });
const reopenTicket = (id: string) =>
  apiClient.post<SupportTicket>({ url: `${baseUrl}/${id}/reopen` });
const deleteTicket = (id: string) =>
  apiClient.delete<{ deleted: string[] }>({ url: `${baseUrl}/${id}` });

export default {
  getTickets,
  getTicket,
  createTicket,
  updateTicket,
  changeTicketStatus,
  reopenTicket,
  deleteTicket,
};
