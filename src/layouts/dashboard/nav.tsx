import { useEffect, useState } from 'react';
import { useLocation, useMatches, useNavigate } from 'react-router-dom';

import { AdminNavMenu } from '@/components/admin/sidebar-nav';
import { Iconify } from '@/components/icon';
import Logo from '@/components/logo';
import Scrollbar from '@/components/scrollbar';
import { useFlattenedRoutes, usePermissionRoutes, useRouteToMenuFn } from '@/router/hooks';
import { menuFilter } from '@/router/utils';
import { useSettingActions, useSettings } from '@/store/settingStore';
import { useTheme } from '@/theme/hooks';

import { chromeSurfaceClass } from '@/lib/overlay-surface';

import { HEADER_HEIGHT, NAV_COLLAPSED_WIDTH, NAV_WIDTH } from './config';

import { ThemeLayout, ThemeMode } from '#/enum';

type Props = {
  closeSideBarDrawer?: () => void;
};

export default function Nav({ closeSideBarDrawer }: Props) {
  const navigate = useNavigate();
  const matches = useMatches();
  const { pathname } = useLocation();
  const { colorPrimary } = useTheme();
  const settings = useSettings();
  const { themeLayout, themeMode } = settings;
  const { setSettings } = useSettingActions();

  const isMobileDrawer = Boolean(closeSideBarDrawer);

  const routeToMenuFn = useRouteToMenuFn();
  const menuRoutes = usePermissionRoutes();
  const menuList = routeToMenuFn(menuFilter(menuRoutes));
  const flattenedRoutes = useFlattenedRoutes();

  const [collapsed, setCollapsed] = useState(themeLayout === ThemeLayout.Mini);
  const [openKeys, setOpenKeys] = useState<string[]>([]);
  const isCollapsed = isMobileDrawer ? false : collapsed;

  useEffect(() => {
    if (themeLayout === ThemeLayout.Vertical || isMobileDrawer) {
      setOpenKeys(matches.filter((match) => match.pathname !== '/').map((match) => match.pathname));
    }
  }, [isMobileDrawer, matches, themeLayout]);

  useEffect(() => {
    if (themeLayout === ThemeLayout.Vertical) {
      setCollapsed(false);
    }
    if (themeLayout === ThemeLayout.Mini) {
      setCollapsed(true);
    }
  }, [themeLayout]);

  const onSelect = (key: string) => {
    const nextLink = flattenedRoutes.find((el) => el.key === key);
    if (nextLink?.is_tab_hide && nextLink?.frame_src) {
      window.open(nextLink.frame_src, '_blank');
      return;
    }
    navigate(key);
    closeSideBarDrawer?.();
  };

  const setThemeLayout = (layout: ThemeLayout) => {
    setSettings({ ...settings, themeLayout: layout });
  };

  const toggleCollapsed = () => {
    if (!collapsed) {
      setThemeLayout(ThemeLayout.Mini);
    } else {
      setThemeLayout(ThemeLayout.Vertical);
    }
    setCollapsed(!collapsed);
  };

  return (
    <div
      className={`flex h-full flex-col border-r border-border ${chromeSurfaceClass}`}
      style={{ width: isCollapsed ? NAV_COLLAPSED_WIDTH : NAV_WIDTH }}
    >
      <div
        className="relative flex shrink-0 items-center justify-center border-b border-border px-3"
        style={{ height: HEADER_HEIGHT }}
      >
        <Logo
          iconOnly={!isMobileDrawer && themeLayout === ThemeLayout.Mini}
          darkMode={themeMode === ThemeMode.Dark}
          className="truncate"
        />
        <button
          type="button"
          onClick={toggleCollapsed}
          className="absolute right-0 top-1/2 z-50 hidden h-6 w-6 -translate-y-1/2 translate-x-1/2 cursor-pointer select-none rounded-full text-center text-muted-foreground md:block"
        >
          {isCollapsed ? (
            <Iconify icon="icon-park-solid:right-c" color={colorPrimary} size={18} />
          ) : (
            <Iconify icon="icon-park-solid:left-c" color={colorPrimary} size={22} />
          )}
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        <Scrollbar style={{ height: '100%' }}>
          <AdminNavMenu
            items={menuList}
            selectedKey={pathname}
            openKeys={openKeys}
            onOpenChange={setOpenKeys}
            onSelect={onSelect}
            collapsed={isCollapsed}
          />
        </Scrollbar>
      </div>
    </div>
  );
}
