import apiClient from '@/api/apiClient';
import type { ApiKey, ApiKeyCreateResponse, ApiKeyInput } from '#/examples';

export type ApiKeyListParams = {
  search?: string;
  status?: 'active' | 'revoked' | '';
  page?: number;
  items_per_page?: number;
};

export type ApiKeyListResponse = {
  data: ApiKey[];
  total_count: number;
  has_more: boolean;
  page: number;
  items_per_page: number;
};

const baseUrl = '/v1/examples/platform/api-keys';

const getApiKeys = (params: ApiKeyListParams = {}) =>
  apiClient.get<ApiKeyListResponse>({ url: baseUrl, params });
const createApiKey = (payload: ApiKeyInput) =>
  apiClient.post<ApiKeyCreateResponse>({ url: baseUrl, data: payload });
const revokeApiKey = (id: string) => apiClient.post<ApiKey>({ url: `${baseUrl}/${id}/revoke` });

export default { getApiKeys, createApiKey, revokeApiKey };
