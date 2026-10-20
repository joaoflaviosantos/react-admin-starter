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

const RESOURCE_READ_ACTIONS = [PermissionActionType.READ];
const RESOURCE_MANAGE_ACTIONS = [
  PermissionActionType.CREATE,
  PermissionActionType.READ,
  PermissionActionType.UPDATE,
  PermissionActionType.DELETE,
];
const INVOICE_MANAGE_ACTIONS = [...RESOURCE_MANAGE_ACTIONS, PermissionActionType.EXPORT];
const INVOICE_VIEW_ACTIONS = [PermissionActionType.READ, PermissionActionType.EXPORT];

function resourceMenuPermission(
  id: string,
  label: string,
  route: string,
  component: string,
  actions: PermissionActionType[],
  overrides: Partial<PermissionWithChildRead> = {},
) {
  return menuPermission(id, label, route, actions, { component, ...overrides });
}

function resourcePermissions(isAdmin: boolean): PermissionWithChildRead[] {
  const actions = isAdmin ? RESOURCE_MANAGE_ACTIONS : RESOURCE_READ_ACTIONS;
  const invoiceActions = isAdmin ? INVOICE_MANAGE_ACTIONS : INVOICE_VIEW_ACTIONS;
  const revenueChildren = [
    resourceMenuPermission(
      'perm-app-subscriptions',
      'app.menu.subscriptions',
      'subscriptions',
      '/subscriptions/index.tsx',
      actions,
      { parent_id: 'perm-app-revenue', order: '0', icon: 'mdi:repeat' },
    ),
    resourceMenuPermission(
      'perm-app-invoices',
      'app.menu.invoices',
      'invoices',
      '/invoices/index.tsx',
      invoiceActions,
      { parent_id: 'perm-app-revenue', order: '1', icon: 'mdi:file-document-outline' },
    ),
  ];

  return [
    resourceMenuPermission(
      'perm-app-customers',
      'app.menu.customers',
      'customers',
      '/customers/index.tsx',
      actions,
      { order: '1', icon: 'mdi:office-building-outline' },
    ),
    {
      id: 'perm-app-revenue',
      created_at: MOCK_TIMESTAMP,
      updated_at: MOCK_TIMESTAMP,
      parent_id: null,
      is_active: true,
      label: 'app.menu.revenue',
      type: PermissionType.CATALOGUE,
      status: BasicStatus.ENABLE,
      route: 'revenue',
      order: '2',
      name: 'app-revenue',
      module_name: 'app',
      icon: 'mdi:cash-multiple',
      actions_allowed: actions,
      children: revenueChildren,
    },
    {
      id: 'perm-app-support',
      created_at: MOCK_TIMESTAMP,
      updated_at: MOCK_TIMESTAMP,
      parent_id: null,
      is_active: true,
      label: 'app.menu.support',
      type: PermissionType.CATALOGUE,
      status: BasicStatus.ENABLE,
      route: 'support',
      order: '3',
      name: 'app-support',
      module_name: 'app',
      icon: 'mdi:lifebuoy',
      actions_allowed: actions,
      children: [
        resourceMenuPermission(
          'perm-app-tickets',
          'app.menu.tickets',
          'tickets',
          '/tickets/index.tsx',
          actions,
          { parent_id: 'perm-app-support', order: '0' },
        ),
      ],
    },
    {
      id: 'perm-app-platform',
      created_at: MOCK_TIMESTAMP,
      updated_at: MOCK_TIMESTAMP,
      parent_id: null,
      is_active: true,
      label: 'app.menu.platform',
      type: PermissionType.CATALOGUE,
      status: BasicStatus.ENABLE,
      route: 'platform',
      order: '4',
      name: 'app-platform',
      module_name: 'app',
      icon: 'mdi:shield-key-outline',
      actions_allowed: isAdmin ? RESOURCE_READ_ACTIONS : [],
      is_hide: !isAdmin,
      children: [
        resourceMenuPermission(
          'perm-app-api-keys',
          'app.menu.apiKeys',
          'api-keys',
          '/api-keys/index.tsx',
          isAdmin ? RESOURCE_MANAGE_ACTIONS : [],
          {
            parent_id: 'perm-app-platform',
            order: '0',
            is_hide: !isAdmin,
            required_action: PermissionActionType.READ,
          },
        ),
        resourceMenuPermission(
          'perm-app-audit-logs',
          'app.menu.auditLogs',
          'audit-logs',
          '/audit-logs/index.tsx',
          isAdmin ? RESOURCE_READ_ACTIONS : [],
          {
            parent_id: 'perm-app-platform',
            order: '1',
            is_hide: !isAdmin,
            required_action: PermissionActionType.READ,
          },
        ),
      ],
    },
  ];
}

function workbenchChildren(): PermissionWithChildRead[] {
  return [
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
  ];
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
    children: workbenchChildren(),
  },
  ...resourcePermissions(true),
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
    order: '5',
    name: 'management',
    module_name: 'system',
    icon: 'mdi:cog-outline',
    children: [
      menuPermission(
        'perm-users',
        'sys.menu.management.system.users',
        'users',
        [
          PermissionActionType.READ,
          PermissionActionType.CREATE,
          PermissionActionType.UPDATE,
          PermissionActionType.DELETE,
        ],
        {
          parent_id: 'perm-management',
          order: '3',
          component: '/management/users/index.tsx',
        },
      ),
      menuPermission(
        'perm-roles',
        'sys.menu.management.system.roles',
        'roles',
        [PermissionActionType.READ],
        {
          parent_id: 'perm-management',
          order: '2',
          component: '/management/roles/index.tsx',
        },
      ),
      menuPermission(
        'perm-my-account',
        'sys.menu.management.myAccount',
        'my-account',
        [PermissionActionType.READ],
        {
          parent_id: 'perm-management',
          order: '1',
          component: '/management/my-account/index.tsx',
          is_hide: false,
          is_tab_hide: false,
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
    children: workbenchChildren(),
  },
  ...resourcePermissions(false),
  {
    id: 'perm-management-viewer',
    created_at: MOCK_TIMESTAMP,
    updated_at: MOCK_TIMESTAMP,
    parent_id: null,
    is_active: true,
    label: 'sys.menu.management.index',
    type: PermissionType.CATALOGUE,
    status: BasicStatus.ENABLE,
    route: 'management',
    order: '5',
    name: 'management',
    module_name: 'system',
    children: [
      menuPermission(
        'perm-my-account-viewer',
        'sys.menu.management.myAccount',
        'my-account',
        [PermissionActionType.READ],
        {
          parent_id: 'perm-management-viewer',
          order: '1',
          component: '/management/my-account/index.tsx',
          is_hide: false,
          is_tab_hide: false,
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
