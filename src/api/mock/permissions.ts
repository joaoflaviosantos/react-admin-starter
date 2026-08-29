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
  {
    id: 'perm-workbench',
    created_at: MOCK_TIMESTAMP,
    updated_at: MOCK_TIMESTAMP,
    parent_id: null,
    is_active: true,
    label: 'sys.menu.workbench',
    type: PermissionType.CATALOGUE,
    status: BasicStatus.ENABLE,
    route: 'workbench',
    order: '0',
    name: 'workbench',
    module_name: 'system',
    icon: 'mdi:view-dashboard-outline',
    children: [
      menuPermission(
        'perm-workbench-overview',
        'sys.menu.overview',
        'overview',
        [PermissionActionType.READ],
        {
          parent_id: 'perm-workbench',
          order: '0',
          component: '/workbench/overview/index.tsx',
        },
      ),
    ],
  },
  {
    id: 'perm-management',
    created_at: MOCK_TIMESTAMP,
    updated_at: MOCK_TIMESTAMP,
    parent_id: null,
    is_active: true,
    label: 'sys.menu.management.index',
    type: PermissionType.CATALOGUE,
    status: BasicStatus.ENABLE,
    route: 'management',
    order: '1',
    name: 'management',
    module_name: 'system',
    icon: 'mdi:cog-outline',
    children: [
      menuPermission(
        'perm-users',
        'sys.menu.management.system.users',
        'system/users',
        [
          PermissionActionType.READ,
          PermissionActionType.CREATE,
          PermissionActionType.UPDATE,
          PermissionActionType.DELETE,
        ],
        {
          parent_id: 'perm-management',
          order: '1',
          component: '/management/system/users/index.tsx',
          icon: 'mdi:account-group-outline',
        },
      ),
      menuPermission(
        'perm-roles',
        'sys.menu.management.system.roles',
        'system/roles',
        [PermissionActionType.READ],
        {
          parent_id: 'perm-management',
          order: '2',
          component: '/management/system/roles/index.tsx',
          icon: 'mdi:shield-account-outline',
        },
      ),
    ],
  },
];

export const VIEWER_PERMISSIONS: PermissionWithChildRead[] = [
  {
    id: 'perm-workbench',
    created_at: MOCK_TIMESTAMP,
    updated_at: MOCK_TIMESTAMP,
    parent_id: null,
    is_active: true,
    label: 'sys.menu.workbench',
    type: PermissionType.CATALOGUE,
    status: BasicStatus.ENABLE,
    route: 'workbench',
    order: '0',
    name: 'workbench',
    module_name: 'system',
    icon: 'mdi:view-dashboard-outline',
    children: [
      menuPermission(
        'perm-workbench-overview',
        'sys.menu.overview',
        'overview',
        [PermissionActionType.READ],
        {
          parent_id: 'perm-workbench',
          order: '0',
          component: '/workbench/overview/index.tsx',
        },
      ),
    ],
  },
];

export function permissionsForRole(roleName: string): PermissionWithChildRead[] {
  if (roleName === 'admin') {
    return structuredClone(ADMIN_PERMISSIONS);
  }
  return structuredClone(VIEWER_PERMISSIONS);
}

export function hasPermissionAction(
  permissions: PermissionWithChildRead[],
  label: string,
  action: PermissionActionType,
): boolean {
  const walk = (nodes: PermissionWithChildRead[]): boolean =>
    nodes.some((node) => {
      if (node.label === label && node.actions_allowed?.includes(action)) {
        return true;
      }
      return node.children?.length ? walk(node.children) : false;
    });

  return walk(permissions);
}
