import type { InternalAxiosRequestConfig } from 'axios';

import { PermissionActionType } from '#/enum';

import { findUserByToken } from '../../store';
import type { MockHandlerResult } from '../../handlers';

import { actionForDomainRequest, domainHandlers } from './domains';
import {
  mockError,
  noDomainHandler,
  readBearerToken,
  requestPathname,
  requireAuthenticated,
  requirePermissionAction,
} from './shared';

export function isDomainRequest(config: InternalAxiosRequestConfig): boolean {
  const pathname = requestPathname(config);
  return domainHandlers.some((candidate) => candidate.matches(pathname));
}

export function handleDomainMockRequest(config: InternalAxiosRequestConfig): MockHandlerResult {
  const pathname = requestPathname(config);
  const method = (config.method ?? 'get').toUpperCase();
  const user = findUserByToken(readBearerToken(config));
  if (!user) return requireAuthenticated(user)!;

  const domain = domainHandlers.find((candidate) => candidate.matches(pathname));
  if (!domain) return noDomainHandler(method, pathname);

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
    actionForDomainRequest(method, pathname),
  );
  if (forbidden) return forbidden;

  return domain.handler({ config, method, pathname, user }) ?? noDomainHandler(method, pathname);
}
