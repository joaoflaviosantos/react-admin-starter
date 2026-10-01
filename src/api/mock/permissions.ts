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

const EXAMPLE_READ_ACTIONS = [PermissionActionType.READ];
const EXAMPLE_MANAGE_ACTIONS = [
  PermissionActionType.CREATE,
  PermissionActionType.READ,
  PermissionActionType.UPDATE,
  PermissionActionType.DELETE,
];
const INVOICE_MANAGE_ACTIONS = [...EXAMPLE_MANAGE_ACTIONS, PermissionActionType.EXPORT];
const INVOICE_VIEW_ACTIONS = [PermissionActionType.READ, PermissionActionType.EXPORT];

function exampleMenuPermission(
  id: string,
  label: string,
  route: string,
  component: string,
  actions: PermissionActionType[],
  overrides: Partial<PermissionWithChildRead> = {},
) {
  return menuPermission(id, label, route, actions, { component, ...overrides });
}

function examplePermissions(isAdmin: boolean): PermissionWithChildRead {
  const actions = isAdmin ? EXAMPLE_MANAGE_ACTIONS : EXAMPLE_READ_ACTIONS;
  const invoiceActions = isAdmin ? INVOICE_MANAGE_ACTIONS : INVOICE_VIEW_ACTIONS;
  const revenueChildren = [
    exampleMenuPermission(
      'perm-examples-subscriptions',
      'examples.menu.subscriptions',
      'subscriptions',
      '/examples/subscriptions/index.tsx',
      actions,
      { parent_id: 'perm-examples-revenue', order: '0', icon: 'mdi:repeat' },
    ),
    exampleMenuPermission(
      'perm-examples-invoices',
      'examples.menu.invoices',
      'invoices',
      '/examples/invoices/list/index.tsx',
      invoiceActions,
      { parent_id: 'perm-examples-revenue', order: '1', icon: 'mdi:file-document-outline' },
    ),
    exampleMenuPermission(
      'perm-examples-invoices-new',
      'examples.invoices.new',
      'invoices/new',
      '/examples/invoices/editor/index.tsx',
      invoiceActions,
      {
        parent_id: 'perm-examples-revenue',
        order: '2',
        is_hide: true,
        required_action: PermissionActionType.CREATE,
      },
    ),
    exampleMenuPermission(
      'perm-examples-invoices-edit',
      'examples.invoices.edit',
      'invoices/:id/edit',
      '/examples/invoices/editor/index.tsx',
      invoiceActions,
      {
        parent_id: 'perm-examples-revenue',
        order: '3',
        is_hide: true,
        required_action: PermissionActionType.UPDATE,
      },
    ),
    exampleMenuPermission(
      'perm-examples-invoices-preview',
      'examples.invoices.preview',
      'invoices/:id',
      '/examples/invoices/preview/index.tsx',
      invoiceActions,
      {
        parent_id: 'perm-examples-revenue',
        order: '4',
        is_hide: true,
        required_action: PermissionActionType.READ,
      },
    ),
  ];

  return {
    id: 'perm-examples',
    created_at: MOCK_TIMESTAMP,
    updated_at: MOCK_TIMESTAMP,
    parent_id: null,
    is_active: true,
    label: 'examples.menu.index',
    type: PermissionType.CATALOGUE,
    status: BasicStatus.ENABLE,
    route: 'examples',
    order: '2',
    name: 'examples',
    module_name: 'examples',
    icon: 'mdi:application-brackets-outline',
    children: [
      exampleMenuPermission(
        'perm-examples-customers',
        'examples.menu.customers',
        'customers',
        '/examples/customers/index.tsx',
        actions,
        { parent_id: 'perm-examples', order: '0', icon: 'mdi:office-building-outline' },
      ),
      {
        id: 'perm-examples-revenue',
        created_at: MOCK_TIMESTAMP,
        updated_at: MOCK_TIMESTAMP,
        parent_id: 'perm-examples',
        is_active: true,
        label: 'examples.menu.revenue',
        type: PermissionType.CATALOGUE,
        status: BasicStatus.ENABLE,
        route: 'revenue',
        order: '1',
        name: 'examples-revenue',
        module_name: 'examples',
        icon: 'mdi:cash-multiple',
        actions_allowed: actions,
        children: revenueChildren,
      },
      {
        id: 'perm-examples-support',
        created_at: MOCK_TIMESTAMP,
        updated_at: MOCK_TIMESTAMP,
        parent_id: 'perm-examples',
        is_active: true,
        label: 'examples.menu.support',
        type: PermissionType.CATALOGUE,
        status: BasicStatus.ENABLE,
        route: 'support',
        order: '2',
        name: 'examples-support',
        module_name: 'examples',
        icon: 'mdi:lifebuoy',
        actions_allowed: actions,
        children: [
          exampleMenuPermission(
            'perm-examples-tickets',
            'examples.menu.tickets',
            'tickets',
            '/examples/tickets/index.tsx',
            actions,
            { parent_id: 'perm-examples-support', order: '0' },
          ),
        ],
      },
      {
        id: 'perm-examples-platform',
        created_at: MOCK_TIMESTAMP,
        updated_at: MOCK_TIMESTAMP,
        parent_id: 'perm-examples',
        is_active: true,
        label: 'examples.menu.platform',
        type: PermissionType.CATALOGUE,
        status: BasicStatus.ENABLE,
        route: 'platform',
        order: '3',
        name: 'examples-platform',
        module_name: 'examples',
        icon: 'mdi:shield-key-outline',
        actions_allowed: isAdmin ? EXAMPLE_READ_ACTIONS : [],
        is_hide: !isAdmin,
        children: [
          exampleMenuPermission(
            'perm-examples-api-keys',
            'examples.menu.apiKeys',
            'api-keys',
            '/examples/api-keys/index.tsx',
            isAdmin ? EXAMPLE_MANAGE_ACTIONS : [],
            {
              parent_id: 'perm-examples-platform',
              order: '0',
              is_hide: !isAdmin,
              required_action: PermissionActionType.READ,
            },
          ),
          exampleMenuPermission(
            'perm-examples-audit-logs',
            'examples.menu.auditLogs',
            'audit-logs',
            '/examples/audit-logs/index.tsx',
            isAdmin ? EXAMPLE_READ_ACTIONS : [],
            {
              parent_id: 'perm-examples-platform',
              order: '1',
              is_hide: !isAdmin,
              required_action: PermissionActionType.READ,
            },
          ),
        ],
      },
    ],
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
  examplePermissions(true),
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
    order: '1',
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
  examplePermissions(false),
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
