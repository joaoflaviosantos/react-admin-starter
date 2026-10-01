import type { InternalAxiosRequestConfig } from 'axios';
import { AxiosHeaders } from 'axios';

import { PermissionActionType } from '#/enum';
import type { AuditLogMetadata } from '#/examples';

import { hasPermissionAction } from '../../permissions';
import { getState } from '../../store';
import type { MockUserRecord } from '../../types';

import type { MockHandlerResult } from '../../handlers';

export function mockError(status: 401 | 403 | 404 | 405 | 422, detail: string): MockHandlerResult {
  return { status, data: { detail } };
}

export function requestPathname(config: InternalAxiosRequestConfig): string {
  const url = config.url ?? '/';
  if (/^https?:\/\//i.test(url)) return new URL(url).pathname;

  const base = config.baseURL ?? '';
  if (/^https?:\/\//i.test(base)) {
    return new URL(url, base.endsWith('/') ? base : `${base}/`).pathname;
  }
  return new URL(
    `${String(base).replace(/\/$/, '')}/${url.replace(/^\//, '')}`,
    'http://mock.local',
  ).pathname;
}

export function readRequestBody(data: unknown): unknown {
  if (data == null || data === '') return undefined;
  if (typeof FormData !== 'undefined' && data instanceof FormData) {
    return Object.fromEntries(
      Array.from(data.entries()).map(([key, value]) => [key, String(value)]),
    );
  }
  if (typeof data !== 'string') return data;

  const trimmed = data.trim();
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      return JSON.parse(data) as unknown;
    } catch {
      return data;
    }
  }
  return Object.fromEntries(new URLSearchParams(data).entries());
}

export function readBearerToken(config: InternalAxiosRequestConfig): string | undefined {
  const authorization = AxiosHeaders.from(config.headers ?? {}).get('Authorization');
  return typeof authorization === 'string'
    ? authorization.match(/^Bearer\s+(.+)$/i)?.[1]
    : undefined;
}

export function paginate<T>(items: T[], page = 1, itemsPerPage = 10) {
  const safePage = Math.max(1, page);
  const safeSize = Math.max(1, itemsPerPage);
  const start = (safePage - 1) * safeSize;
  const data = items.slice(start, start + safeSize);
  return {
    data,
    total_count: items.length,
    has_more: start + data.length < items.length,
    page: safePage,
    items_per_page: safeSize,
  };
}

export function readPagination(config: InternalAxiosRequestConfig) {
  const params = config.params as Record<string, unknown> | undefined;
  const page = Number(params?.page ?? 1);
  const itemsPerPage = Number(params?.items_per_page ?? 10);
  return {
    page: Number.isFinite(page) ? Math.max(1, Math.floor(page)) : 1,
    itemsPerPage: Number.isFinite(itemsPerPage) ? Math.max(1, Math.floor(itemsPerPage)) : 10,
  };
}

export function requireAuthenticated(user: MockUserRecord | undefined): MockHandlerResult | null {
  return user ? null : mockError(401, 'User not authenticated.');
}

export function requirePermissionAction(
  user: MockUserRecord,
  permissionLabel: string,
  action: PermissionActionType,
): MockHandlerResult | null {
  return hasPermissionAction(user.permissions, permissionLabel, action)
    ? null
    : mockError(403, 'Insufficient permissions.');
}

export function noExamplesHandler(method: string, pathname: string): MockHandlerResult {
  return mockError(404, `No mock handler for ${method} ${pathname}`);
}

export function appendAuditLog(
  user: MockUserRecord,
  event: {
    action: string;
    resourceType: string;
    resourceId: string;
    summary: string;
    metadata?: AuditLogMetadata;
  },
): void {
  getState().examples.auditLogs.unshift({
    id: `audit-${crypto.randomUUID()}`,
    actorName: user.name,
    actorEmail: user.email,
    action: event.action,
    resourceType: event.resourceType,
    resourceId: event.resourceId,
    summary: event.summary,
    ipAddress: '127.0.0.1',
    userAgent: 'Mock adapter',
    createdAt: new Date().toISOString(),
    metadata: event.metadata ?? {},
  });
}
