import { describe, expect, it } from 'vitest';

import { PermissionActionType } from '#/enum';

import { actionForExamplesRequest } from './domains';

describe('Examples domain contracts', () => {
  it('maps every request shape to its exact permission action', () => {
    expect(actionForExamplesRequest('GET', '/v1/examples/customers')).toBe(
      PermissionActionType.READ,
    );
    expect(actionForExamplesRequest('POST', '/v1/examples/customers')).toBe(
      PermissionActionType.CREATE,
    );
    expect(actionForExamplesRequest('PATCH', '/v1/examples/customers/customer-acme')).toBe(
      PermissionActionType.UPDATE,
    );
    expect(
      actionForExamplesRequest('POST', '/v1/examples/revenue/invoices/invoice-1001/send'),
    ).toBe(PermissionActionType.UPDATE);
    expect(
      actionForExamplesRequest(
        'POST',
        '/v1/examples/revenue/subscriptions/subscription-acme/cancel',
      ),
    ).toBe(PermissionActionType.UPDATE);
    expect(actionForExamplesRequest('POST', '/v1/examples/support/tickets/ticket-1/status')).toBe(
      PermissionActionType.UPDATE,
    );
    expect(actionForExamplesRequest('POST', '/v1/examples/support/tickets/ticket-1/reopen')).toBe(
      PermissionActionType.UPDATE,
    );
    expect(actionForExamplesRequest('POST', '/v1/examples/revenue/invoices/bulk-delete')).toBe(
      PermissionActionType.DELETE,
    );
    expect(
      actionForExamplesRequest('POST', '/v1/examples/platform/api-keys/api-key-production/revoke'),
    ).toBe(PermissionActionType.DELETE);
    expect(actionForExamplesRequest('DELETE', '/v1/examples/customers/customer-acme')).toBe(
      PermissionActionType.DELETE,
    );
  });
});
