import { CloseCircleFilled } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { App, Avatar, Button, Card, Col, Form, Input, Row, Space, Tag } from 'antd';
import Table, { ColumnsType, TableProps } from 'antd/es/table';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import userService, { SystemUserAPISearchFormFieldType } from '@/api/services/system/userService';
import TableActions from '@/components/table/actions';
import useDynamicComponentStringHeight from '@/hooks/components/use-dynamic-component-string-height';
import { useHasRequiredPermission } from '@/hooks/permissions/use-has-required-permission';
import { useMatchRouteMeta } from '@/router/hooks';
import { getColorFromName } from '@/utils/colors';
import { getInitials } from '@/utils/format-string';

import { UserCreateModal, UserCreateModalProps } from './user-create-modal';
import { UserEditModal } from './user-edit-modal';

import type { UserCreate, UserRead } from '#/system/user';

const DEFAULT_USER_VALUE: UserCreate = {
  email: '',
  name: '',
  role_id: '',
};

function formatDate(value?: string | null) {
  if (!value) return '—';
  return new Date(value).toLocaleString();
}

export default function ManagementSystemUsersPage() {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const tableHeight = useDynamicComponentStringHeight();
  const queryClient = useQueryClient();
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10 });
  const [searchForm] = Form.useForm();
  const [searchValues, setSearchValues] = useState<SystemUserAPISearchFormFieldType>({});
  const currentRouteMeta = useMatchRouteMeta();
  const { canCreate } = useHasRequiredPermission(currentRouteMeta?.label);
  const [editUser, setEditUser] = useState<UserRead | null>(null);
  const [userModalProps, setUserCreateModalProps] = useState<UserCreateModalProps>({
    formValue: { ...DEFAULT_USER_VALUE },
    title: t('common.newText'),
    show: false,
    onReset: () => {
      setUserCreateModalProps((prev) => ({
        ...prev,
        show: false,
        formValue: { ...DEFAULT_USER_VALUE },
      }));
    },
    onCancel: () => {
      setUserCreateModalProps((prev) => ({ ...prev, show: false }));
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      userService.updateUserById(id, { is_active: !isActive }),
    onSuccess: () => {
      message.success(t('management.users.messages.updateSuccess'));
      void queryClient.invalidateQueries({ queryKey: ['management-system-users'] });
    },
    onError: () => {
      message.error(t('management.users.messages.updateError'));
    },
  });

  const { data, isFetching } = useQuery({
    queryKey: ['management-system-users', pagination.page, pagination.pageSize, searchValues],
    queryFn: () =>
      userService.getPaginatedUserList({
        page: pagination.page,
        items_per_page: pagination.pageSize,
        searchValues,
      }),
  });

  const onSearch = () => {
    const fields = searchForm.getFieldsValue();
    const filteredFields = Object.fromEntries(
      Object.entries(fields).filter(
        ([, value]) => value !== undefined && value !== null && value !== '',
      ),
    ) as SystemUserAPISearchFormFieldType;
    setSearchValues(filteredFields);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const columns: ColumnsType<UserRead> = [
    {
      title: t('management.users.tableColumns.name'),
      dataIndex: 'name',
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Avatar style={{ backgroundColor: getColorFromName(record.name) }}>
            {getInitials(record.name, 2)}
          </Avatar>
          <span className="font-medium">{record.name}</span>
        </div>
      ),
    },
    {
      title: t('management.users.tableColumns.email'),
      dataIndex: 'email',
    },
    {
      title: t('management.users.tableColumns.role'),
      dataIndex: 'role_label',
      render: (_, record) => <Tag>{record.role_label || record.role}</Tag>,
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
      title: t('management.common.tableColumns.lastUpdate'),
      dataIndex: 'updated_at',
      render: (_, record) => formatDate(record.updated_at),
    },
    {
      title: t('management.common.tableColumns.action'),
      key: 'action',
      align: 'center',
      render: (_, record) => (
        <TableActions
          permissionLabel={currentRouteMeta?.label}
          record={record}
          onUpdate={(id) => {
            const recordToEdit = data?.data?.find((item) => item.id === id) ?? null;
            setEditUser(recordToEdit);
          }}
          onToggleActive={(id, isActive) => toggleActiveMutation.mutate({ id, isActive })}
        />
      ),
    },
  ];

  const handleTableChange: TableProps<UserRead>['onChange'] = (nextPagination) => {
    setPagination({
      page: nextPagination.current ?? 1,
      pageSize: nextPagination.pageSize ?? 10,
    });
  };

  return (
    <div className="pb-4">
      <Space direction="vertical" size="middle" className="w-full">
        <Card className="shadow-sm" bordered={false}>
          <Form form={searchForm} onFinish={onSearch}>
            <Row gutter={[16, 16]}>
              <Col span={24} lg={8}>
                <Form.Item
                  label={t('management.users.tableColumns.name')}
                  name="name"
                  className="!mb-0"
                >
                  <Input allowClear disabled={isFetching} />
                </Form.Item>
              </Col>
              <Col span={24} lg={8}>
                <Form.Item
                  label={t('management.users.tableColumns.role')}
                  name="role"
                  className="!mb-0"
                >
                  <Input
                    allowClear={{
                      clearIcon: (
                        <CloseCircleFilled
                          onClick={() => {
                            searchForm.setFieldValue('role', undefined);
                            const next = { ...searchValues };
                            delete next.role;
                            setSearchValues(next);
                          }}
                        />
                      ),
                    }}
                    disabled={isFetching}
                  />
                </Form.Item>
              </Col>
              <Col span={24} lg={8}>
                <div className="flex justify-end gap-3 pt-7 lg:pt-0">
                  <Button
                    onClick={() => {
                      searchForm.resetFields();
                      setSearchValues({});
                    }}
                    disabled={isFetching}
                  >
                    {t('common.clearText')}
                  </Button>
                  <Button type="primary" htmlType="submit" disabled={isFetching}>
                    {t('common.searchText')}
                  </Button>
                </div>
              </Col>
            </Row>
          </Form>
        </Card>

        <Card
          className="shadow-sm"
          bordered={false}
          title={t('management.users.listTitle')}
          extra={
            <Button
              type="primary"
              disabled={!canCreate || isFetching}
              onClick={() =>
                setUserCreateModalProps((prev) => ({
                  ...prev,
                  show: true,
                  title: t('management.users.newModalText'),
                }))
              }
            >
              {t('common.newText')}
            </Button>
          }
        >
          <Table
            rowKey="id"
            size="small"
            scroll={{ x: 'max-content', y: tableHeight }}
            columns={columns}
            loading={isFetching}
            dataSource={data?.data}
            onChange={handleTableChange}
            pagination={{
              current: data?.page ?? pagination.page,
              pageSize: data?.items_per_page ?? pagination.pageSize,
              total: data?.total_count ?? 0,
              showSizeChanger: true,
            }}
          />
        </Card>

        <UserCreateModal {...userModalProps} />
        <UserEditModal user={editUser} show={editUser !== null} onClose={() => setEditUser(null)} />
      </Space>
    </div>
  );
}
