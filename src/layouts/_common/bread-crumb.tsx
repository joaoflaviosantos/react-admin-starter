import { Breadcrumb } from 'antd';
import { ItemType } from 'antd/es/breadcrumb/Breadcrumb';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useMatches } from 'react-router-dom';

import { Iconify } from '@/components/icon';
import { useFlattenedRoutes, useMenuRoutes } from '@/router/hooks';
import { menuFilter } from '@/router/utils';
import { useThemeToken } from '@/theme/hooks';

import { AppRouteObject } from '#/router';

export default function BreadCrumb() {
  const { t } = useTranslation();
  const matches = useMatches();
  const [breadCrumbs, setBreadCrumbs] = useState<ItemType[]>([]);
  const { colorPrimary } = useThemeToken();
  const flattenedRoutes = useFlattenedRoutes();
  const menuRoutes = useMenuRoutes();

  useEffect(() => {
    const filteredRoutes = menuFilter([...menuRoutes]);
    const paths = matches.filter((item) => item.pathname !== '/').map((item) => item.pathname);
    const pathRouteMetas = flattenedRoutes.filter((item) => paths.includes(item.key));

    let items: AppRouteObject[] | undefined = [...filteredRoutes];
    const crumbs = pathRouteMetas.map((routeMeta) => {
      const { key, label, alternative_label } = routeMeta;
      items = items!.find((item) => item.meta?.key === key)?.children?.filter((item) => !item.meta?.is_hide);
      const result: ItemType = {
        key,
        title: t(alternative_label || label),
      };
      if (items?.length) {
        result.menu = {
          items: items.map((item) => ({
            key: item.meta?.key,
            label: <Link to={item.meta!.key!}>{t(item.meta!.label)}</Link>,
          })),
        };
      }
      return result;
    });
    setBreadCrumbs(crumbs);
  }, [matches, flattenedRoutes, menuRoutes, t]);

  return (
    <Breadcrumb
      items={breadCrumbs}
      className="!text-sm"
      separator={
        <Iconify icon="ci:arrow-right-md" color={colorPrimary} className="mx-[0.09rem]" size={16} />
      }
    />
  );
}
