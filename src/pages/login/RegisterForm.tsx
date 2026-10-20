import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { LoginStateEnum, useLoginStateContext } from './providers/LoginStateProvider';
import LogoDark from '@/assets/branding/company_logo_dark.svg';
import LogoLight from '@/assets/branding/company_logo_light.svg';
import { useSettings } from '@/store/settingStore';
import { ThemeMode } from '@/types/enum';

export default function RegisterForm() {
  const { t } = useTranslation();
  const { loginState, backToLogin } = useLoginStateContext();
  const { themeMode } = useSettings();

  if (loginState !== LoginStateEnum.REGISTER) return null;

  return (
    <div className="w-full">
      <div className="my-20 flex justify-center">
        <img
          src={themeMode === ThemeMode.Dark ? LogoDark : LogoLight}
          alt="Logo"
          className="w-full"
        />
      </div>
      <div className="mb-4 text-2xl font-bold xl:text-3xl">{t('sys.login.signUpFormTitle')}</div>
      <div className="mt-6 space-y-4">
        {/* Registration form fields would go here */}
        <p className="mb-4 text-sm text-muted-foreground">
          Register functionality is not implemented in this demo.
        </p>
        <Button className="w-full" size="lg" disabled>
          {t('sys.login.registerButton', 'Register')}
        </Button>
        <Button variant="outline" className="w-full" size="lg" onClick={backToLogin}>
          {t('sys.login.backSignIn')}
        </Button>
      </div>
    </div>
  );
}
