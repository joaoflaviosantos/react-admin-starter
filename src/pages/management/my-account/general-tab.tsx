import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { User, Lock, Mail, Eye, EyeOff } from 'lucide-react';

import userService, {
  UpdateUserInfoRequest,
  ChangePasswordRequest,
} from '@/api/services/system/userService';
import { AdminForm } from '@/components/admin/form';
import { FormFieldInput, FormFieldSelect } from '@/components/admin/form/form-field';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useUserActions, useUserInfo } from '@/store/userStore';

import {
  createPersonalInfoSchema,
  createSecuritySchema,
  type PersonalInfoValues,
  type SecurityValues,
} from './schema';

export default function GeneralTab() {
  const { t } = useTranslation();
  const userInfo = useUserInfo();
  const { setUserInfo } = useUserActions();
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });

  const personalInfoSchema = useMemo(() => createPersonalInfoSchema(t), [t]);
  const securitySchema = useMemo(() => createSecuritySchema(t), [t]);

  const personalForm = useForm<PersonalInfoValues>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      name: userInfo.name || '',
      email: userInfo.email || '',
      default_language: userInfo.default_language || 'pt_BR',
    },
  });

  const securityForm = useForm<SecurityValues>({
    resolver: zodResolver(securitySchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const updateInfoMutation = useMutation({
    mutationFn: (data: UpdateUserInfoRequest) => userService.updateMyInfo(data),
    onSuccess: (_: { message: string }, variables: UpdateUserInfoRequest) => {
      setUserInfo({ ...userInfo, ...variables } as Parameters<typeof setUserInfo>[0]);
      queryClient.invalidateQueries({ queryKey: ['my-user-data-signin'] });
      toast.success(
        t('management.myAccount.personalInfo.messages.updateSuccess', 'Info updated successfully'),
      );
    },
    onError: () => {
      toast.error(
        t('management.myAccount.personalInfo.messages.updateError', 'Failed to update info'),
      );
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data: ChangePasswordRequest) => userService.changeMyPassword(data),
    onSuccess: () => {
      toast.success(
        t(
          'management.myAccount.security.messages.changePasswordSuccess',
          'Password changed successfully',
        ),
      );
      securityForm.reset();
    },
    onError: () => {
      toast.error(
        t(
          'management.myAccount.security.messages.changePasswordError',
          'Failed to change password',
        ),
      );
    },
  });

  const onPersonalSubmit = (values: PersonalInfoValues) => {
    updateInfoMutation.mutate({
      name: values.name,
      email: values.email,
      default_language: values.default_language,
    });
  };

  const onSecuritySubmit = (values: SecurityValues) => {
    changePasswordMutation.mutate({
      current_password: values.currentPassword,
      new_password: values.newPassword,
    });
  };

  const languageOptions = [
    { label: 'Português (Brasil)', value: 'pt_BR' },
    { label: 'English (US)', value: 'en_US' },
    { label: 'Español', value: 'es_ES' },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {/* Basic Avatar Card (Placeholder since UploadAvatar is missing) */}
      <Card className="col-span-1 border-none shadow-md md:col-span-1">
        <CardContent className="flex flex-col items-center justify-center p-10">
          <div className="flex h-32 w-32 items-center justify-center rounded-full bg-primary/10 text-4xl text-primary">
            {userInfo.name?.charAt(0).toUpperCase()}
          </div>
          <div className="mt-4 text-center">
            <h3 className="font-semibold">{userInfo.name}</h3>
            <p className="text-sm text-muted-foreground">{userInfo.email}</p>
          </div>
        </CardContent>
      </Card>

      <div className="col-span-1 flex flex-col gap-6 md:col-span-2">
        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle>
              {t('management.myAccount.personalInfo.title', 'Personal Information')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AdminForm form={personalForm} onSubmit={onPersonalSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormFieldInput
                  control={personalForm.control}
                  name="name"
                  label={t('management.myAccount.personalInfo.name', 'Name')}
                  prefix={<User className="size-4" />}
                />
                <FormFieldInput
                  control={personalForm.control}
                  name="email"
                  label={t('management.myAccount.personalInfo.email', 'Email')}
                  prefix={<Mail className="size-4" />}
                />
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormFieldSelect
                  control={personalForm.control}
                  name="default_language"
                  label={t('management.myAccount.personalInfo.defaultLanguage', 'Language')}
                  options={languageOptions}
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={updateInfoMutation.isPending}>
                  {t('management.myAccount.personalInfo.saveChanges', 'Save Changes')}
                </Button>
              </div>
            </AdminForm>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle>{t('management.myAccount.security.title', 'Security')}</CardTitle>
          </CardHeader>
          <CardContent>
            <AdminForm form={securityForm} onSubmit={onSecuritySubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <FormFieldInput
                  control={securityForm.control}
                  name="currentPassword"
                  label={t('management.myAccount.security.currentPassword', 'Current Password')}
                  type={showPassword.current ? 'text' : 'password'}
                  prefix={<Lock className="size-4" />}
                  suffix={
                    <div
                      className="cursor-pointer hover:text-foreground"
                      onClick={() =>
                        setShowPassword({ ...showPassword, current: !showPassword.current })
                      }
                    >
                      {showPassword.current ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </div>
                  }
                />
                <FormFieldInput
                  control={securityForm.control}
                  name="newPassword"
                  label={t('management.myAccount.security.newPassword', 'New Password')}
                  type={showPassword.new ? 'text' : 'password'}
                  prefix={<Lock className="size-4" />}
                  suffix={
                    <div
                      className="cursor-pointer hover:text-foreground"
                      onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                    >
                      {showPassword.new ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </div>
                  }
                />
                <FormFieldInput
                  control={securityForm.control}
                  name="confirmPassword"
                  label={t('management.myAccount.security.confirmNewPassword', 'Confirm Password')}
                  type={showPassword.confirm ? 'text' : 'password'}
                  prefix={<Lock className="size-4" />}
                  suffix={
                    <div
                      className="cursor-pointer hover:text-foreground"
                      onClick={() =>
                        setShowPassword({ ...showPassword, confirm: !showPassword.confirm })
                      }
                    >
                      {showPassword.confirm ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </div>
                  }
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={changePasswordMutation.isPending}>
                  {t('management.myAccount.security.changePassword', 'Change Password')}
                </Button>
              </div>
            </AdminForm>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
