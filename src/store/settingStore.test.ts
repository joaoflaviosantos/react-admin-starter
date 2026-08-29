import { beforeEach, describe, expect, it } from 'vitest';

import i18n from '@/locales/i18n';
import { LANGUAGE_MAP } from '@/locales/useLocale';

import { useSettingStore } from './settingStore';

import { LocalEnum, StorageEnum, ThemeMode } from '#/enum';

describe('settingStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useSettingStore.setState({
      settings: {
        themeColorPresets: useSettingStore.getState().settings.themeColorPresets,
        themeMode: ThemeMode.Light,
        themeLayout: useSettingStore.getState().settings.themeLayout,
        themeStretch: true,
        breadCrumb: true,
        multiTab: false,
      },
    });
  });

  it('persists themeMode when setSettings is called', () => {
    const { actions, settings } = useSettingStore.getState();
    actions.setSettings({ ...settings, themeMode: ThemeMode.Dark });

    expect(useSettingStore.getState().settings.themeMode).toBe(ThemeMode.Dark);
    expect(localStorage.getItem(StorageEnum.Settings)).toContain(ThemeMode.Dark);
  });

  it('updates i18n language when locale changes', async () => {
    await i18n.changeLanguage(LocalEnum.en_US);
    expect(i18n.language).toBe(LocalEnum.en_US);

    await i18n.changeLanguage(LocalEnum.pt_BR);
    expect(i18n.language).toBe(LocalEnum.pt_BR);
    expect(LANGUAGE_MAP[LocalEnum.pt_BR].label).toBe('Português');
  });
});
