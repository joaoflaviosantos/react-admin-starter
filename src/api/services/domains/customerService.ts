import apiClient from '@/api/apiClient';
import type {
  Customer,
  CustomerInput,
  CustomerPatch,
  CustomerPlan,
  CustomerSource,
  CustomerStatus,
} from '#/domain';

export type CustomerListParams = {
  search?: string;
  status?: CustomerStatus | '';
  plan?: CustomerPlan | '';
  source?: CustomerSource | '';
  sort_by?: 'name' | 'status' | 'plan' | 'mrrCents' | 'healthScore' | 'createdAt' | 'updatedAt';
  sort_order?: 'asc' | 'desc';
  page?: number;
  items_per_page?: number;
};

export type CustomerListResponse = {
  data: Customer[];
  total_count: number;
  has_more: boolean;
  page: number;
  items_per_page: number;
};

const baseUrl = '/v1/customers';
const getCustomers = (params: CustomerListParams = {}) =>
  apiClient.get<CustomerListResponse>({ url: baseUrl, params });
const getCustomer = (id: string) => apiClient.get<Customer>({ url: `${baseUrl}/${id}` });
const createCustomer = (payload: CustomerInput) =>
  apiClient.post<Customer>({ url: baseUrl, data: payload });
const updateCustomer = (id: string, payload: CustomerPatch) =>
  apiClient.patch<Customer>({ url: `${baseUrl}/${id}`, data: payload });
const archiveCustomer = (id: string) => apiClient.delete<Customer>({ url: `${baseUrl}/${id}` });

export default {
  getCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  archiveCustomer,
};
