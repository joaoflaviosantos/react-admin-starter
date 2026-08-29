import { Menu, MenuProps } from 'antd';
import { CSSProperties, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useFlattenedRoutes, usePermissionRoutes, useRouteToMenuFn } from '@/router/hooks';
import { menuFilter } from '@/router/utils';
import { useThemeToken } from '@/theme/hooks';

import { NAV_HORIZONTAL_HEIGHT } from './config';

export default function NavHorizontal() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { colorBgElevated } = useThemeToken();
  const routeToMenuFn = useRouteToMenuFn();
  const menuRoutes = usePermissionRoutes();
  const menuList = routeToMenuFn(menuFilter(menuRoutes));
  const flattenedRoutes = useFlattenedRoutes();

  const [openKeys, setOpenKeys] = useState<string[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<string[]>(['']);

  useEffect(() => {
    setSelectedKeys([pathname]);
  }, [pathname]);

  const onOpenChange: MenuProps['onOpenChange'] = (keys) => setOpenKeys(keys);

  const onClick: MenuProps['onClick'] = ({ key }) => {
    const nextLink = flattenedRoutes.find((el) => el.key === key);
    if (nextLink?.is_tab_hide && nextLink?.frame_src) {
      window.open(nextLink.frame_src, '_blank');
      return;
    }
    navigate(key);
  };

  const menuStyle: CSSProperties = {
    background: colorBgElevated,
  };

  return (
    <div className="w-screen" style={{ height: NAV_HORIZONTAL_HEIGHT }}>
      <Menu
        mode="horizontal"
        items={menuList}
        className="!z-10 !border-none"
        selectedKeys={selectedKeys}
        openKeys={openKeys}
        onOpenChange={onOpenChange}
        onClick={onClick}
        style={menuStyle}
      />
    </div>
  );
}
