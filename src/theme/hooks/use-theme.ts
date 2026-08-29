import { useMemo } from 'react';

import { resolveThemePrimaryColor } from '@/theme/color-presets';
import { useSettings } from '@/store/settingStore';

export function useTheme() {
  const { themeMode, themeColorPresets, themeCustomColor } = useSettings();

  return useMemo(
    () => ({
      themeMode,
      themeColorPresets,
      themeCustomColor,
      colorPrimary: resolveThemePrimaryColor(themeColorPresets, themeCustomColor),
      borderRadius: '0.375rem',
      borderRadiusLG: '0.5rem',
    }),
    [themeMode, themeColorPresets, themeCustomColor],
  );
}
