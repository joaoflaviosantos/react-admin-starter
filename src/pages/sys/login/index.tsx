import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { IconButton, SvgIcon } from '@/components/icon';

import BackgroundImageDark from '@/assets/images/background/login_dark.jpg';
import BackgroundImageLight from '@/assets/images/background/login_light.jpg';
import LocalePicker from '@/components/locale-picker';

import { useSettings, useSettingActions } from '@/store/settingStore';
import { useUserInfo, useUserToken } from '@/store/userStore';
import { isUserWithPermissionsRead } from '@/utils/permission';
import { ThemeMode } from '@/types/enum';

import LoginForm from './LoginForm';
import MobileForm from './MobileForm';
import { LoginStateProvider } from './providers/LoginStateProvider';
import RegisterForm from './RegisterForm';
import ResetForm from './ResetForm';

const HOMEPAGE = import.meta.env.VITE_APP_HOMEPAGE ?? '/workbench/overview';

export default function LoginPage() {
  const { t } = useTranslation();
  const token = useUserToken();
  const userInfo = useUserInfo();
  const settings = useSettings();
  const { themeMode } = settings;
  const { setSettings } = useSettingActions();

  if (token.access_token && isUserWithPermissionsRead(userInfo)) {
    return <Navigate to={HOMEPAGE} replace />;
  }

  const setThemeMode = (mode: ThemeMode) => {
    setSettings({ ...settings, themeMode: mode });
  };

  const bg = `center center / cover no-repeat url(${
    themeMode === ThemeMode.Dark ? BackgroundImageDark : BackgroundImageLight
  })`;

  return (
    <div className="relative flex min-h-screen w-full flex-row justify-center bg-background">
      <div
        className="hidden grow flex-col items-center justify-center gap-4 bg-center bg-no-repeat md:flex"
        style={{ background: bg }}
      />

      <div className="relative flex min-h-screen w-full max-w-[480px] flex-col justify-center border-l border-border bg-background px-6 md:px-10 lg:px-12">
        <div className="mt-[-2rem] md:mt-[-3rem] lg:mt-[-4rem]">
          <LoginStateProvider>
            <LoginForm />
            <MobileForm />
            <RegisterForm />
            <ResetForm />
          </LoginStateProvider>
        </div>

        <div className="absolute right-4 top-4 flex gap-2">
          <LocalePicker />
          <IconButton
            title={t('common.swichTheme')}
            onClick={() =>
              setThemeMode(themeMode === ThemeMode.Dark ? ThemeMode.Light : ThemeMode.Dark)
            }
          >
            <SvgIcon
              icon={themeMode === ThemeMode.Dark ? 'ic-settings-mode-sun' : 'ic-settings-mode-moon'}
              size="20"
            />
          </IconButton>
        </div>
      </div>
    </div>
  );
}
