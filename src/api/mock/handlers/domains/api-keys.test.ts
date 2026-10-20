import { beforeEach, describe, expect, it } from 'vitest';

import { handleMockRequest } from '../../handlers';
import { getState, resetToSeed } from '../../store';

const adminHeaders = { Authorization: 'Bearer mock-token-user-admin' };
const viewerHeaders = { Authorization: 'Bearer mock-token-user-viewer' };
const request = (
  url: string,
  method = 'get',
  data?: unknown,
  params?: unknown,
  headers = adminHeaders,
) => handleMockRequest({ url, method, data, params, headers } as never);
const valid = {
  name: 'Warehouse sync',
  scopes: ['customers:read', 'billing:read'],
  expiresAt: '2027-12-31',
};

describe('API keys mock handler', () => {
  beforeEach(resetToSeed);

  it('creates a key with a one-time secret while persisting only prefix and metadata', () => {
    const response = request('/v1/platform/api-keys', 'post', valid);
    expect(response.status).toBe(201);
    expect(response.data).toMatchObject({
      key: { name: valid.name, scopes: valid.scopes },
      secret: expect.stringMatching(/^sk_live_/),
    });
    const created = getState().domains.apiKeys[0]!;
    expect(created.prefix).toContain('…');
    expect(created).not.toHaveProperty('secret');
    expect(JSON.stringify(getState().domains)).not.toContain(
      (response.data as { secret: string }).secret,
    );
    expect(getState().domains.auditLogs[0]).toMatchObject({
      action: 'api_key.created',
      resourceId: created.id,
    });
  });

  it('rejects invalid name, scopes, expiration and duplicate active names without mutation', () => {
    for (const payload of [
      { ...valid, name: 'x' },
      { ...valid, scopes: [] },
      { ...valid, scopes: ['unknown'] },
      { ...valid, expiresAt: '2020-01-01' },
      { ...valid, name: 'Production integration' },
    ]) {
      const before = structuredClone(getState().domains);
      expect(request('/v1/platform/api-keys', 'post', payload).status).toBe(422);
      expect(getState().domains).toEqual(before);
    }
  });

  it('revokes an active key once and keeps it terminal and idempotent', () => {
    const first = request('/v1/platform/api-keys/api-key-production/revoke', 'post');
    expect(first.status).toBe(200);
    expect(first.data).toMatchObject({ id: 'api-key-production', revokedAt: expect.any(String) });
    const auditCount = getState().domains.auditLogs.length;
    const second = request('/v1/platform/api-keys/api-key-production/revoke', 'post');
    expect(second.data).toEqual(first.data);
    expect(getState().domains.auditLogs).toHaveLength(auditCount);
  });

  it('enforces admin-only access and does not mutate for viewer', () => {
    const before = structuredClone(getState().domains);
    expect(
      request('/v1/platform/api-keys', 'get', undefined, undefined, viewerHeaders).status,
    ).toBe(403);
    expect(request('/v1/platform/api-keys', 'post', valid, undefined, viewerHeaders).status).toBe(
      403,
    );
    expect(
      request(
        '/v1/platform/api-keys/api-key-production/revoke',
        'post',
        undefined,
        undefined,
        viewerHeaders,
      ).status,
    ).toBe(403);
    expect(getState().domains).toEqual(before);
  });

  it('returns 404 for an unknown key and 405 for unsupported methods', () => {
    expect(request('/v1/platform/api-keys/missing/revoke', 'post').status).toBe(404);
    expect(request('/v1/platform/api-keys', 'patch', valid).status).toBe(405);
  });
});
