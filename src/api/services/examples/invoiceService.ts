import apiClient from '@/api/apiClient';
import type { Invoice, InvoiceInput, InvoicePatch, InvoiceStatus } from '#/examples';

export type InvoiceListParams = {
  search?: string;
  status?: InvoiceStatus | '';
  sort_by?: 'number' | 'customer' | 'issueDate' | 'total' | 'status';
  sort_order?: 'asc' | 'desc';
  page?: number;
  items_per_page?: number;
};
export type InvoiceListResponse = {
  data: Invoice[];
  total_count: number;
  has_more: boolean;
  page: number;
  items_per_page: number;
};
const baseUrl = '/v1/examples/revenue/invoices';

export const calculateInvoiceTotals = (
  input: Pick<InvoiceInput, 'items' | 'taxRateBps' | 'discountRateBps' | 'shippingAmount'>,
) => {
  const items = input.items.map((item) => ({
    ...item,
    id: `invoice-item-${crypto.randomUUID()}`,
    lineTotal: item.quantity * item.unitPrice,
  }));
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const taxAmount = Math.round((subtotal * input.taxRateBps) / 10000);
  const discountAmount = Math.round((subtotal * input.discountRateBps) / 10000);
  return {
    items,
    subtotal,
    taxAmount,
    discountAmount,
    total: subtotal + taxAmount - discountAmount + input.shippingAmount,
  };
};

const getInvoices = (params: InvoiceListParams = {}) =>
  apiClient.get<InvoiceListResponse>({ url: baseUrl, params });
const getInvoice = (id: string) => apiClient.get<Invoice>({ url: `${baseUrl}/${id}` });
const createInvoice = (payload: InvoiceInput) =>
  apiClient.post<Invoice>({ url: baseUrl, data: payload });
const updateInvoice = (id: string, payload: InvoicePatch) =>
  apiClient.patch<Invoice>({ url: `${baseUrl}/${id}`, data: payload });
const deleteInvoices = (ids: string[]) =>
  apiClient.post<{ deleted: string[] }>({ url: `${baseUrl}/bulk-delete`, data: { ids } });
const sendInvoice = (id: string) => apiClient.post<Invoice>({ url: `${baseUrl}/${id}/send` });

export default {
  getInvoices,
  getInvoice,
  createInvoice,
  updateInvoice,
  deleteInvoices,
  sendInvoice,
};
