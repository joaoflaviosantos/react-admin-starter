import type {
  Subscription,
  SubscriptionInput,
  SubscriptionPatch,
  SubscriptionStatus,
  SubscriptionStatusCounts,
} from '#/examples';

import { getState } from '../../store';
import type { ExamplesDomainHandler } from './domains';
import { appendAuditLog, mockError, paginate, readPagination, readRequestBody } from './shared';

const statuses: SubscriptionStatus[] = ['trialing', 'active', 'past_due', 'canceled'];
const plans = ['starter', 'growth', 'scale'];
const intervals = ['monthly', 'yearly'];
const isIsoDate = (value: unknown): value is string =>
  typeof value === 'string' && !Number.isNaN(Date.parse(value));
const integerAtLeast = (value: unknown, min: number) =>
  Number.isInteger(value) && Number(value) >= min;

function validSubscription(value: SubscriptionInput): boolean {
  return (
    !!value &&
    typeof value.customerId === 'string' &&
    plans.includes(value.plan) &&
    statuses.includes(value.status) &&
    intervals.includes(value.interval) &&
    integerAtLeast(value.seats, 1) &&
    integerAtLeast(value.unitPriceCents, 0) &&
    (value.trialEndsAt === null || isIsoDate(value.trialEndsAt)) &&
    isIsoDate(value.currentPeriodEnd) &&
    (value.trialEndsAt === null || value.trialEndsAt <= value.currentPeriodEnd) &&
    typeof value.cancelAtPeriodEnd === 'boolean'
  );
}

export const handleSubscriptionsRequest: ExamplesDomainHandler = ({
  config,
  method,
  pathname,
  user,
}) => {
  const store = getState().examples;
  const subscriptions = store.subscriptions;
  const baseUrl = '/v1/examples/revenue/subscriptions';

  if (method === 'GET' && pathname === baseUrl) {
    const params = config.params as Record<string, unknown> | undefined;
    const search = String(params?.search ?? '')
      .trim()
      .toLowerCase();
    const plan = String(params?.plan ?? '');
    const status = String(params?.status ?? '');
    const interval = String(params?.interval ?? '');
    const baseFiltered = subscriptions.filter((subscription) => {
      const customer = store.customers.find((item) => item.id === subscription.customerId);
      return (
        (!search || `${customer?.name ?? ''} ${subscription.id}`.toLowerCase().includes(search)) &&
        (!plan || subscription.plan === plan) &&
        (!interval || subscription.interval === interval)
      );
    });
    const filtered = baseFiltered.filter(
      (subscription) => !status || subscription.status === status,
    );
    const counts = statuses.reduce<SubscriptionStatusCounts>(
      (result, item) => ({
        ...result,
        [item]: baseFiltered.filter((subscription) => subscription.status === item).length,
      }),
      { all: baseFiltered.length, trialing: 0, active: 0, past_due: 0, canceled: 0 },
    );
    const { page, itemsPerPage } = readPagination(config);
    return {
      status: 200,
      data: { ...paginate(structuredClone(filtered), page, itemsPerPage), counts },
    };
  }

  if (method === 'POST' && pathname === baseUrl) {
    const payload = readRequestBody(config.data) as SubscriptionInput;
    if (
      !validSubscription(payload) ||
      !store.customers.some((customer) => customer.id === payload.customerId) ||
      subscriptions.some((subscription) => subscription.customerId === payload.customerId)
    ) {
      return mockError(422, 'Subscription payload is invalid.');
    }
    const timestamp = new Date().toISOString();
    const created: Subscription = {
      ...payload,
      id: `subscription-${crypto.randomUUID()}`,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    subscriptions.unshift(created);
    appendAuditLog(user, {
      action: 'subscription.created',
      resourceType: 'subscription',
      resourceId: created.id,
      summary: `Created subscription for ${created.customerId}`,
      metadata: { customerId: created.customerId, plan: created.plan, seats: created.seats },
    });
    return { status: 201, data: structuredClone(created) };
  }

  const lifecycleMatch = pathname.match(
    /^\/v1\/examples\/revenue\/subscriptions\/([^/]+)\/(cancel|reactivate)$/,
  );
  if (method === 'POST' && lifecycleMatch) {
    const subscription = subscriptions.find((item) => item.id === lifecycleMatch[1]);
    if (!subscription) return mockError(404, 'Subscription not found.');
    const action = lifecycleMatch[2];
    if (action === 'cancel') {
      if (subscription.status === 'canceled') {
        return { status: 200, data: structuredClone(subscription) };
      }
      if (!['trialing', 'active', 'past_due'].includes(subscription.status)) {
        return mockError(422, 'Subscription cannot be canceled.');
      }
      subscription.status = 'canceled';
      subscription.cancelAtPeriodEnd = true;
    } else {
      if (subscription.status === 'active') {
        return { status: 200, data: structuredClone(subscription) };
      }
      if (subscription.status !== 'canceled') {
        return mockError(422, 'Subscription cannot be reactivated.');
      }
      subscription.status = 'active';
      subscription.cancelAtPeriodEnd = false;
    }
    subscription.updatedAt = new Date().toISOString();
    appendAuditLog(user, {
      action: `subscription.${action === 'cancel' ? 'canceled' : 'reactivated'}`,
      resourceType: 'subscription',
      resourceId: subscription.id,
      summary: `${action === 'cancel' ? 'Canceled' : 'Reactivated'} subscription ${subscription.id}`,
      metadata: {
        status: subscription.status,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      },
    });
    return { status: 200, data: structuredClone(subscription) };
  }

  const match = pathname.match(/^\/v1\/examples\/revenue\/subscriptions\/([^/]+)$/);
  if (!match) return null;
  const subscription = subscriptions.find((item) => item.id === match[1]);
  if (!subscription) return mockError(404, 'Subscription not found.');
  if (method === 'GET') return { status: 200, data: structuredClone(subscription) };

  if (method === 'PATCH') {
    const payload = readRequestBody(config.data) as SubscriptionPatch;
    const merged = { ...subscription, ...payload } as SubscriptionInput;
    if (
      !payload ||
      !Object.keys(payload).length ||
      ('status' in payload && payload.status !== subscription.status) ||
      !validSubscription(merged) ||
      !store.customers.some((customer) => customer.id === merged.customerId) ||
      subscriptions.some(
        (item) => item.id !== subscription.id && item.customerId === merged.customerId,
      )
    ) {
      return mockError(422, 'Subscription payload is invalid.');
    }
    Object.assign(subscription, payload, { updatedAt: new Date().toISOString() });
    appendAuditLog(user, {
      action: 'subscription.updated',
      resourceType: 'subscription',
      resourceId: subscription.id,
      summary: `Updated subscription ${subscription.id}`,
      metadata: { plan: subscription.plan, seats: subscription.seats },
    });
    return { status: 200, data: structuredClone(subscription) };
  }

  if (method === 'DELETE') {
    subscriptions.splice(subscriptions.indexOf(subscription), 1);
    appendAuditLog(user, {
      action: 'subscription.deleted',
      resourceType: 'subscription',
      resourceId: subscription.id,
      summary: `Deleted subscription ${subscription.id}`,
      metadata: { customerId: subscription.customerId },
    });
    return { status: 200, data: { deleted: [subscription.id] } };
  }
  return null;
};
