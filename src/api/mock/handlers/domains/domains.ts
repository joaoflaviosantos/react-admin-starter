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

export type DomainHandler = (context: {
  config: InternalAxiosRequestConfig;
  method: string;
  pathname: string;
  user: MockUserRecord;
}) => MockHandlerResult | null;

export type DomainDefinition = {
  name: string;
  permissionLabel: string;
  matches: (pathname: string) => boolean;
  allowedMethods: readonly string[];
  handler: DomainHandler;
};

const matchesPrefix = (prefix: string) => (pathname: string) =>
  pathname === prefix || pathname.startsWith(`${prefix}/`);

export function actionForDomainRequest(method: string, pathname: string): PermissionActionType {
  if (method === 'GET') return PermissionActionType.READ;
  if (method === 'PATCH' || /\/(send|cancel|reactivate|status|reopen)$/.test(pathname)) {
    return PermissionActionType.UPDATE;
  }
  if (method === 'DELETE' || /\/(bulk-delete|revoke)$/.test(pathname)) {
    return PermissionActionType.DELETE;
  }
  return PermissionActionType.CREATE;
}

export const domainHandlers: DomainDefinition[] = [
  {
    name: 'customers',
    permissionLabel: 'app.menu.customers',
    matches: matchesPrefix('/v1/customers'),
    allowedMethods: ['GET', 'POST', 'PATCH', 'DELETE'],
    handler: handleCustomersRequest,
  },
  {
    name: 'subscriptions',
    permissionLabel: 'app.menu.subscriptions',
    matches: matchesPrefix('/v1/revenue/subscriptions'),
    allowedMethods: ['GET', 'POST', 'PATCH', 'DELETE'],
    handler: handleSubscriptionsRequest,
  },
  {
    name: 'invoices',
    permissionLabel: 'app.menu.invoices',
    matches: matchesPrefix('/v1/revenue/invoices'),
    allowedMethods: ['GET', 'POST', 'PATCH', 'DELETE'],
    handler: handleInvoicesRequest,
  },
  {
    name: 'supportTickets',
    permissionLabel: 'app.menu.tickets',
    matches: matchesPrefix('/v1/support/tickets'),
    allowedMethods: ['GET', 'POST', 'PATCH', 'DELETE'],
    handler: handleTicketsRequest,
  },
  {
    name: 'apiKeys',
    permissionLabel: 'app.menu.apiKeys',
    matches: matchesPrefix('/v1/platform/api-keys'),
    allowedMethods: ['GET', 'POST', 'DELETE'],
    handler: handleApiKeysRequest,
  },
  {
    name: 'auditLogs',
    permissionLabel: 'app.menu.auditLogs',
    matches: matchesPrefix('/v1/platform/audit-logs'),
    allowedMethods: ['GET'],
    handler: handleAuditLogsRequest,
  },
  {
    name: 'dashboard',
    permissionLabel: 'sys.menu.overview',
    matches: matchesPrefix('/v1/dashboard'),
    allowedMethods: ['GET'],
    handler: handleDashboardRequest,
  },
];
