import { CloseOutlined } from '@ant-design/icons';
import { Card, Drawer, Switch } from 'antd';
import Color from 'color';
import { CSSProperties, useState } from 'react';
import { flushSync } from 'react-dom';
import { useTranslation } from 'react-i18next';

import { IconButton, SvgIcon } from '@/components/icon';
import { useSettingActions, useSettings } from '@/store/settingStore';
import { colorPrimarys } from '@/theme/antd/theme';
import { useThemeToken } from '@/theme/hooks';

import { ThemeColorPresets, ThemeLayout, ThemeMode } from '#/enum';

export default function SettingButton() {
  const { t } = useTranslation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { colorPrimary, colorBgContainer } = useThemeToken();
  const settings = useSettings();
  const { themeMode, themeColorPresets, themeLayout, themeStretch, breadCrumb } = settings;
  const { setSettings } = useSettingActions();

  const setThemeMode = (nextMode: ThemeMode) => {
    const apply = () => setSettings({ ...settings, themeMode: nextMode });
    if (!document.startViewTransition) {
      apply();
    } else {
      document.startViewTransition(() => {
        flushSync(apply);
      });
    }
  };

  const style: CSSProperties = {
    backgroundColor: Color(colorBgContainer).alpha(0.95).toString(),
  };

  const layoutBackground = (layout: ThemeLayout) =>
    themeLayout === layout
      ? `linear-gradient(135deg, ${colorBgContainer} 0%, ${colorPrimary} 100%)`
      : '#919eab';

  return (
    <>
      <IconButton
        title={t('common.uiAdjusts')}
        className="h-10 w-10"
        onClick={() => setDrawerOpen(true)}
      >
        <SvgIcon icon="ic-setting" size="22" />
      </IconButton>
      <Drawer
        placement="right"
        title={t('common.uiAdjusts')}
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        closable={false}
        width={280}
        styles={{ body: { padding: 16 }, mask: { backgroundColor: 'transparent' } }}
        style={style}
        extra={
          <IconButton onClick={() => setDrawerOpen(false)} className="h-9 w-9">
            <CloseOutlined className="text-gray-400" />
          </IconButton>
        }
      >
        <div className="flex flex-col gap-4">
          <Card size="small" title={t('common.darkMode')}>
            <Switch
              checked={themeMode === ThemeMode.Dark}
              onChange={(checked) => setThemeMode(checked ? ThemeMode.Dark : ThemeMode.Light)}
            />
          </Card>

          <Card size="small" title={t('common.color')}>
            <div className="flex flex-wrap gap-2">
              {Object.entries(colorPrimarys).map(([key, value]) => (
                <button
                  key={key}
                  type="button"
                  className="rounded-full p-1"
                  onClick={() =>
                    setSettings({ ...settings, themeColorPresets: key as ThemeColorPresets })
                  }
                >
                  <span
                    className="inline-block h-5 w-5 rounded-full"
                    style={{
                      backgroundColor: value,
                      opacity: themeColorPresets === key ? 1 : 0.45,
                    }}
                  />
                </button>
              ))}
            </div>
          </Card>

          <Card size="small" title={t('common.layout')}>
            <div className="flex gap-2">
              {[ThemeLayout.Vertical, ThemeLayout.Horizontal, ThemeLayout.Mini].map((layout) => (
                <button
                  key={layout}
                  type="button"
                  className="h-10 flex-1 rounded-md text-xs text-white"
                  style={{ background: layoutBackground(layout) }}
                  onClick={() => setSettings({ ...settings, themeLayout: layout })}
                >
                  {t(`common.${layout}`)}
                </button>
              ))}
            </div>
          </Card>

          <Card size="small" title={t('common.stretch')}>
            <Switch
              checked={themeStretch}
              onChange={(checked) => setSettings({ ...settings, themeStretch: checked })}
            />
          </Card>

          <Card size="small" title={t('common.breadcrumb')}>
            <Switch
              checked={breadCrumb}
              onChange={(checked) => setSettings({ ...settings, breadCrumb: checked })}
            />
          </Card>
        </div>
      </Drawer>
    </>
  );
}
