import type { Invoice, InvoiceInput, InvoicePatch } from '#/domain';

import { getState } from '../../store';
import type { DomainHandler } from './domains';
import { appendAuditLog, mockError, paginate, readPagination, readRequestBody } from './shared';

const baseUrl = '/v1/revenue/invoices';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const text = (value: unknown, max = 120): value is string =>
  typeof value === 'string' && value.trim().length > 0 && value.trim().length <= max;
const integerBetween = (value: unknown, min: number, max = Number.MAX_SAFE_INTEGER) =>
  Number.isInteger(value) && Number(value) >= min && Number(value) <= max;

function validInput(value: InvoiceInput): boolean {
  return (
    !!value &&
    text(value.number, 60) &&
    text(value.label) &&
    /^\d{4}-\d{2}-\d{2}$/.test(value.issueDate) &&
    /^\d{4}-\d{2}-\d{2}$/.test(value.dueDate) &&
    value.dueDate >= value.issueDate &&
    text(value.customer) &&
    emailPattern.test(value.customerEmail) &&
    text(value.billing, 500) &&
    /^[A-Z]{3}$/.test(value.currency) &&
    text(value.paymentMethod) &&
    (value.notes === undefined ||
      (typeof value.notes === 'string' && value.notes.length <= 1000)) &&
    Array.isArray(value.items) &&
    value.items.length > 0 &&
    value.items.every(
      (item) =>
        text(item.description, 200) &&
        typeof item.quantity === 'number' &&
        item.quantity > 0 &&
        integerBetween(item.unitPrice, 0),
    ) &&
    integerBetween(value.taxRateBps, 0, 10000) &&
    integerBetween(value.discountRateBps, 0, 10000) &&
    integerBetween(value.shippingAmount, 0)
  );
}

function totals(
  input: Pick<InvoiceInput, 'items' | 'taxRateBps' | 'discountRateBps' | 'shippingAmount'>,
  previous?: Invoice['items'],
) {
  const items = input.items.map((item, index) => ({
    ...item,
    id: previous?.[index]?.id ?? `invoice-item-${crypto.randomUUID()}`,
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
}

export const handleInvoicesRequest: DomainHandler = ({ config, method, pathname, user }) => {
  const invoices = getState().domains.invoices;
  if (method === 'GET' && pathname === baseUrl) {
    const params = config.params as Record<string, unknown> | undefined;
    const search = String(params?.search ?? '')
      .trim()
      .toLowerCase();
    const status = String(params?.status ?? '');
    const sortBy = String(params?.sort_by ?? 'issueDate') as keyof Invoice;
    const direction = params?.sort_order === 'asc' ? 1 : -1;
    const allowed = ['number', 'customer', 'issueDate', 'total', 'status'];
    const filtered = invoices.filter(
      (item) =>
        (!search ||
          `${item.number} ${item.label} ${item.customer} ${item.customerEmail} ${item.status}`
            .toLowerCase()
            .includes(search)) &&
        (!status || item.status === status),
    );
    if (allowed.includes(sortBy))
      filtered.sort(
        (a, b) =>
          String(a[sortBy]).localeCompare(String(b[sortBy]), undefined, { numeric: true }) *
          direction,
      );
    const { page, itemsPerPage } = readPagination(config);
    return { status: 200, data: paginate(structuredClone(filtered), page, itemsPerPage) };
  }
  if (method === 'POST' && pathname === baseUrl) {
    const payload = readRequestBody(config.data) as InvoiceInput;
    if (
      !validInput(payload) ||
      invoices.some((item) => item.number.toLowerCase() === payload.number.trim().toLowerCase())
    )
      return mockError(422, 'Invoice payload is invalid.');
    const timestamp = new Date().toISOString();
    const normalized = {
      ...payload,
      number: payload.number.trim(),
      label: payload.label.trim(),
      customer: payload.customer.trim(),
      customerEmail: payload.customerEmail.trim().toLowerCase(),
      billing: payload.billing.trim(),
      currency: payload.currency,
      paymentMethod: payload.paymentMethod.trim(),
      notes: payload.notes?.trim(),
    };
    const created: Invoice = {
      ...normalized,
      ...totals(normalized),
      id: `invoice-${crypto.randomUUID()}`,
      created_at: timestamp,
      updated_at: timestamp,
      status: 'draft',
    };
    invoices.unshift(created);
    appendAuditLog(user, {
      action: 'invoice.created',
      resourceType: 'invoice',
      resourceId: created.id,
      summary: `Created invoice ${created.number}`,
      metadata: { invoiceNumber: created.number, totalCents: created.total },
    });
    return { status: 201, data: structuredClone(created) };
  }
  if (method === 'POST' && pathname === `${baseUrl}/bulk-delete`) {
    const requested = (readRequestBody(config.data) as { ids?: unknown })?.ids;
    if (
      !Array.isArray(requested) ||
      !requested.length ||
      requested.some((id) => typeof id !== 'string')
    )
      return mockError(422, 'Invoice IDs are required.');
    const ids = [...new Set(requested as string[])];
    if (ids.some((id) => !invoices.some((item) => item.id === id)))
      return mockError(404, 'Invoice not found.');
    for (const id of ids)
      invoices.splice(
        invoices.findIndex((item) => item.id === id),
        1,
      );
    for (const id of ids) {
      appendAuditLog(user, {
        action: 'invoice.deleted',
        resourceType: 'invoice',
        resourceId: id,
        summary: `Deleted invoice ${id}`,
        metadata: { bulk: ids.length > 1 },
      });
    }
    return { status: 200, data: { deleted: ids } };
  }
  const sendMatch = pathname.match(/^\/v1\/revenue\/invoices\/([^/]+)\/send$/);
  if (sendMatch && method === 'POST') {
    const invoice = invoices.find((item) => item.id === sendMatch[1]);
    if (!invoice) return mockError(404, 'Invoice not found.');
    if (invoice.status !== 'draft') return mockError(422, 'Only draft invoices can be sent.');
    invoice.status = 'sent';
    invoice.sentAt = new Date().toISOString();
    invoice.updated_at = invoice.sentAt;
    appendAuditLog(user, {
      action: 'invoice.sent',
      resourceType: 'invoice',
      resourceId: invoice.id,
      summary: `Sent invoice ${invoice.number}`,
      metadata: { invoiceNumber: invoice.number, totalCents: invoice.total },
    });
    return { status: 200, data: structuredClone(invoice) };
  }
  const match = pathname.match(/^\/v1\/revenue\/invoices\/([^/]+)$/);
  if (!match) return null;
  const invoice = invoices.find((item) => item.id === match[1]);
  if (!invoice) return mockError(404, 'Invoice not found.');
  if (method === 'GET') return { status: 200, data: structuredClone(invoice) };
  if (method === 'PATCH') {
    const payload = readRequestBody(config.data) as InvoicePatch;
    const merged = { ...invoice, ...payload } as InvoiceInput;
    if (!payload || !Object.keys(payload).length || !validInput(merged))
      return mockError(422, 'Invoice payload is invalid.');
    Object.assign(invoice, payload, totals(merged, invoice.items), {
      updated_at: new Date().toISOString(),
    });
    appendAuditLog(user, {
      action: 'invoice.updated',
      resourceType: 'invoice',
      resourceId: invoice.id,
      summary: `Updated invoice ${invoice.number}`,
      metadata: { invoiceNumber: invoice.number, totalCents: invoice.total },
    });
    return { status: 200, data: structuredClone(invoice) };
  }
  if (method === 'DELETE') {
    invoices.splice(invoices.indexOf(invoice), 1);
    appendAuditLog(user, {
      action: 'invoice.deleted',
      resourceType: 'invoice',
      resourceId: invoice.id,
      summary: `Deleted invoice ${invoice.number}`,
      metadata: { invoiceNumber: invoice.number },
    });
    return { status: 200, data: { deleted: [invoice.id] } };
  }
  return null;
};
