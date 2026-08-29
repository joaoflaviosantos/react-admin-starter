import { renderHook } from '@testing-library/react';
import { describe, expect, it, beforeEach } from 'vitest';

import { useSettingStore } from '@/store/settingStore';
import { useTheme } from './use-theme';

import { ThemeColorPresets, ThemeLayout, ThemeMode } from '#/enum';

describe('useTheme', () => {
  beforeEach(() => {
    useSettingStore.setState({
      settings: {
        themeColorPresets: ThemeColorPresets.Sky,
        themeCustomColor: '#0068a8',
        themeMode: ThemeMode.Light,
        themeLayout: ThemeLayout.Vertical,
        themeStretch: true,
        breadCrumb: true,
        multiTab: true,
      },
    });
  });

  it('returns primary color for sky preset', () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current.colorPrimary).toBe('#0068a8');
  });

  it('returns primary color for green preset', () => {
    useSettingStore.setState((state) => ({
      settings: { ...state.settings, themeColorPresets: ThemeColorPresets.Green },
    }));
    const { result } = renderHook(() => useTheme());
    expect(result.current.colorPrimary).toBe('#008035');
  });
});
