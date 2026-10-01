import type { InternalAxiosRequestConfig } from 'axios';

import { PermissionActionType } from '#/enum';

import { findUserByToken } from '../../store';
import type { MockHandlerResult } from '../../handlers';

import { actionForExamplesRequest, examplesDomainHandlers } from './domains';
import {
  mockError,
  noExamplesHandler,
  readBearerToken,
  requestPathname,
  requireAuthenticated,
  requirePermissionAction,
} from './shared';

export function isExamplesRequest(config: InternalAxiosRequestConfig): boolean {
  const pathname = requestPathname(config);
  return pathname === '/v1/examples' || pathname.startsWith('/v1/examples/');
}

export function handleExamplesMockRequest(config: InternalAxiosRequestConfig): MockHandlerResult {
  const pathname = requestPathname(config);
  const method = (config.method ?? 'get').toUpperCase();
  const user = findUserByToken(readBearerToken(config));
  if (!user) return requireAuthenticated(user)!;

  const domain = examplesDomainHandlers.find((candidate) => candidate.matches(pathname));
  if (!domain) return noExamplesHandler(method, pathname);

  const inaccessible = requirePermissionAction(
    user,
    domain.permissionLabel,
    PermissionActionType.READ,
  );
  if (inaccessible) return inaccessible;

  if (!domain.allowedMethods.includes(method)) return mockError(405, 'Method not allowed.');

  const forbidden = requirePermissionAction(
    user,
    domain.permissionLabel,
    actionForExamplesRequest(method, pathname),
  );
  if (forbidden) return forbidden;

  return domain.handler({ config, method, pathname, user }) ?? noExamplesHandler(method, pathname);
}
