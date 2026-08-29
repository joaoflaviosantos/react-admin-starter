import { useQuery } from '@tanstack/react-query';
import { Card, Descriptions, Drawer, Space, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { permissionsForRole } from '@/api/mock/permissions';
import roleService from '@/api/services/system/roleService';
import { flattenTrees } from '@/utils/tree';

import type { RoleRead } from '#/system/role';
import { PermissionType } from '#/enum';

export default function ManagementSystemRolesPage() {
  const { t } = useTranslation();
  const [selectedRole, setSelectedRole] = useState<RoleRead | null>(null);

  const { data, isFetching } = useQuery({
    queryKey: ['management-system-roles'],
    queryFn: () =>
      roleService.getPaginatedRoleList({
        page: 1,
        items_per_page: 20,
      }),
  });

  const permissionRows = useMemo(() => {
    if (!selectedRole) return [];
    const tree = permissionsForRole(selectedRole.name);
    return flattenTrees(tree).filter(
      (item) => item.type === PermissionType.MENU || item.type === PermissionType.CATALOGUE,
    );
  }, [selectedRole]);

  const columns: ColumnsType<RoleRead> = [
    {
      title: t('management.roles.tableColumns.name'),
      dataIndex: 'name',
      render: (_, record) => <Tag>{record.label || record.name}</Tag>,
    },
    {
      title: t('management.roles.tableColumns.description'),
      dataIndex: 'description',
    },
    {
      title: t('management.common.tableColumns.status'),
      dataIndex: 'is_active',
      render: (_, record) => (
        <Tag color={record.is_active ? 'success' : 'error'}>
          {record.is_active ? t('common.active') : t('common.inactive')}
        </Tag>
      ),
    },
    {
      title: t('management.common.tableColumns.action'),
      key: 'action',
      render: (_, record) => (
        <button
          type="button"
          className="text-ant-primary-default"
          onClick={() => setSelectedRole(record)}
        >
          {t('common.detailText')}
        </button>
      ),
    },
  ];

  return (
    <div className="pb-4">
      <Space direction="vertical" size="middle" className="w-full">
        <Card className="shadow-sm" bordered={false} title={t('management.roles.listTitle')}>
          <Table
            rowKey="id"
            size="small"
            loading={isFetching}
            columns={columns}
            dataSource={data?.data}
            pagination={false}
          />
        </Card>
      </Space>

      <Drawer
        title={t('management.roles.detailTitle', {
          role: selectedRole?.label ?? selectedRole?.name ?? '',
        })}
        open={selectedRole !== null}
        onClose={() => setSelectedRole(null)}
        width={520}
      >
        {selectedRole && (
          <>
            <Descriptions column={1} size="small" className="!mb-4">
              <Descriptions.Item label={t('management.roles.tableColumns.name')}>
                {selectedRole.label || selectedRole.name}
              </Descriptions.Item>
              <Descriptions.Item label={t('management.roles.tableColumns.description')}>
                {selectedRole.description}
              </Descriptions.Item>
            </Descriptions>

            <Table
              rowKey="id"
              size="small"
              pagination={false}
              dataSource={permissionRows}
              columns={[
                {
                  title: t('management.roles.permissions.columns.label'),
                  dataIndex: 'label',
                  render: (value: string) => t(value),
                },
                {
                  title: t('management.roles.permissions.columns.route'),
                  dataIndex: 'route',
                },
                {
                  title: t('management.roles.permissions.columns.actions'),
                  dataIndex: 'actions_allowed',
                  render: (actions: string[] | null | undefined) =>
                    (actions ?? []).map((action) => <Tag key={action}>{action}</Tag>),
                },
              ]}
            />
          </>
        )}
      </Drawer>
    </div>
  );
}
