import type { InternalAxiosRequestConfig } from 'axios';

import { PermissionActionType } from '#/enum';

import type { MockHandlerResult } from '../../handlers';
import type { MockUserRecord } from '../../types';

import { handleInvoicesRequest } from './invoices';
import { handleCustomersRequest } from './customers';
import { handleSubscriptionsRequest } from './subscriptions';
import { handleTicketsRequest } from './tickets';
import { handleApiKeysRequest } from './api-keys';
import { handleAuditLogsRequest } from './audit-logs';
import { handleDashboardRequest } from './dashboard';

export type ExamplesDomainHandler = (context: {
  config: InternalAxiosRequestConfig;
  method: string;
  pathname: string;
  user: MockUserRecord;
}) => MockHandlerResult | null;

export type ExamplesDomainDefinition = {
  name: string;
  permissionLabel: string;
  matches: (pathname: string) => boolean;
  allowedMethods: readonly string[];
  handler: ExamplesDomainHandler;
};

const matchesPrefix = (prefix: string) => (pathname: string) =>
  pathname === prefix || pathname.startsWith(`${prefix}/`);

export function actionForExamplesRequest(method: string, pathname: string): PermissionActionType {
  if (method === 'GET') return PermissionActionType.READ;
  if (method === 'PATCH' || /\/(send|cancel|reactivate|status|reopen)$/.test(pathname)) {
    return PermissionActionType.UPDATE;
  }
  if (method === 'DELETE' || /\/(bulk-delete|revoke)$/.test(pathname)) {
    return PermissionActionType.DELETE;
  }
  return PermissionActionType.CREATE;
}

export const examplesDomainHandlers: ExamplesDomainDefinition[] = [
  {
    name: 'customers',
    permissionLabel: 'examples.menu.customers',
    matches: matchesPrefix('/v1/examples/customers'),
    allowedMethods: ['GET', 'POST', 'PATCH', 'DELETE'],
    handler: handleCustomersRequest,
  },
  {
    name: 'subscriptions',
    permissionLabel: 'examples.menu.subscriptions',
    matches: matchesPrefix('/v1/examples/revenue/subscriptions'),
    allowedMethods: ['GET', 'POST', 'PATCH', 'DELETE'],
    handler: handleSubscriptionsRequest,
  },
  {
    name: 'invoices',
    permissionLabel: 'examples.menu.invoices',
    matches: matchesPrefix('/v1/examples/revenue/invoices'),
    allowedMethods: ['GET', 'POST', 'PATCH', 'DELETE'],
    handler: handleInvoicesRequest,
  },
  {
    name: 'supportTickets',
    permissionLabel: 'examples.menu.tickets',
    matches: matchesPrefix('/v1/examples/support/tickets'),
    allowedMethods: ['GET', 'POST', 'PATCH', 'DELETE'],
    handler: handleTicketsRequest,
  },
  {
    name: 'apiKeys',
    permissionLabel: 'examples.menu.apiKeys',
    matches: matchesPrefix('/v1/examples/platform/api-keys'),
    allowedMethods: ['GET', 'POST', 'DELETE'],
    handler: handleApiKeysRequest,
  },
  {
    name: 'auditLogs',
    permissionLabel: 'examples.menu.auditLogs',
    matches: matchesPrefix('/v1/examples/platform/audit-logs'),
    allowedMethods: ['GET'],
    handler: handleAuditLogsRequest,
  },
  {
    name: 'dashboard',
    permissionLabel: 'sys.menu.overview',
    matches: matchesPrefix('/v1/examples/dashboard'),
    allowedMethods: ['GET'],
    handler: handleDashboardRequest,
  },
];
