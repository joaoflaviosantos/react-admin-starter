import { create } from 'zustand';

import { getItem, removeItem, setItem } from '@/utils/storage';
import { DEFAULT_CUSTOM_THEME_COLOR } from '@/theme/color-presets';
import { normalizeHexColor } from '@/theme/color-utils';

import { StorageEnum, ThemeColorPresets, ThemeLayout, ThemeMode } from '#/enum';

type SettingsType = {
  themeColorPresets: ThemeColorPresets;
  themeCustomColor: string;
  themeMode: ThemeMode;
  themeLayout: ThemeLayout;
  themeStretch: boolean;
  breadCrumb: boolean;
  multiTab: boolean;
};

type SettingStore = {
  settings: SettingsType;
  actions: {
    setSettings: (settings: SettingsType) => void;
    resetSettings: () => void;
    clearSettings: () => void;
  };
};

const legacyThemeColorPresets: Record<string, ThemeColorPresets> = {
  default: ThemeColorPresets.Neutral,
};

const defaultSettings: SettingsType = {
  themeColorPresets: ThemeColorPresets.Sky,
  themeCustomColor: DEFAULT_CUSTOM_THEME_COLOR,
  themeMode: ThemeMode.Light,
  themeLayout: ThemeLayout.Vertical,
  themeStretch: true,
  breadCrumb: true,
  multiTab: true,
};

function normalizeSettings(settings: Partial<SettingsType>): SettingsType {
  const merged = { ...defaultSettings, ...settings };
  const preset = merged.themeColorPresets as string;
  const themeColorPresets =
    legacyThemeColorPresets[preset] ??
    (Object.values(ThemeColorPresets).includes(preset as ThemeColorPresets)
      ? (preset as ThemeColorPresets)
      : ThemeColorPresets.Sky);

  return {
    ...merged,
    themeColorPresets,
    themeCustomColor: normalizeHexColor(merged.themeCustomColor, DEFAULT_CUSTOM_THEME_COLOR),
  };
}

const useSettingStore = create<SettingStore>((set) => ({
  settings: normalizeSettings(getItem<Partial<SettingsType>>(StorageEnum.Settings) ?? {}),
  actions: {
    setSettings: (settings) => {
      const normalized = normalizeSettings(settings);
      set({ settings: normalized });
      setItem(StorageEnum.Settings, normalized);
    },
    resetSettings: () => {
      const normalized = normalizeSettings(defaultSettings);
      set({ settings: normalized });
      setItem(StorageEnum.Settings, normalized);
    },
    clearSettings() {
      removeItem(StorageEnum.Settings);
    },
  },
}));

export const useSettings = () => useSettingStore((state) => state.settings);
export const useSettingActions = () => useSettingStore((state) => state.actions);
export { useSettingStore };
