import { AxiosError } from 'axios';
import { beforeEach, describe, expect, it } from 'vitest';

import apiClient from '@/api/apiClient';
import authService from '@/api/services/authService';
import roleService from '@/api/services/system/roleService';
import userService from '@/api/services/system/userService';
import { setItem } from '@/utils/storage';

import { getState, resetToSeed } from './store';

import { TokenRead } from '#/auth';
import { StorageEnum } from '#/enum';

describe('mock axios adapter', () => {
  beforeEach(() => {
    resetToSeed();
    localStorage.clear();
  });

  it('signs in with seed credentials and returns TokenRead', async () => {
    const result = await authService.signin({ username: 'admin', password: 'admin123' });

    expect(result).toEqual<TokenRead>({
      access_token: 'mock-token-user-admin',
      token_type: 'bearer',
    });
  });

  it('rejects invalid credentials with 401 detail', async () => {
    const error = await authService
      .signin({ username: 'admin', password: 'wrong' })
      .catch((err: unknown) => err);

    expect(error).toBeInstanceOf(AxiosError);
    expect(error).toMatchObject({
      message: 'Invalid credentials.',
      response: { status: 401, data: { detail: 'Invalid credentials.' } },
    });
  });

  it('creates a user that then appears in getPaginatedUserList', async () => {
    const created = await userService.createUser({
      email: 'alice@example.com',
      name: 'Alice',
      password: 'alice123',
      role_id: 'role-viewer',
    });

    expect(created.email).toBe('alice@example.com');
    expect(created.role).toBe('viewer');
    expect(created).not.toHaveProperty('password');

    const listed = await userService.getPaginatedUserList({});
    expect(listed.total_count).toBe(3);
    expect(listed.data.some((user) => user.email === 'alice@example.com')).toBe(true);
  });

  it('isolates tests with resetToSeed', async () => {
    await userService.createUser({
      email: 'bob@example.com',
      name: 'Bob',
      password: 'bob123',
      role_id: 'role-viewer',
    });
    expect(getState().users).toHaveLength(3);

    resetToSeed();

    const listed = await userService.getPaginatedUserList({});
    expect(listed.total_count).toBe(2);
    expect(listed.data.map((user) => user.email)).toEqual([
      'admin@example.com',
      'viewer@example.com',
    ]);
  });

  it('lists roles with paginated envelope and patches a user', async () => {
    const roles = await roleService.getPaginatedRoleList({});
    expect(roles.total_count).toBe(2);
    expect(roles.data.map((role) => role.name)).toEqual(['admin', 'viewer']);

    const patched = await userService.updateUserById('user-viewer', { name: 'Updated Viewer' });
    expect(patched.message).toBe('User updated successfully.');
    expect(getState().users.find((user) => user.id === 'user-viewer')?.name).toBe('Updated Viewer');
  });

  it('returns UserWithPermissionsRead from GET /me when Bearer token is present', async () => {
    setItem<TokenRead>(StorageEnum.Token, {
      access_token: 'mock-token-user-admin',
      token_type: 'bearer',
    });

    const me = await userService.getMyTenantData();
    expect(me.email).toBe('admin@example.com');
    expect(me.role).toBe('admin');
    expect(me.permissions.length).toBeGreaterThan(0);
    expect(me.permissions.some((item) => item.label === 'sys.menu.management.index')).toBe(true);
  });

  it('returns 401 from GET /me without token', async () => {
    const error = await apiClient.get({ url: '/v1/system/users/me/' }).catch((err: unknown) => err);

    expect(error).toBeInstanceOf(AxiosError);
    expect(error).toMatchObject({
      message: 'User not authenticated.',
      response: { status: 401 },
    });
  });
});
