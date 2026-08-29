import { Drawer } from 'antd';
import Color from 'color';
import { CSSProperties, useState } from 'react';
import { flushSync } from 'react-dom';
import { useTranslation } from 'react-i18next';

import { IconButton, SvgIcon } from '@/components/icon';
import LocalePicker from '@/components/locale-picker';
import Logo from '@/components/logo';
import { useSettingActions, useSettings } from '@/store/settingStore';
import { useResponsive, useThemeToken } from '@/theme/hooks';

import AccountDropdown from '../_common/account-dropdown';
import BreadCrumb from '../_common/bread-crumb';
import SettingButton from '../_common/setting-button';

import { HEADER_HEIGHT, NAV_COLLAPSED_WIDTH, NAV_WIDTH, OFFSET_HEADER_HEIGHT } from './config';
import Nav from './nav';

import { ThemeLayout, ThemeMode } from '#/enum';

type Props = {
  className?: string;
  offsetTop?: boolean;
};

export default function Header({ className = '', offsetTop = false }: Props) {
  const { t } = useTranslation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const settings = useSettings();
  const { themeLayout, breadCrumb, themeMode } = settings;
  const { colorBgElevated, colorBorder } = useThemeToken();
  const { screenMap } = useResponsive();
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

  const headerStyle: CSSProperties = {
    position: themeLayout === ThemeLayout.Horizontal ? 'relative' : 'fixed',
    borderBottom:
      themeLayout === ThemeLayout.Horizontal
        ? `1.85px solid ${Color(colorBorder).alpha(0.9).toString()}`
        : '',
    backgroundColor: Color(colorBgElevated).alpha(1).toString(),
  };

  if (themeLayout === ThemeLayout.Horizontal) {
    headerStyle.width = '100vw';
  } else if (screenMap.md) {
    headerStyle.right = '0px';
    headerStyle.left = 'auto';
    headerStyle.width = `calc(100% - ${
      themeLayout === ThemeLayout.Vertical ? NAV_WIDTH : NAV_COLLAPSED_WIDTH
    }px)`;
  } else {
    headerStyle.width = '100vw';
  }

  return (
    <>
      <header className={`z-20 w-full ${className}`} style={headerStyle}>
        <div
          className="flex flex-grow items-center justify-between px-4 text-gray xl:px-6 2xl:px-7"
          style={{
            height: offsetTop ? OFFSET_HEADER_HEIGHT : HEADER_HEIGHT,
            transition: 'height 200ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
          }}
        >
          <div className="flex items-baseline">
            {themeLayout !== ThemeLayout.Horizontal ? (
              <IconButton onClick={() => setDrawerOpen(true)} className="h-10 w-10 md:hidden">
                <SvgIcon icon="ic-menu" size="24" />
              </IconButton>
            ) : (
              <Logo className="mr-2 text-xl" darkMode={themeMode === ThemeMode.Dark} />
            )}
            <div className={`hidden md:block ${themeLayout === ThemeLayout.Horizontal ? 'ml-4' : ''}`}>
              {breadCrumb ? <BreadCrumb /> : null}
            </div>
          </div>

          <div className="mt-[0.05rem] flex items-center">
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
            <SettingButton />
            <AccountDropdown />
          </div>
        </div>
      </header>
      <Drawer
        placement="left"
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        closeIcon={false}
        width="auto"
        styles={{
          header: { display: 'none' },
          body: { padding: 0, overflow: 'hidden' },
        }}
      >
        <Nav closeSideBarDrawer={() => setDrawerOpen(false)} />
      </Drawer>
    </>
  );
}
