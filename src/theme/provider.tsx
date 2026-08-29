import { useEffect, type ReactNode } from 'react';

import { useSettings } from '@/store/settingStore';
import { resolveThemePrimaryColor } from '@/theme/color-presets';
import { hexToHslCss } from '@/theme/color-utils';

import { ThemeColorPresets, ThemeMode } from '#/enum';

type ThemeProviderProps = {
  children: ReactNode;
};

export default function ThemeProvider({ children }: ThemeProviderProps) {
  const { themeMode, themeColorPresets, themeCustomColor } = useSettings();

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', themeMode === ThemeMode.Dark);
    root.setAttribute('data-theme-preset', themeColorPresets);

    if (themeColorPresets === ThemeColorPresets.Custom) {
      const primaryColor = resolveThemePrimaryColor(themeColorPresets, themeCustomColor);
      const hsl = hexToHslCss(primaryColor);
      root.style.setProperty('--primary', hsl);
      root.style.setProperty('--ring', hsl);
      return;
    }

    root.style.removeProperty('--primary');
    root.style.removeProperty('--ring');
  }, [themeMode, themeColorPresets, themeCustomColor]);

  return children;
}
