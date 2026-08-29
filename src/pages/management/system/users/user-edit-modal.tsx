import { useMutation, useQueryClient } from '@tanstack/react-query';
import { App, Form, Input, Modal, Select, Switch } from 'antd';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import userService, { UpdateUserInfoRequest } from '@/api/services/system/userService';

import type { UserRead } from '#/system/user';

export interface UserEditModalProps {
  user: UserRead | null;
  show: boolean;
  onClose: () => void;
}

interface UserEditFormValues {
  name: string;
  email: string;
  default_language: string;
  is_active: boolean;
}

const LANGUAGE_OPTIONS = [
  { label: 'Português (Brasil)', value: 'pt_BR' },
  { label: 'English (US)', value: 'en_US' },
];

export function UserEditModal({ user, show, onClose }: UserEditModalProps) {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const [form] = Form.useForm<UserEditFormValues>();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (show && user) {
      form.setFieldsValue({
        name: user.name,
        email: user.email,
        default_language: user.default_language || 'pt_BR',
        is_active: user.is_active ?? true,
      });
    }
  }, [form, show, user]);

  const mutation = useMutation({
    mutationFn: (data: UpdateUserInfoRequest) => userService.updateUserById(user?.id || '', data),
    onSuccess: () => {
      message.success(t('management.users.messages.updateSuccess'));
      void queryClient.invalidateQueries({ queryKey: ['management-system-users'] });
      onClose();
    },
    onError: () => {
      message.error(t('management.users.messages.updateError'));
    },
  });

  const handleOk = async () => {
    if (!user) return;
    const values = await form.validateFields();
    const payload: UpdateUserInfoRequest = {};

    if (values.name !== user.name) payload.name = values.name;
    if (values.email !== user.email) payload.email = values.email;
    if (values.default_language !== user.default_language) {
      payload.default_language = values.default_language;
    }
    if (values.is_active !== user.is_active) payload.is_active = values.is_active;

    if (Object.keys(payload).length === 0) {
      message.info(t('common.noChanges'));
      onClose();
      return;
    }

    mutation.mutate(payload);
  };

  return (
    <Modal
      title={t('management.users.editTitle')}
      open={show}
      onOk={() => void handleOk()}
      onCancel={onClose}
      confirmLoading={mutation.isPending}
      okText={t('common.saveText')}
      cancelText={t('common.cancelText')}
      maskClosable={false}
      centered
      destroyOnClose
    >
      <Form form={form} layout="vertical">
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
          label={t('management.users.forms.basicData.defaultLanguage')}
          name="default_language"
          rules={[{ required: true, message: t('common.requiredField') }]}
        >
          <Select disabled={mutation.isPending} options={LANGUAGE_OPTIONS} />
        </Form.Item>
        <Form.Item
          label={t('management.users.forms.securityData.isActive')}
          name="is_active"
          valuePropName="checked"
        >
          <Switch
            checkedChildren={t('common.active')}
            unCheckedChildren={t('common.inactive')}
            disabled={mutation.isPending}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
