import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { LoginStateEnum, useLoginStateContext } from './providers/LoginStateProvider';
import { useSettings } from '@/store/settingStore';
import { ThemeMode } from '@/types/enum';
import LogoDark from '@/assets/branding/company_logo_dark.svg';
import LogoLight from '@/assets/branding/company_logo_light.svg';

export default function MobileForm() {
  const { t } = useTranslation();
  const { loginState, backToLogin } = useLoginStateContext();
  const { themeMode } = useSettings();

  if (loginState !== LoginStateEnum.MOBILE) return null;

  return (
    <div className="w-full">
      <div className="my-20 flex justify-center">
        <img
          src={themeMode === ThemeMode.Dark ? LogoDark : LogoLight}
          alt="Logo"
          className="w-full"
        />
      </div>
      <div className="mb-2 mt-4 text-2xl font-bold xl:text-3xl">
        {t('sys.login.mobileSignInFormTitle')}
      </div>
      <div className="mt-6 space-y-4">
        {/* Mobile form fields would go here */}
        <p className="mb-4 text-sm text-muted-foreground">
          Mobile sign-in functionality is not implemented in this demo.
        </p>
        <Button className="w-full" size="lg" disabled>
          {t('sys.login.loginButton', 'Sign In')}
        </Button>
        <Button variant="outline" className="w-full" size="lg" onClick={backToLogin}>
          {t('sys.login.backSignIn')}
        </Button>
      </div>
    </div>
  );
}
