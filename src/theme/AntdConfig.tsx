import { StyleProvider } from '@ant-design/cssinjs';
import { ConfigProvider, theme } from 'antd';
import { useEffect, type ReactNode } from 'react';
import 'antd/dist/reset.css';

import useLocale from '@/locales/useLocale';
import { useSettings } from '@/store/settingStore';

import {
  colorPrimarys,
  customComponentConfig,
  customThemeTokenConfig,
  themeModeToken,
} from './antd/theme';

import { ThemeMode } from '#/enum';

type AntdConfigProps = {
  children: ReactNode;
};

export default function AntdConfig({ children }: AntdConfigProps) {
  const { themeMode, themeColorPresets } = useSettings();
  const { language } = useLocale();

  const algorithm = themeMode === ThemeMode.Light ? theme.defaultAlgorithm : theme.darkAlgorithm;
  const colorPrimary = colorPrimarys[themeColorPresets];

  useEffect(() => {
    if (themeMode === ThemeMode.Dark) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [themeMode]);

  return (
    <ConfigProvider
      locale={language.antdLocal}
      theme={{
        token: { colorPrimary, ...customThemeTokenConfig, ...themeModeToken[themeMode].token },
        components: { ...customComponentConfig, ...themeModeToken[themeMode].components },
        algorithm,
      }}
    >
      <StyleProvider hashPriority="high">{children}</StyleProvider>
    </ConfigProvider>
  );
}
