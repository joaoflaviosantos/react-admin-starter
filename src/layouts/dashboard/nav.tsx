import { Menu, MenuProps } from 'antd';
import Color from 'color';
import { CSSProperties, useEffect, useState } from 'react';
import { useLocation, useMatches, useNavigate } from 'react-router-dom';

import { Iconify } from '@/components/icon';
import Logo from '@/components/logo';
import Scrollbar from '@/components/scrollbar';
import { useFlattenedRoutes, usePermissionRoutes, useRouteToMenuFn } from '@/router/hooks';
import { menuFilter } from '@/router/utils';
import { useSettingActions, useSettings } from '@/store/settingStore';
import { useThemeToken } from '@/theme/hooks';

import { NAV_COLLAPSED_WIDTH, NAV_WIDTH } from './config';

import { ThemeLayout, ThemeMode } from '#/enum';

type Props = {
  closeSideBarDrawer?: () => void;
};

export default function Nav(props: Props) {
  const navigate = useNavigate();
  const matches = useMatches();
  const { pathname } = useLocation();
  const { colorTextBase, colorBorder, colorBgElevated, colorPrimary } = useThemeToken();
  const settings = useSettings();
  const { themeLayout, themeMode } = settings;
  const { setSettings } = useSettingActions();

  const menuStyle: CSSProperties = {
    background: colorBgElevated,
    fontSize: '0.85rem',
  };

  const routeToMenuFn = useRouteToMenuFn();
  const menuRoutes = usePermissionRoutes();
  const menuList = routeToMenuFn(menuFilter(menuRoutes));
  const flattenedRoutes = useFlattenedRoutes();

  const [collapsed, setCollapsed] = useState(themeLayout === ThemeLayout.Mini);
  const [openKeys, setOpenKeys] = useState<string[]>([]);
  const [menuMode, setMenuMode] = useState<MenuProps['mode']>('inline');

  useEffect(() => {
    if (themeLayout === ThemeLayout.Vertical) {
      setOpenKeys(matches.filter((match) => match.pathname !== '/').map((match) => match.pathname));
    }
  }, [matches, themeLayout]);

  useEffect(() => {
    if (themeLayout === ThemeLayout.Vertical) {
      setCollapsed(false);
      setMenuMode('inline');
    }
    if (themeLayout === ThemeLayout.Mini) {
      setCollapsed(true);
      setMenuMode('inline');
    }
  }, [themeLayout]);

  const onOpenChange: MenuProps['onOpenChange'] = (keys) => setOpenKeys(keys);

  const onClick: MenuProps['onClick'] = ({ key }) => {
    const nextLink = flattenedRoutes.find((el) => el.key === key);
    if (nextLink?.is_tab_hide && nextLink?.frame_src) {
      window.open(nextLink.frame_src, '_blank');
      return;
    }
    navigate(key);
    props.closeSideBarDrawer?.();
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
      className="flex h-full flex-col"
      style={{
        width: collapsed ? NAV_COLLAPSED_WIDTH : NAV_WIDTH,
        borderRight: `1.6px solid ${Color(colorBorder).alpha(0.9).toString()}`,
        background: colorBgElevated,
      }}
    >
      <div className="relative flex h-20 items-center justify-center py-4">
        <div className={`relative ${themeLayout === ThemeLayout.Mini ? 'px-6' : 'h-20 w-80 px-4'}`}>
          <Logo
            iconOnly={themeLayout === ThemeLayout.Mini}
            darkMode={themeMode === ThemeMode.Dark}
          />
        </div>
        <button
          type="button"
          onClick={toggleCollapsed}
          className="absolute right-0 top-2 z-50 hidden h-6 w-6 translate-x-1/2 cursor-pointer select-none rounded-full text-center !text-gray md:block"
          style={{ color: colorTextBase, borderColor: colorTextBase, fontSize: 21 }}
        >
          {collapsed ? (
            <Iconify
              icon="icon-park-solid:right-c"
              color={colorPrimary}
              size={18}
              style={{ marginTop: -7 }}
            />
          ) : (
            <Iconify icon="icon-park-solid:left-c" color={colorPrimary} size={22} />
          )}
        </button>
      </div>

      <Scrollbar style={{ height: 'calc(100vh - 125px)' }}>
        <Menu
          mode={menuMode}
          items={menuList}
          className="h-full !border-none"
          selectedKeys={[pathname]}
          openKeys={openKeys}
          onOpenChange={onOpenChange}
          onClick={onClick}
          style={menuStyle}
          inlineCollapsed={collapsed}
          inlineIndent={17}
        />
      </Scrollbar>
    </div>
  );
}
