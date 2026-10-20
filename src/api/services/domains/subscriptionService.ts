import apiClient from '@/api/apiClient';
import type {
  CustomerPlan,
  Subscription,
  SubscriptionInput,
  SubscriptionInterval,
  SubscriptionPatch,
  SubscriptionStatus,
  SubscriptionStatusCounts,
} from '#/domain';

export type SubscriptionListParams = {
  search?: string;
  plan?: CustomerPlan | '';
  status?: SubscriptionStatus | '';
  interval?: SubscriptionInterval | '';
  page?: number;
  items_per_page?: number;
};

export type SubscriptionListResponse = {
  data: Subscription[];
  total_count: number;
  has_more: boolean;
  page: number;
  items_per_page: number;
  counts: SubscriptionStatusCounts;
};

const baseUrl = '/v1/revenue/subscriptions';
const getSubscriptions = (params: SubscriptionListParams = {}) =>
  apiClient.get<SubscriptionListResponse>({ url: baseUrl, params });
const getSubscription = (id: string) => apiClient.get<Subscription>({ url: `${baseUrl}/${id}` });
const createSubscription = (payload: SubscriptionInput) =>
  apiClient.post<Subscription>({ url: baseUrl, data: payload });
const updateSubscription = (id: string, payload: SubscriptionPatch) =>
  apiClient.patch<Subscription>({ url: `${baseUrl}/${id}`, data: payload });
const cancelSubscription = (id: string) =>
  apiClient.post<Subscription>({ url: `${baseUrl}/${id}/cancel` });
const reactivateSubscription = (id: string) =>
  apiClient.post<Subscription>({ url: `${baseUrl}/${id}/reactivate` });
const deleteSubscription = (id: string) =>
  apiClient.delete<{ deleted: string[] }>({ url: `${baseUrl}/${id}` });

export default {
  getSubscriptions,
  getSubscription,
  createSubscription,
  updateSubscription,
  cancelSubscription,
  reactivateSubscription,
  deleteSubscription,
};
