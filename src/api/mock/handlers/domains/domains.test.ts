import { describe, expect, it } from 'vitest';

import { PermissionActionType } from '#/enum';

import { actionForDomainRequest } from './domains';

describe('Domain domain contracts', () => {
  it('maps every request shape to its exact permission action', () => {
    expect(actionForDomainRequest('GET', '/v1/customers')).toBe(PermissionActionType.READ);
    expect(actionForDomainRequest('POST', '/v1/customers')).toBe(PermissionActionType.CREATE);
    expect(actionForDomainRequest('PATCH', '/v1/customers/customer-acme')).toBe(
      PermissionActionType.UPDATE,
    );
    expect(actionForDomainRequest('POST', '/v1/revenue/invoices/invoice-1001/send')).toBe(
      PermissionActionType.UPDATE,
    );
    expect(
      actionForDomainRequest('POST', '/v1/revenue/subscriptions/subscription-acme/cancel'),
    ).toBe(PermissionActionType.UPDATE);
    expect(actionForDomainRequest('POST', '/v1/support/tickets/ticket-1/status')).toBe(
      PermissionActionType.UPDATE,
    );
    expect(actionForDomainRequest('POST', '/v1/support/tickets/ticket-1/reopen')).toBe(
      PermissionActionType.UPDATE,
    );
    expect(actionForDomainRequest('POST', '/v1/revenue/invoices/bulk-delete')).toBe(
      PermissionActionType.DELETE,
    );
    expect(actionForDomainRequest('POST', '/v1/platform/api-keys/api-key-production/revoke')).toBe(
      PermissionActionType.DELETE,
    );
    expect(actionForDomainRequest('DELETE', '/v1/customers/customer-acme')).toBe(
      PermissionActionType.DELETE,
    );
  });
});
