import type { UserRead, UserWithPermissionsRead } from '#/system/user';
import type { RoleRead } from '#/system/role';

import { permissionsForRole } from './permissions';
import rolesSeed from './seed/roles.json';
import usersSeed from './seed/users.json';
import type { MockRoleRecord, MockUserRecord } from './types';

/**
 * In-memory mock store. Demo credentials:
 * admin / admin123, viewer / viewer123.
 */

type MockStore = {
  users: MockUserRecord[];
  roles: MockRoleRecord[];
};

function hydrateUser(user: Omit<MockUserRecord, 'permissions'>): MockUserRecord {
  return {
    ...user,
    permissions: permissionsForRole(user.role),
  };
}

function cloneSeed(): MockStore {
  const roles = structuredClone(rolesSeed) as MockRoleRecord[];
  const users = (structuredClone(usersSeed) as Omit<MockUserRecord, 'permissions'>[]).map(
    hydrateUser,
  );
  return { users, roles };
}

let state: MockStore = cloneSeed();

export function getState(): MockStore {
  return state;
}

export function resetToSeed(): void {
  state = cloneSeed();
}

export function toUserRead(user: MockUserRecord): UserRead {
  return {
    id: user.id,
    is_active: user.is_active,
    profile_image_url: user.profile_image_url,
    default_language: user.default_language,
    name: user.name,
    email: user.email,
    created_at: user.created_at,
    updated_at: user.updated_at,
    role: user.role,
    role_label: user.role_label,
  };
}

export function toUserWithPermissionsRead(user: MockUserRecord): UserWithPermissionsRead {
  return {
    id: user.id,
    profile_image_url: user.profile_image_url,
    default_language: user.default_language,
    name: user.name,
    email: user.email,
    role: user.role,
    role_label: user.role_label,
    is_support: user.is_support,
    is_superuser: user.is_superuser,
    is_active: user.is_active,
    created_at: user.created_at,
    updated_at: user.updated_at,
    permissions: user.permissions,
  };
}

export function toRoleRead(role: MockRoleRecord): RoleRead {
  return {
    id: role.id,
    is_active: role.is_active,
    name: role.name,
    label: role.label,
    description: role.description,
    created_at: role.created_at,
    updated_at: role.updated_at,
    is_editable: role.is_editable,
  };
}

export function findUserByToken(token?: string): MockUserRecord | undefined {
  if (!token) {
    return undefined;
  }
  const match = token.match(/^mock-token-(.+)$/);
  if (!match) {
    return undefined;
  }
  return state.users.find((user) => user.id === match[1]);
}
