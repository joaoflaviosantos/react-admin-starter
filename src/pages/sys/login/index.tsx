import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';

import { SignInReq } from '@/api/services/authService';
import { AdminForm } from '@/components/admin/form';
import { FormFieldInput } from '@/components/admin/form/form-field';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSignIn, useUserInfo, useUserToken } from '@/store/userStore';
import { isUserWithPermissionsRead } from '@/utils/permission';

import { createLoginSchema, type LoginFormValues } from './schema';

const HOMEPAGE = import.meta.env.VITE_APP_HOMEPAGE ?? '/workbench/overview';

export default function LoginPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const token = useUserToken();
  const userInfo = useUserInfo();
  const signIn = useSignIn();

  const schema = useMemo(() => createLoginSchema(t), [t]);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { username: '', password: '' },
  });

  if (token.access_token && isUserWithPermissionsRead(userInfo)) {
    return <Navigate to={HOMEPAGE} replace />;
  }

  const handleFinish = async (values: SignInReq) => {
    setLoading(true);
    try {
      await signIn(values);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-layout p-6">
      <Card className="w-full max-w-md shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl">{t('sys.login.signInFormTitle')}</CardTitle>
          <CardDescription>{t('sys.login.demoHint')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6">
            <AlertTitle>{t('sys.login.demoCredentials')}</AlertTitle>
            <AlertDescription>
              <ul className="mb-0 list-disc pl-4">
                <li>
                  Admin: <strong>admin</strong> / <strong>admin123</strong>
                </li>
                <li>
                  Viewer: <strong>viewer</strong> / <strong>viewer123</strong>
                </li>
              </ul>
            </AlertDescription>
          </Alert>

          <AdminForm form={form} onSubmit={handleFinish} className="space-y-4">
            <FormFieldInput
              control={form.control}
              name="username"
              label={t('sys.login.username')}
              placeholder={t('sys.login.usernamePlaceholder')}
              autoComplete="username"
            />
            <FormFieldInput
              control={form.control}
              name="password"
              label={t('sys.login.password')}
              type="password"
              placeholder={t('sys.login.passwordPlaceholder')}
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {t('sys.login.loginButton')}
            </Button>
          </AdminForm>
        </CardContent>
      </Card>
    </div>
  );
}
