import { beforeEach, describe, expect, it } from 'vitest';

import { handleMockRequest } from '../../handlers';
import { getState, resetToSeed } from '../../store';

const adminHeaders = { Authorization: 'Bearer mock-token-user-admin' };
const viewerHeaders = { Authorization: 'Bearer mock-token-user-viewer' };
const request = (method = 'get', params?: unknown, headers = adminHeaders) =>
  handleMockRequest({ url: '/v1/platform/audit-logs', method, params, headers } as never);

describe('Audit logs mock handler', () => {
  beforeEach(resetToSeed);

  it('filters by search, actor, action, resource and date with pagination', () => {
    const response = request('get', {
      search: 'support',
      actor: 'admin@example.com',
      action: 'api_key',
      resource: 'api_key',
      from: '2026-04-01',
      to: '2026-05-01',
      page: 1,
      items_per_page: 1,
    });
    expect(response.status).toBe(200);
    expect(response.data).toMatchObject({
      total_count: 1,
      page: 1,
      items_per_page: 1,
      has_more: false,
    });
    expect((response.data as { data: { id: string }[] }).data.map((item) => item.id)).toEqual([
      'audit-1003',
    ]);
  });

  it('returns sanitized metadata and keeps the read model append-only', () => {
    getState().domains.auditLogs[0]!.metadata.secret = 'must-not-leak';
    const response = request();
    expect(response.status).toBe(200);
    const first = (response.data as { data: { metadata: Record<string, unknown> }[] }).data[0]!;
    expect(first.metadata).not.toHaveProperty('secret');
    expect(request('post').status).toBe(405);
    expect(request('delete').status).toBe(405);
  });

  it('enforces admin-only access and leaves state unchanged for viewer', () => {
    const before = structuredClone(getState().domains);
    expect(request('get', undefined, viewerHeaders).status).toBe(403);
    expect(request('post', undefined, viewerHeaders).status).toBe(403);
    expect(getState().domains).toEqual(before);
  });
});
