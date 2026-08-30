import type { InternalAxiosRequestConfig } from 'axios';
import { AxiosHeaders } from 'axios';

import type { UserCreate } from '#/system/user';
import { PermissionActionType } from '#/enum';

import { permissionsForRole, hasPermissionAction } from './permissions';
import {
  findUserByToken,
  getState,
  toRoleRead,
  toUserRead,
  toUserWithPermissionsRead,
} from './store';
import type { MockRoleRecord, MockUserRecord } from './types';

export type MockHandlerResult = {
  status: number;
  data: unknown;
};

function requestPathname(config: InternalAxiosRequestConfig): string {
  const url = config.url ?? '/';
  if (/^https?:\/\//i.test(url)) {
    return new URL(url).pathname;
  }
  const base = config.baseURL ?? '';
  if (/^https?:\/\//i.test(base)) {
    return new URL(url, base.endsWith('/') ? base : `${base}/`).pathname;
  }
  const combined = `${String(base).replace(/\/$/, '')}/${url.replace(/^\//, '')}`;
  return new URL(combined, 'http://mock.local').pathname;
}

function parseUrlencodedBody(raw: string): Record<string, string> {
  const params = new URLSearchParams(raw);
  return Object.fromEntries(params.entries());
}

function readBody(config: InternalAxiosRequestConfig): unknown {
  const { data } = config;
  if (data == null || data === '') {
    return undefined;
  }
  if (typeof FormData !== 'undefined' && data instanceof FormData) {
    return Object.fromEntries(
      Array.from(data.entries()).map(([key, value]) => [key, String(value)]),
    );
  }
  if (typeof data === 'string') {
    const trimmed = data.trim();
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        return JSON.parse(data) as unknown;
      } catch {
        return data;
      }
    }
    return parseUrlencodedBody(data);
  }
  return data;
}

function readBearerToken(config: InternalAxiosRequestConfig): string | undefined {
  const headers = AxiosHeaders.from(config.headers ?? {});
  const authorization = headers.get('Authorization');
  if (typeof authorization !== 'string') {
    return undefined;
  }
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  return match?.[1];
}

function paginate<T>(items: T[], page = 1, itemsPerPage = 10) {
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

function readPagination(config: InternalAxiosRequestConfig) {
  const params = config.params as Record<string, unknown> | undefined;
  const page = Number(params?.page ?? 1);
  const itemsPerPage = Number(params?.items_per_page ?? 10);
  return {
    page: Number.isFinite(page) ? page : 1,
    itemsPerPage: Number.isFinite(itemsPerPage) ? itemsPerPage : 10,
  };
}

function nextUserId(): string {
  return `user-${crypto.randomUUID()}`;
}

function nextTimestamp(): string {
  return new Date().toISOString();
}

function applyUserFilters(users: MockUserRecord[], searchValues: Record<string, unknown>) {
  return users.filter((user) => {
    if (typeof searchValues.name === 'string' && searchValues.name.length > 0) {
      if (!user.name.toLowerCase().includes(searchValues.name.toLowerCase())) {
        return false;
      }
    }
    if (typeof searchValues.role === 'string' && searchValues.role.length > 0) {
      if (user.role !== searchValues.role) {
        return false;
      }
    }
    if (searchValues.is_active !== undefined && searchValues.is_active !== null) {
      const active =
        typeof searchValues.is_active === 'boolean'
          ? searchValues.is_active
          : String(searchValues.is_active).toLowerCase() === 'true';
      if (user.is_active !== active) {
        return false;
      }
    }
    return true;
  });
}

function applyRoleFilters(roles: MockRoleRecord[], searchValues: Record<string, unknown>) {
  return roles.filter((role) => {
    if (typeof searchValues.name === 'string' && searchValues.name.length > 0) {
      const term = searchValues.name.toLowerCase();
      if (!role.name.toLowerCase().includes(term) && !role.label.toLowerCase().includes(term)) {
        return false;
      }
    }
    if (typeof searchValues.description === 'string' && searchValues.description.length > 0) {
      if (!role.description.toLowerCase().includes(searchValues.description.toLowerCase())) {
        return false;
      }
    }
    if (searchValues.is_active !== undefined && searchValues.is_active !== null) {
      const active =
        typeof searchValues.is_active === 'boolean'
          ? searchValues.is_active
          : String(searchValues.is_active).toLowerCase() === 'true';
      if (role.is_active !== active) {
        return false;
      }
    }
    return true;
  });
}

function assertUsersCreateAllowed(user: MockUserRecord | undefined) {
  if (!user) {
    return { status: 401, data: { detail: 'User not authenticated.' } } as const;
  }
  if (
    !hasPermissionAction(
      user.permissions,
      'sys.menu.management.system.users',
      PermissionActionType.CREATE,
    )
  ) {
    return { status: 403, data: { detail: 'Insufficient permissions.' } } as const;
  }
  return null;
}

function assertUsersUpdateAllowed(user: MockUserRecord | undefined) {
  if (!user) {
    return { status: 401, data: { detail: 'User not authenticated.' } } as const;
  }
  if (
    !hasPermissionAction(
      user.permissions,
      'sys.menu.management.system.users',
      PermissionActionType.UPDATE,
    )
  ) {
    return { status: 403, data: { detail: 'Insufficient permissions.' } } as const;
  }
  return null;
}

function assertUsersDeleteAllowed(user: MockUserRecord | undefined) {
  if (!user) {
    return { status: 401, data: { detail: 'User not authenticated.' } } as const;
  }
  if (
    !hasPermissionAction(
      user.permissions,
      'sys.menu.management.system.users',
      PermissionActionType.DELETE,
    )
  ) {
    return { status: 403, data: { detail: 'Insufficient permissions.' } } as const;
  }
  return null;
}

function assertUsersReadAllowed(user: MockUserRecord | undefined) {
  if (!user) {
    return { status: 401, data: { detail: 'User not authenticated.' } } as const;
  }
  if (
    !hasPermissionAction(
      user.permissions,
      'sys.menu.management.system.users',
      PermissionActionType.READ,
    )
  ) {
    return { status: 403, data: { detail: 'Insufficient permissions.' } } as const;
  }
  return null;
}

export function handleMockRequest(config: InternalAxiosRequestConfig): MockHandlerResult {
  const method = (config.method ?? 'get').toUpperCase();
  const pathname = requestPathname(config);
  const body = readBody(config);
  const store = getState();

  if (method === 'POST' && pathname === '/v1/auth/login') {
    const credentials = body as { username?: string; password?: string } | undefined;
    const usernameOrEmail = credentials?.username?.trim();
    const password = credentials?.password;
    const user = store.users.find(
      (item) =>
        (item.email === usernameOrEmail || item.username === usernameOrEmail) &&
        item.password === password &&
        item.is_active,
    );
    if (!user) {
      return { status: 401, data: { detail: 'Invalid credentials.' } };
    }
    return {
      status: 200,
      data: {
        access_token: `mock-token-${user.id}`,
        token_type: 'bearer',
      },
    };
  }

  if (
    method === 'GET' &&
    (pathname === '/v1/system/users/me' || pathname === '/v1/system/users/me/')
  ) {
    const token = readBearerToken(config);
    const user = findUserByToken(token);
    if (!user) {
      return { status: 401, data: { detail: 'User not authenticated.' } };
    }
    return { status: 200, data: toUserWithPermissionsRead(user) };
  }

  if (method === 'GET' && pathname === '/v1/system/users') {
    const { page, itemsPerPage } = readPagination(config);
    const searchValues = (config.params as Record<string, unknown> | undefined) ?? {};
    const filtered = applyUserFilters(store.users, searchValues);
    const items = filtered.map(toUserRead);
    return { status: 200, data: paginate(items, page, itemsPerPage) };
  }

  if (method === 'POST' && pathname === '/v1/system/users') {
    const authUser = findUserByToken(readBearerToken(config));
    const denied = assertUsersCreateAllowed(authUser);
    if (denied) return denied;

    const payload = body as UserCreate | undefined;
    if (!payload?.email || !payload.name || !payload.role_id) {
      return { status: 422, data: { detail: 'Missing required user fields.' } };
    }
    if (store.users.some((item) => item.email === payload.email)) {
      return { status: 422, data: { detail: 'Email already exists.' } };
    }
    const role = store.roles.find((item) => item.id === payload.role_id);
    if (!role) {
      return { status: 422, data: { detail: 'Role not found.' } };
    }
    const timestamp = nextTimestamp();
    const created: MockUserRecord = {
      id: nextUserId(),
      username: payload.email.split('@')[0] ?? payload.email,
      password: payload.password ?? 'changeme123',
      name: payload.name,
      email: payload.email,
      role_id: role.id,
      role: role.name,
      role_label: role.label,
      default_language: 'pt_BR',
      is_active: true,
      is_support: false,
      is_superuser: role.name === 'admin',
      profile_image_url: null,
      created_at: timestamp,
      updated_at: timestamp,
      permissions: permissionsForRole(role.name),
    };
    store.users.push(created);
    return { status: 201, data: toUserRead(created) };
  }

  const userByIdMatch = pathname.match(/^\/v1\/system\/users\/([^/]+)$/);
  if (method === 'GET' && userByIdMatch) {
    const authUser = findUserByToken(readBearerToken(config));
    const denied = assertUsersReadAllowed(authUser);
    if (denied) return denied;

    const user = store.users.find((item) => item.id === userByIdMatch[1]);
    if (!user) {
      return { status: 404, data: { detail: 'User not found.' } };
    }
    return { status: 200, data: toUserWithPermissionsRead(user) };
  }

  if (method === 'PATCH' && userByIdMatch) {
    const authUser = findUserByToken(readBearerToken(config));
    const denied = assertUsersUpdateAllowed(authUser);
    if (denied) return denied;

    const userId = userByIdMatch[1];
    const user = store.users.find((item) => item.id === userId);
    if (!user) {
      return { status: 404, data: { detail: 'User not found.' } };
    }
    const payload = (body as UpdateUserInfoRequest | undefined) ?? {};
    if (payload.name !== undefined) user.name = payload.name;
    if (payload.email !== undefined) user.email = payload.email;
    if (payload.default_language !== undefined) user.default_language = payload.default_language;
    if (payload.is_active !== undefined) user.is_active = payload.is_active;
    user.updated_at = nextTimestamp();
    return { status: 200, data: { message: 'User updated successfully.' } };
  }

  if (method === 'DELETE' && userByIdMatch) {
    const authUser = findUserByToken(readBearerToken(config));
    const denied = assertUsersDeleteAllowed(authUser);
    if (denied) return denied;

    const userId = userByIdMatch[1];
    const index = store.users.findIndex((item) => item.id === userId);
    if (index === -1) {
      return { status: 404, data: { detail: 'User not found.' } };
    }
    store.users.splice(index, 1);
    return { status: 200, data: { message: 'User deleted successfully.' } };
  }

  if (method === 'GET' && pathname === '/v1/system/roles') {
    const { page, itemsPerPage } = readPagination(config);
    const searchValues = (config.params as Record<string, unknown> | undefined) ?? {};
    const filtered = applyRoleFilters(store.roles, searchValues);
    const items = filtered.map(toRoleRead);
    return { status: 200, data: paginate(items, page, itemsPerPage) };
  }

  return { status: 404, data: { detail: `No mock handler for ${method} ${pathname}` } };
}

type UpdateUserInfoRequest = {
  name?: string;
  email?: string;
  default_language?: string;
  is_active?: boolean;
};
