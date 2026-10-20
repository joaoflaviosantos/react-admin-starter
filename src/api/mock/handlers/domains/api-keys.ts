import type { ApiKey, ApiKeyCreateResponse, ApiKeyInput, ApiKeyScope } from '#/domain';

import { getState } from '../../store';
import type { DomainHandler } from './domains';
import { appendAuditLog, mockError, paginate, readPagination, readRequestBody } from './shared';

const baseUrl = '/v1/platform/api-keys';
const scopes: ApiKeyScope[] = [
  'customers:read',
  'customers:write',
  'billing:read',
  'billing:write',
  'tickets:read',
  'tickets:write',
  'audit:read',
];
const isDateOnly = (value: unknown): value is string =>
  typeof value === 'string' &&
  /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  !Number.isNaN(Date.parse(`${value}T00:00:00Z`));

function isValidInput(value: ApiKeyInput): boolean {
  if (
    !value ||
    typeof value.name !== 'string' ||
    value.name.trim().length < 3 ||
    value.name.trim().length > 80
  )
    return false;
  if (
    !Array.isArray(value.scopes) ||
    value.scopes.length === 0 ||
    new Set(value.scopes).size !== value.scopes.length
  )
    return false;
  if (value.scopes.some((scope) => !scopes.includes(scope))) return false;
  if (
    value.expiresAt !== null &&
    (!isDateOnly(value.expiresAt) || Date.parse(`${value.expiresAt}T23:59:59Z`) <= Date.now())
  )
    return false;
  return true;
}

function normalizeInput(value: ApiKeyInput): ApiKeyInput {
  return { name: value.name.trim(), scopes: [...value.scopes], expiresAt: value.expiresAt };
}

function keySecret(): string {
  return `sk_live_${crypto.randomUUID().replaceAll('-', '')}`;
}

function keyPrefix(secret: string): string {
  return `${secret.slice(0, 12)}…${secret.slice(-4)}`;
}

export const handleApiKeysRequest: DomainHandler = ({ config, method, pathname, user }) => {
  const keys = getState().domains.apiKeys;

  if (method === 'GET' && pathname === baseUrl) {
    const params = config.params as Record<string, unknown> | undefined;
    const search = String(params?.search ?? '')
      .trim()
      .toLowerCase();
    const status = String(params?.status ?? '');
    const filtered = keys
      .filter((key) => {
        const matchesSearch = !search || `${key.name} ${key.prefix}`.toLowerCase().includes(search);
        const isRevoked = Boolean(key.revokedAt);
        const matchesStatus =
          !status || (status === 'revoked' ? isRevoked : status === 'active' ? !isRevoked : true);
        return matchesSearch && matchesStatus;
      })
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
    const { page, itemsPerPage } = readPagination(config);
    return { status: 200, data: paginate(structuredClone(filtered), page, itemsPerPage) };
  }

  if (method === 'POST' && pathname === baseUrl) {
    const payload = readRequestBody(config.data) as ApiKeyInput;
    if (!isValidInput(payload)) return mockError(422, 'API key payload is invalid.');
    const normalized = normalizeInput(payload);
    if (
      keys.some((key) => key.name.toLowerCase() === normalized.name.toLowerCase() && !key.revokedAt)
    ) {
      return mockError(422, 'An active API key with this name already exists.');
    }
    const secret = keySecret();
    const created: ApiKey = {
      id: `api-key-${crypto.randomUUID()}`,
      name: normalized.name,
      prefix: keyPrefix(secret),
      scopes: normalized.scopes,
      createdAt: new Date().toISOString(),
      lastUsedAt: null,
      expiresAt: normalized.expiresAt,
      revokedAt: null,
    };
    keys.unshift(created);
    appendAuditLog(user, {
      action: 'api_key.created',
      resourceType: 'api_key',
      resourceId: created.id,
      summary: `Created the ${created.name} API key`,
      metadata: {
        keyName: created.name,
        scopeCount: created.scopes.length,
        prefix: created.prefix,
      },
    });
    const response: ApiKeyCreateResponse = { key: structuredClone(created), secret };
    return { status: 201, data: response };
  }

  const revokeMatch = pathname.match(/^\/v1\/platform\/api-keys\/([^/]+)\/revoke$/);
  if (method === 'POST' && revokeMatch) {
    const key = keys.find((item) => item.id === revokeMatch[1]);
    if (!key) return mockError(404, 'API key not found.');
    if (key.revokedAt) return { status: 200, data: structuredClone(key) };
    key.revokedAt = new Date().toISOString();
    appendAuditLog(user, {
      action: 'api_key.revoked',
      resourceType: 'api_key',
      resourceId: key.id,
      summary: `Revoked the ${key.name} API key`,
      metadata: { keyName: key.name, prefix: key.prefix },
    });
    return { status: 200, data: structuredClone(key) };
  }

  const match = pathname.match(/^\/v1\/platform\/api-keys\/([^/]+)$/);
  if (!match) return null;
  const key = keys.find((item) => item.id === match[1]);
  if (!key) return mockError(404, 'API key not found.');
  if (method === 'GET') return { status: 200, data: structuredClone(key) };
  if (method === 'DELETE') {
    if (!key.revokedAt) key.revokedAt = new Date().toISOString();
    if (!key.revokedAt) return mockError(422, 'API key cannot be revoked.');
    return { status: 200, data: structuredClone(key) };
  }
  return null;
};
