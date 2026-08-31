import { useEffect, type ReactNode } from 'react';

import { useSettings } from '@/store/settingStore';
import { resolveThemePrimaryColor } from '@/theme/color-presets';
import { hexToHslCss } from '@/theme/color-utils';
import { useDynamicFavicon } from '@/hooks/web/use-dynamic-favicon';

import { ThemeColorPresets, ThemeMode } from '#/enum';

type ThemeProviderProps = {
  children: ReactNode;
};

export default function ThemeProvider({ children }: ThemeProviderProps) {
  const { themeMode, themeColorPresets, themeCustomColor, themeRadius } = useSettings();

  const primaryColor = resolveThemePrimaryColor(themeColorPresets, themeCustomColor);
  useDynamicFavicon(themeMode, primaryColor);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', themeMode === ThemeMode.Dark);
    root.setAttribute('data-theme-preset', themeColorPresets);

    // Apply radius globally
    root.style.setProperty('--radius', `${themeRadius ?? 0.5}rem`);

    if (themeColorPresets === ThemeColorPresets.Custom) {
      const hsl = hexToHslCss(primaryColor);
      root.style.setProperty('--primary', hsl);
      root.style.setProperty('--ring', hsl);
      return;
    }

    root.style.removeProperty('--primary');
    root.style.removeProperty('--ring');
  }, [themeMode, themeColorPresets, primaryColor, themeRadius]);

  return children;
}
