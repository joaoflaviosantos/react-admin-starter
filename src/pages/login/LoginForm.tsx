import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

import { AdminForm } from '@/components/admin/form';
import { FormFieldInput } from '@/components/admin/form/form-field';
import { Button } from '@/components/ui/button';
import { useSignIn } from '@/store/userStore';

import { createLoginSchema, type LoginFormValues } from './schema';
import { LoginStateEnum, useLoginStateContext } from './providers/LoginStateProvider';
import { useSettings } from '@/store/settingStore';
import { ThemeMode } from '@/types/enum';
import Logo from '@/components/logo';

export default function LoginForm() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { loginState, setLoginState } = useLoginStateContext();
  const signIn = useSignIn();
  const { themeMode } = useSettings();

  const schema = useMemo(() => createLoginSchema(t), [t]);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  if (loginState !== LoginStateEnum.LOGIN) return null;

  const handleFinish = async (values: LoginFormValues) => {
    setLoading(true);
    try {
      await signIn({ username: values.email, password: values.password });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="my-20 flex h-16 justify-center">
        <Logo darkMode={themeMode === ThemeMode.Dark} withLink={false} className="h-full w-full" />
      </div>
      <div className="mb-4 text-2xl font-bold xl:text-3xl">{t('sys.login.signInFormTitle')}</div>

      <AdminForm form={form} onSubmit={handleFinish} className="mt-6 space-y-6">
        <FormFieldInput
          control={form.control}
          name="email"
          label=""
          placeholder={t('sys.login.emailPlaceholder')}
          autoComplete="email"
          prefix={<User className="size-4" />}
        />
        <FormFieldInput
          control={form.control}
          name="password"
          label=""
          type={showPassword ? 'text' : 'password'}
          placeholder={t('sys.login.passwordPlaceholder')}
          prefix={<Lock className="size-4" />}
          suffix={
            <div
              className="cursor-pointer hover:text-foreground"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </div>
          }
        />

        <div className="mt-2 flex items-center justify-between">
          <label className="flex cursor-pointer items-center text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                className="size-4 cursor-pointer rounded-sm accent-primary"
                defaultChecked
              />
              <span className="text-sm">{t('sys.login.rememberMe')}</span>
            </div>
          </label>
          <div
            onClick={() => setLoginState(LoginStateEnum.RESET_PASSWORD)}
            className="cursor-pointer text-sm text-muted-foreground underline hover:text-foreground"
          >
            {t('sys.login.forgetPassword')}
          </div>
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {t('sys.login.loginButton')}
        </Button>

        {/* Disabled on demo version
        <div className="flex justify-between items-center text-sm gap-2">
          <Button variant="outline" className="flex-1" type="button" onClick={() => setLoginState(LoginStateEnum.REGISTER)}>
            {t('sys.login.signUpFormTitle', 'Register')}
          </Button>
        </div>
        */}
      </AdminForm>

      <Alert className="mt-8">
        <AlertTitle>{t('sys.login.demoCredentials')}</AlertTitle>
        <AlertDescription>
          <ul className="mb-0 mt-2 list-disc pl-4 text-xs">
            <li>
              Admin: <strong>admin@example.com</strong> / <strong>admin123</strong>
            </li>
            <li>
              Viewer: <strong>viewer@example.com</strong> / <strong>viewer123</strong>
            </li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
}
