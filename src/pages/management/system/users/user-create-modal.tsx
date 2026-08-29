import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { App, Form, Input, Modal, Select } from 'antd';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import roleService from '@/api/services/system/roleService';
import userService from '@/api/services/system/userService';

import type { UserCreate } from '#/system/user';

export type UserCreateModalProps = {
  formValue: UserCreate;
  title: string;
  show: boolean;
  onReset: VoidFunction;
  onCancel: VoidFunction;
};

export function UserCreateModal({
  title,
  show,
  formValue,
  onReset,
  onCancel,
}: UserCreateModalProps) {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const [form] = Form.useForm<UserCreate & { confirmPassword?: string }>();
  const queryClient = useQueryClient();

  const { data: roles, isFetching: rolesLoading } = useQuery({
    queryKey: ['management-system-roles-for-user-creation'],
    queryFn: () =>
      roleService.getPaginatedRoleList({
        page: 1,
        items_per_page: 100,
      }),
    enabled: show,
  });

  useEffect(() => {
    if (show) {
      form.setFieldsValue(formValue);
    }
  }, [form, formValue, show]);

  const mutation = useMutation({
    mutationFn: userService.createUser,
    onSuccess: () => {
      form.resetFields();
      onReset();
      message.success(t('management.users.messages.createSuccess'));
      void queryClient.invalidateQueries({ queryKey: ['management-system-users'] });
    },
    onError: () => {
      message.error(t('management.users.messages.createError'));
    },
  });

  const handleOk = async () => {
    const values = await form.validateFields();
    mutation.mutate({
      email: values.email,
      name: values.name,
      role_id: values.role_id,
      password: values.password || `${values.name?.trim() ?? 'user'}-change-later`,
    });
  };

  return (
    <Modal
      title={title}
      open={show}
      onOk={() => void handleOk()}
      confirmLoading={mutation.isPending}
      okText={t('common.saveText')}
      onCancel={onCancel}
      maskClosable={false}
      centered
      destroyOnClose
    >
      <Form form={form} layout="vertical" initialValues={formValue}>
        <Form.Item
          label={t('management.users.forms.basicData.email')}
          name="email"
          rules={[
            { required: true, message: t('common.requiredField') },
            { type: 'email', message: t('common.invalidEmail') },
          ]}
        >
          <Input disabled={mutation.isPending} />
        </Form.Item>
        <Form.Item
          label={t('management.users.forms.basicData.name')}
          name="name"
          rules={[{ required: true, message: t('common.requiredField') }]}
        >
          <Input disabled={mutation.isPending} />
        </Form.Item>
        <Form.Item
          label={t('management.users.forms.securityData.role')}
          name="role_id"
          rules={[{ required: true, message: t('common.requiredField') }]}
        >
          <Select
            disabled={rolesLoading || mutation.isPending}
            options={roles?.data?.map((role) => ({ label: role.label, value: role.id }))}
          />
        </Form.Item>
        <Form.Item label={t('management.users.forms.securityData.password')} name="password">
          <Input.Password
            disabled={mutation.isPending}
            placeholder={t('management.users.forms.securityData.passwordOptional')}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
