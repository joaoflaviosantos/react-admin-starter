import apiClient from '@/api/apiClient';
import type { AuditLog } from '#/examples';

export type AuditLogListParams = {
  search?: string;
  actor?: string;
  action?: string;
  resource?: string;
  from?: string;
  to?: string;
  page?: number;
  items_per_page?: number;
};

export type AuditLogListResponse = {
  data: AuditLog[];
  total_count: number;
  has_more: boolean;
  page: number;
  items_per_page: number;
};

const baseUrl = '/v1/examples/platform/audit-logs';
const getAuditLogs = (params: AuditLogListParams = {}) =>
  apiClient.get<AuditLogListResponse>({ url: baseUrl, params });

export default { getAuditLogs };
