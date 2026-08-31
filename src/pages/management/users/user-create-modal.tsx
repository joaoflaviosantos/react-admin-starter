import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import roleService from '@/api/services/system/roleService';
import userService from '@/api/services/system/userService';
import { AdminForm } from '@/components/admin/form';
import { FormFieldInput, FormFieldSelect } from '@/components/admin/form/form-field';
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
import { createUserCreateSchema, type UserCreateFormValues } from './schema';

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
  const queryClient = useQueryClient();
  const schema = useMemo(() => createUserCreateSchema(t), [t]);

  const form = useForm<UserCreateFormValues>({
    resolver: zodResolver(schema),
    defaultValues: formValue,
  });

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
      form.reset(formValue);
    }
  }, [form, formValue, show]);

  const mutation = useMutation({
    mutationFn: userService.createUser,
    onSuccess: () => {
      form.reset();
      onReset();
      appToast.success(t('management.users.messages.createSuccess'));
      void queryClient.invalidateQueries({ queryKey: ['management-system-users'] });
    },
    onError: () => {
      appToast.error(t('management.users.messages.createError'));
    },
  });

  const handleSubmit = (values: UserCreateFormValues) => {
    mutation.mutate({
      email: values.email,
      name: values.name,
      role_id: values.role_id,
      password: values.password || `${values.name?.trim() ?? 'user'}-change-later`,
    });
  };

  const roleOptions = useMemo(
    () =>
      (roles?.data ?? []).map((role) => ({
        label: role.label,
        value: role.id,
      })),
    [roles?.data],
  );

  return (
    <Dialog open={show} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className={cn(modalContentWidthLgClass)}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
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
            <DividerScheFlow>{t('management.users.forms.securityData.index')}</DividerScheFlow>
            <FormFieldSelect
              control={form.control}
              name="role_id"
              label={t('management.users.forms.securityData.role')}
              placeholder={t('common.requiredField')}
              options={roleOptions}
              disabled={rolesLoading || mutation.isPending}
            />
            <FormFieldInput
              control={form.control}
              name="password"
              type="password"
              label={t('management.users.forms.securityData.password')}
              placeholder={t('management.users.forms.securityData.passwordOptional')}
              disabled={mutation.isPending}
            />
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel}>
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
