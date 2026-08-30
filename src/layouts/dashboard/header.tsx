import { useState } from 'react';
import { flushSync } from 'react-dom';
import { useTranslation } from 'react-i18next';

import { IconButton, SvgIcon } from '@/components/icon';
import LocalePicker from '@/components/locale-picker';
import Logo from '@/components/logo';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useSettingActions, useSettings } from '@/store/settingStore';

import { chromeSurfaceClass } from '@/lib/overlay-surface';

import AccountDropdown from '../_common/account-dropdown';
import BreadCrumb from '../_common/bread-crumb';
import SettingButton from '../_common/setting-button';

import { HEADER_HEIGHT, OFFSET_HEADER_HEIGHT } from './config';
import Nav from './nav';

import { ThemeLayout, ThemeMode } from '#/enum';

type Props = {
  className?: string;
  offsetTop?: boolean;
};

export default function Header({ className = '', offsetTop = false }: Props) {
  const { t } = useTranslation();
  const [sheetOpen, setSheetOpen] = useState(false);
  const settings = useSettings();
  const { themeLayout, breadCrumb, themeMode } = settings;
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

  const isHorizontal = themeLayout === ThemeLayout.Horizontal;

  return (
    <>
      <header
        className={`${chromeSurfaceClass} z-20 shrink-0 border-b border-border ${
          isHorizontal ? 'relative w-full' : 'sticky top-0 w-full'
        } ${className}`}
      >
        <div
          className="flex flex-grow items-center justify-between px-4 text-muted-foreground xl:px-6 2xl:px-7"
          style={{
            height: offsetTop ? OFFSET_HEADER_HEIGHT : HEADER_HEIGHT,
            transition: 'height 200ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
          }}
        >
          <div className="flex h-full min-w-0 items-center">
            {isHorizontal ? (
              <div className="mr-2 flex h-full w-40 items-center">
                <Logo iconOnly={false} darkMode={themeMode === ThemeMode.Dark} />
              </div>
            ) : (
              <IconButton onClick={() => setSheetOpen(true)} className="h-10 w-10 md:hidden">
                <SvgIcon icon="ic-menu" size="24" />
              </IconButton>
            )}
            <div className={`hidden min-w-0 md:block ${isHorizontal ? 'ml-4' : 'ml-1'}`}>
              {breadCrumb ? <BreadCrumb /> : null}
            </div>
          </div>

          <div className="flex shrink-0 items-center">
            <LocalePicker />
            <IconButton
              title={t('common.swichTheme')}
              onClick={() =>
                setThemeMode(themeMode === ThemeMode.Dark ? ThemeMode.Light : ThemeMode.Dark)
              }
            >
              <SvgIcon
                icon={
                  themeMode === ThemeMode.Dark ? 'ic-settings-mode-sun' : 'ic-settings-mode-moon'
                }
                size="20"
              />
            </IconButton>
            <SettingButton />
            <AccountDropdown />
          </div>
        </div>
      </header>
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="left" className="w-auto p-0">
          <Nav closeSideBarDrawer={() => setSheetOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  );
}
