import { beforeEach, describe, expect, it } from 'vitest';

import { getState, resetToSeed, toUserRead } from './store';

describe('mock store', () => {
  beforeEach(() => {
    resetToSeed();
  });

  it('seeds admin and viewer with role metadata and permission tree', () => {
    const { users, roles } = getState();
    expect(users.map((user) => user.username)).toEqual(['admin', 'viewer']);
    expect(roles.map((role) => role.name)).toEqual(['admin', 'viewer']);
    expect(users[0]?.permissions.length).toBeGreaterThan(0);
    expect(users[0]?.permissions.some((item) => item.label === 'sys.menu.management.index')).toBe(
      true,
    );
    expect(users[1]?.role).toBe('viewer');
    expect(users[1]?.permissions.length).toBeGreaterThan(0);
  });

  it('resetToSeed restores arrays after mutation', () => {
    getState().users.push({
      id: 'user-temp',
      username: 'temp',
      password: 'temp',
      name: 'Temp',
      email: 'temp@example.com',
      role_id: 'role-viewer',
      role: 'viewer',
      role_label: 'Viewer',
      default_language: 'pt_BR',
      is_active: true,
      is_support: false,
      is_superuser: false,
      profile_image_url: null,
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
      permissions: [],
    });
    expect(getState().users).toHaveLength(3);

    resetToSeed();

    expect(getState().users).toHaveLength(2);
    expect(getState().users.map((user) => user.username)).toEqual(['admin', 'viewer']);
  });

  it('seeds the retained invoice domain with deterministic values and restores session state', () => {
    const examples = getState().examples;

    expect(examples.invoices).toHaveLength(2);
    expect(examples.invoices[0]?.total).toBe(125000);

    examples.invoices[0]!.total = 1;

    resetToSeed();

    expect(getState().examples.invoices[0]?.total).toBe(125000);
  });

  it('seeds every SaaS domain with deterministic relational data', () => {
    const { examples } = getState();
    const customerIds = new Set(examples.customers.map((customer) => customer.id));

    expect(examples.customers).toHaveLength(6);
    expect(examples.subscriptions).toHaveLength(6);
    expect(examples.supportTickets).toHaveLength(5);
    expect(examples.apiKeys).toHaveLength(3);
    expect(examples.auditLogs).toHaveLength(6);
    expect(examples.subscriptions.every((item) => customerIds.has(item.customerId))).toBe(true);
    expect(examples.supportTickets.every((item) => customerIds.has(item.customerId))).toBe(true);
    expect(examples.customers.map((item) => item.mrrCents)).toEqual([
      12900, 49900, 149900, 49900, 12900, 149900,
    ]);
  });

  it('restores a deep clone of every SaaS seed after nested mutations', () => {
    const initial = structuredClone(getState().examples);

    getState().examples.customers[0]!.name = 'Mutated customer';
    getState().examples.apiKeys[0]!.scopes.push('audit:read');
    getState().examples.auditLogs[0]!.metadata.customerName = 'Mutated metadata';
    getState().examples.invoices[0]!.items[0]!.description = 'Mutated item';

    resetToSeed();

    expect(getState().examples).toEqual(initial);
    expect(getState().examples).not.toBe(initial);
    expect(getState().examples.apiKeys[0]!.scopes).not.toBe(initial.apiKeys[0]!.scopes);
    expect(getState().examples.auditLogs[0]!.metadata).not.toBe(initial.auditLogs[0]!.metadata);
  });

  it('never persists a full API key secret in the mock store', () => {
    const serialized = JSON.stringify(getState().examples.apiKeys);

    expect(serialized).not.toContain('secret');
    expect(Object.keys(getState().examples.apiKeys[0] ?? {})).toEqual([
      'id',
      'name',
      'prefix',
      'scopes',
      'createdAt',
      'lastUsedAt',
      'expiresAt',
      'revokedAt',
    ]);
  });

  it('toUserRead matches Portal UserRead shape', () => {
    const [admin] = getState().users;
    expect(admin).toBeDefined();
    const read = toUserRead(admin!);
    expect(read).toMatchObject({
      id: 'user-admin',
      email: 'admin@example.com',
      role: 'admin',
      role_label: 'Administrator',
      default_language: 'pt_BR',
      is_active: true,
    });
    expect(read).not.toHaveProperty('username');
    expect(read).not.toHaveProperty('password');
  });
});
