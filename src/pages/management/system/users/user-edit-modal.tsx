import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import userService, { UpdateUserInfoRequest } from '@/api/services/system/userService';
import { AdminForm } from '@/components/admin/form';
import {
  FormFieldInput,
  FormFieldSelect,
  FormFieldSwitch,
} from '@/components/admin/form/form-field';
import { DividerScheFlow } from '@/components/divider';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { appToast } from '@/lib/toast';
import { modalContentWidthLgClass } from '@/lib/overlay-surface';
import { cn } from '@/lib/utils';
import { createUserEditSchema, type UserEditFormValues } from './schema';

import type { UserRead } from '#/system/user';

export interface UserEditModalProps {
  user: UserRead | null;
  show: boolean;
  onClose: () => void;
}

const LANGUAGE_OPTIONS = [
  { label: 'Português (Brasil)', value: 'pt_BR' },
  { label: 'English (US)', value: 'en_US' },
];

export function UserEditModal({ user, show, onClose }: UserEditModalProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const schema = useMemo(() => createUserEditSchema(t), [t]);

  const form = useForm<UserEditFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      default_language: 'pt_BR',
      is_active: true,
    },
  });

  useEffect(() => {
    if (show && user) {
      form.reset({
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
      appToast.success(t('management.users.messages.updateSuccess'));
      void queryClient.invalidateQueries({ queryKey: ['management-system-users'] });
      onClose();
    },
    onError: () => {
      appToast.error(t('management.users.messages.updateError'));
    },
  });

  const handleSubmit = (values: UserEditFormValues) => {
    if (!user) return;
    const payload: UpdateUserInfoRequest = {};

    if (values.name !== user.name) payload.name = values.name;
    if (values.email !== user.email) payload.email = values.email;
    if (values.default_language !== user.default_language) {
      payload.default_language = values.default_language;
    }
    if (values.is_active !== user.is_active) payload.is_active = values.is_active;

    if (Object.keys(payload).length === 0) {
      appToast.info(t('common.noChanges'));
      onClose();
      return;
    }

    mutation.mutate(payload);
  };

  return (
    <Dialog open={show} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={cn(modalContentWidthLgClass)}>
        <DialogHeader>
          <DialogTitle>{t('management.users.editTitle')}</DialogTitle>
        </DialogHeader>
        <AdminForm form={form} onSubmit={handleSubmit} className="flex flex-col">
          <DialogBody className="space-y-4">
            <DividerScheFlow>{t('management.users.forms.basicData.index')}</DividerScheFlow>
            <FormFieldInput
              control={form.control}
              name="email"
              label={t('management.users.forms.basicData.email')}
              disabled={mutation.isPending}
            />
            <FormFieldInput
              control={form.control}
              name="name"
              label={t('management.users.forms.basicData.name')}
              disabled={mutation.isPending}
            />
            <FormFieldSelect
              control={form.control}
              name="default_language"
              label={t('management.users.forms.basicData.defaultLanguage')}
              options={LANGUAGE_OPTIONS}
              disabled={mutation.isPending}
            />
            <DividerScheFlow>{t('management.users.forms.securityData.index')}</DividerScheFlow>
            <FormFieldSwitch
              control={form.control}
              name="is_active"
              label={t('management.users.forms.securityData.isActive')}
              disabled={mutation.isPending}
            />
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t('common.cancelText')}
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {t('common.saveText')}
            </Button>
          </DialogFooter>
        </AdminForm>
      </DialogContent>
    </Dialog>
  );
}
