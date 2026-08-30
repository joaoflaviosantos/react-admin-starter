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
