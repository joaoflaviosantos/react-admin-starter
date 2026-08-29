import type { PermissionWithChildRead } from '#/system/user';
import { BasicStatus, PermissionActionType, PermissionType } from '#/enum';

const MOCK_TIMESTAMP = '2026-01-01T00:00:00.000Z';

function menuPermission(
  id: string,
  label: string,
  route: string,
  actions: PermissionActionType[],
  overrides: Partial<PermissionWithChildRead> = {},
): PermissionWithChildRead {
  return {
    id,
    created_at: MOCK_TIMESTAMP,
    updated_at: MOCK_TIMESTAMP,
    parent_id: null,
    is_active: true,
    label,
    type: PermissionType.MENU,
    status: BasicStatus.ENABLE,
    route,
    order: '1',
    name: id,
    actions_allowed: actions,
    module_name: 'system',
    children: [],
    ...overrides,
  };
}

export const ADMIN_PERMISSIONS: PermissionWithChildRead[] = [
  menuPermission(
    'perm-workbench',
    'sys.menu.workbench',
    '/workbench',
    [PermissionActionType.READ],
    { order: '0' },
  ),
  {
    id: 'perm-management',
    created_at: MOCK_TIMESTAMP,
    updated_at: MOCK_TIMESTAMP,
    parent_id: null,
    is_active: true,
    label: 'sys.menu.management.index',
    type: PermissionType.CATALOGUE,
    status: BasicStatus.ENABLE,
    route: '/management',
    order: '1',
    name: 'management',
    module_name: 'system',
    children: [
      menuPermission(
        'perm-users',
        'sys.menu.management.system.users',
        '/management/system/users',
        [
          PermissionActionType.READ,
          PermissionActionType.CREATE,
          PermissionActionType.UPDATE,
          PermissionActionType.DELETE,
        ],
        { parent_id: 'perm-management', order: '1' },
      ),
      menuPermission(
        'perm-roles',
        'sys.menu.management.system.roles',
        '/management/system/roles',
        [PermissionActionType.READ],
        { parent_id: 'perm-management', order: '2' },
      ),
    ],
  },
];

export const VIEWER_PERMISSIONS: PermissionWithChildRead[] = [
  menuPermission(
    'perm-workbench',
    'sys.menu.workbench',
    '/workbench',
    [PermissionActionType.READ],
    { order: '0' },
  ),
];

export function permissionsForRole(roleName: string): PermissionWithChildRead[] {
  if (roleName === 'admin') {
    return structuredClone(ADMIN_PERMISSIONS);
  }
  return structuredClone(VIEWER_PERMISSIONS);
}
