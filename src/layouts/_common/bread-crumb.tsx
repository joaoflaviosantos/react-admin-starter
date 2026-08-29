import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useMatches } from 'react-router-dom';

import { Iconify } from '@/components/icon';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useFlattenedRoutes, usePermissionRoutes } from '@/router/hooks';
import { menuFilter } from '@/router/utils';
import { useTheme } from '@/theme/hooks';

import { AppRouteObject } from '#/router';

type CrumbItem = {
  key: string;
  title: string;
  siblings?: { key: string; label: string }[];
};

export default function BreadCrumb() {
  const { t } = useTranslation();
  const matches = useMatches();
  const [breadCrumbs, setBreadCrumbs] = useState<CrumbItem[]>([]);
  const { colorPrimary } = useTheme();
  const flattenedRoutes = useFlattenedRoutes();
  const menuRoutes = usePermissionRoutes();

  useEffect(() => {
    const filteredRoutes = menuFilter(menuRoutes);
    const paths = matches.filter((item) => item.pathname !== '/').map((item) => item.pathname);
    const pathRouteMetas = flattenedRoutes.filter((item) => paths.includes(item.key));

    let items: AppRouteObject[] | undefined = [...filteredRoutes];
    const crumbs = pathRouteMetas.map((routeMeta) => {
      const { key, label, alternative_label } = routeMeta;
      items = items!
        .find((item) => item.meta?.key === key)
        ?.children?.filter((item) => !item.meta?.is_hide);
      const result: CrumbItem = {
        key,
        title: t(alternative_label || label),
      };
      if (items?.length) {
        result.siblings = items.map((item) => ({
          key: item.meta!.key!,
          label: t(item.meta!.label),
        }));
      }
      return result;
    });
    setBreadCrumbs(crumbs);
  }, [matches, flattenedRoutes, menuRoutes, t]);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadCrumbs.map((crumb, index) => (
          <BreadcrumbItem key={crumb.key}>
            {index > 0 ? (
              <BreadcrumbSeparator>
                <Iconify
                  icon="ci:arrow-right-md"
                  color={colorPrimary}
                  className="mx-[0.09rem]"
                  size={16}
                />
              </BreadcrumbSeparator>
            ) : null}
            {crumb.siblings?.length ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="text-sm hover:text-primary">
                  {crumb.title}
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {crumb.siblings.map((sibling) => (
                    <DropdownMenuItem key={sibling.key} asChild>
                      <Link to={sibling.key}>{sibling.label}</Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : index === breadCrumbs.length - 1 ? (
              <BreadcrumbPage className="text-sm">{crumb.title}</BreadcrumbPage>
            ) : (
              <BreadcrumbLink asChild className="text-sm">
                <Link to={crumb.key}>{crumb.title}</Link>
              </BreadcrumbLink>
            )}
          </BreadcrumbItem>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
