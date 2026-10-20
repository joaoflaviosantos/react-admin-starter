import type {
  Customer,
  CustomerInput,
  CustomerPatch,
  CustomerPlan,
  CustomerSource,
  CustomerStatus,
} from '#/domain';

import { getState } from '../../store';
import type { DomainHandler } from './domains';
import { appendAuditLog, mockError, paginate, readPagination, readRequestBody } from './shared';

const customerStatuses: CustomerStatus[] = ['trialing', 'active', 'past_due', 'churned'];
const customerPlans: CustomerPlan[] = ['starter', 'growth', 'scale'];
const customerSources: CustomerSource[] = [
  'organic',
  'paid_search',
  'referral',
  'partner',
  'outbound',
];
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const text = (value: unknown, max = 120): value is string =>
  typeof value === 'string' && value.trim().length > 0 && value.trim().length <= max;
const integerBetween = (value: unknown, min: number, max = Number.MAX_SAFE_INTEGER) =>
  Number.isInteger(value) && Number(value) >= min && Number(value) <= max;

function validCustomer(value: CustomerInput): boolean {
  return (
    !!value &&
    text(value.name) &&
    text(value.contactName) &&
    typeof value.email === 'string' &&
    emailPattern.test(value.email.trim()) &&
    text(value.industry) &&
    customerSources.includes(value.source) &&
    customerStatuses.includes(value.status) &&
    customerPlans.includes(value.plan) &&
    integerBetween(value.mrrCents, 0) &&
    integerBetween(value.healthScore, 0, 100) &&
    integerBetween(value.seatsLimit, 1) &&
    integerBetween(value.seatsUsed, 0, value.seatsLimit)
  );
}

function normalizeCustomer(value: CustomerInput): CustomerInput {
  return {
    ...value,
    name: value.name.trim(),
    contactName: value.contactName.trim(),
    email: value.email.trim().toLowerCase(),
    industry: value.industry.trim(),
  };
}

export const handleCustomersRequest: DomainHandler = ({ config, method, pathname, user }) => {
  const customers = getState().domains.customers;
  if (method === 'GET' && pathname === '/v1/customers') {
    const params = config.params as Record<string, unknown> | undefined;
    const search = String(params?.search ?? '')
      .trim()
      .toLowerCase();
    const status = String(params?.status ?? '');
    const plan = String(params?.plan ?? '');
    const source = String(params?.source ?? '');
    const sortBy = String(params?.sort_by ?? 'createdAt') as keyof Customer;
    const direction = params?.sort_order === 'asc' ? 1 : -1;
    const sortable: (keyof Customer)[] = [
      'name',
      'status',
      'plan',
      'mrrCents',
      'healthScore',
      'createdAt',
      'updatedAt',
    ];
    const filtered = customers.filter(
      (customer) =>
        (!search ||
          `${customer.name} ${customer.contactName} ${customer.email} ${customer.industry}`
            .toLowerCase()
            .includes(search)) &&
        (!status || customer.status === status) &&
        (!plan || customer.plan === plan) &&
        (!source || customer.source === source),
    );
    if (sortable.includes(sortBy)) {
      filtered.sort((a, b) => {
        const left = a[sortBy];
        const right = b[sortBy];
        if (typeof left === 'number' && typeof right === 'number')
          return (left - right) * direction;
        return String(left).localeCompare(String(right), undefined, { numeric: true }) * direction;
      });
    }
    const { page, itemsPerPage } = readPagination(config);
    return { status: 200, data: paginate(structuredClone(filtered), page, itemsPerPage) };
  }

  if (method === 'POST' && pathname === '/v1/customers') {
    const payload = readRequestBody(config.data) as CustomerInput;
    if (
      !validCustomer(payload) ||
      customers.some((customer) => customer.email === payload.email.trim().toLowerCase())
    ) {
      return mockError(422, 'Customer payload is invalid.');
    }
    const timestamp = new Date().toISOString();
    const created: Customer = {
      ...normalizeCustomer(payload),
      id: `customer-${crypto.randomUUID()}`,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    customers.unshift(created);
    appendAuditLog(user, {
      action: 'customer.created',
      resourceType: 'customer',
      resourceId: created.id,
      summary: `Created customer ${created.name}`,
      metadata: { customerName: created.name, plan: created.plan },
    });
    return { status: 201, data: structuredClone(created) };
  }

  const match = pathname.match(/^\/v1\/customers\/([^/]+)$/);
  if (!match) return null;
  const customer = customers.find((item) => item.id === match[1]);
  if (!customer) return mockError(404, 'Customer not found.');
  if (method === 'GET') return { status: 200, data: structuredClone(customer) };

  if (method === 'PATCH') {
    const payload = readRequestBody(config.data) as CustomerPatch;
    const merged = { ...customer, ...payload } as CustomerInput;
    if (
      !payload ||
      !Object.keys(payload).length ||
      !validCustomer(merged) ||
      customers.some(
        (item) =>
          item.id !== customer.id && item.email === String(merged.email).trim().toLowerCase(),
      )
    ) {
      return mockError(422, 'Customer payload is invalid.');
    }
    Object.assign(customer, normalizeCustomer(merged), { updatedAt: new Date().toISOString() });
    appendAuditLog(user, {
      action: 'customer.updated',
      resourceType: 'customer',
      resourceId: customer.id,
      summary: `Updated customer ${customer.name}`,
      metadata: { plan: customer.plan, healthScore: customer.healthScore },
    });
    return { status: 200, data: structuredClone(customer) };
  }

  if (method === 'DELETE') {
    if (customer.status === 'churned') return { status: 200, data: structuredClone(customer) };
    customer.status = 'churned';
    customer.updatedAt = new Date().toISOString();
    appendAuditLog(user, {
      action: 'customer.archived',
      resourceType: 'customer',
      resourceId: customer.id,
      summary: `Archived customer ${customer.name}`,
      metadata: { customerName: customer.name },
    });
    return { status: 200, data: structuredClone(customer) };
  }
  return null;
};
