import { ThemeColorPresets } from '#/enum';

import { normalizeHexColor } from './color-utils';

export const DEFAULT_CUSTOM_THEME_COLOR = '#0068a8';

export const themeColorPresetOrder: ThemeColorPresets[] = [
  ThemeColorPresets.Amber,
  ThemeColorPresets.Blue,
  ThemeColorPresets.Cyan,
  ThemeColorPresets.Emerald,
  ThemeColorPresets.Fuchsia,
  ThemeColorPresets.Green,
  ThemeColorPresets.Indigo,
  ThemeColorPresets.Lime,
  ThemeColorPresets.Orange,
  ThemeColorPresets.Pink,
  ThemeColorPresets.Purple,
  ThemeColorPresets.Red,
  ThemeColorPresets.Rose,
  ThemeColorPresets.Sky,
  ThemeColorPresets.Teal,
  ThemeColorPresets.Violet,
  ThemeColorPresets.Yellow,
  ThemeColorPresets.Neutral,
  ThemeColorPresets.Custom,
];

/** Swatch colors derived from shadcn/ui registry theme primary (light mode). */
export const colorPrimarys: Record<ThemeColorPresets, string> = {
  [ThemeColorPresets.Neutral]: '#171717',
  [ThemeColorPresets.Amber]: '#bd4f00',
  [ThemeColorPresets.Blue]: '#1448e6',
  [ThemeColorPresets.Cyan]: '#007494',
  [ThemeColorPresets.Emerald]: '#007a56',
  [ThemeColorPresets.Fuchsia]: '#a800b8',
  [ThemeColorPresets.Green]: '#008035',
  [ThemeColorPresets.Indigo]: '#442dd7',
  [ThemeColorPresets.Lime]: '#99e600',
  [ThemeColorPresets.Orange]: '#cc3600',
  [ThemeColorPresets.Pink]: '#c7005d',
  [ThemeColorPresets.Purple]: '#8400db',
  [ThemeColorPresets.Red]: '#c20006',
  [ThemeColorPresets.Rose]: '#c70035',
  [ThemeColorPresets.Sky]: DEFAULT_CUSTOM_THEME_COLOR,
  [ThemeColorPresets.Teal]: '#00756d',
  [ThemeColorPresets.Violet]: '#7008e7',
  [ThemeColorPresets.Yellow]: '#ffc800',
  [ThemeColorPresets.Custom]: DEFAULT_CUSTOM_THEME_COLOR,
};

export function resolveThemePrimaryColor(preset: ThemeColorPresets, customColor: string): string {
  if (preset === ThemeColorPresets.Custom) {
    return normalizeHexColor(customColor, DEFAULT_CUSTOM_THEME_COLOR);
  }

  return colorPrimarys[preset];
}
