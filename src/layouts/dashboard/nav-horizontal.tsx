import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { AdminNavMenu } from '@/components/admin/sidebar-nav';
import { useFlattenedRoutes, usePermissionRoutes, useRouteToMenuFn } from '@/router/hooks';
import { menuFilter } from '@/router/utils';

import { elevatedSurfaceClass } from '@/lib/overlay-surface';

import { NAV_HORIZONTAL_HEIGHT } from './config';

export default function NavHorizontal() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const routeToMenuFn = useRouteToMenuFn();
  const menuRoutes = usePermissionRoutes();
  const menuList = routeToMenuFn(menuFilter(menuRoutes));
  const flattenedRoutes = useFlattenedRoutes();

  const [openKeys, setOpenKeys] = useState<string[]>([]);
  const [selectedKey, setSelectedKey] = useState(pathname);

  useEffect(() => {
    setSelectedKey(pathname);
  }, [pathname]);

  const onSelect = (key: string) => {
    const nextLink = flattenedRoutes.find((el) => el.key === key);
    if (nextLink?.is_tab_hide && nextLink?.frame_src) {
      window.open(nextLink.frame_src, '_blank');
      return;
    }
    navigate(key);
  };

  return (
    <div className={`w-screen ${elevatedSurfaceClass}`} style={{ height: NAV_HORIZONTAL_HEIGHT }}>
      <AdminNavMenu
        items={menuList}
        selectedKey={selectedKey}
        openKeys={openKeys}
        onOpenChange={setOpenKeys}
        onSelect={onSelect}
        mode="horizontal"
        className="h-full px-2"
      />
    </div>
  );
}
