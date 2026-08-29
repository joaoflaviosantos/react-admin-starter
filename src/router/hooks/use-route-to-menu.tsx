import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { Iconify, SvgIcon } from '@/components/icon';
import { useSettings } from '@/store/settingStore';

import type { AdminMenuItem } from '@/components/admin/sidebar-nav';
import { ThemeLayout } from '#/enum';
import { AppRouteObject } from '#/router';

export function useRouteToMenuFn() {
  const { t } = useTranslation();
  const { themeLayout } = useSettings();

  const routeToMenuFn = useCallback(
    (items: AppRouteObject[]): AdminMenuItem[] => {
      return items
        .filter((item) => !item.meta?.is_hide)
        .map((item) => {
          const menuItem: AdminMenuItem = { key: '', label: null };
          const { meta, children } = item;
          if (meta) {
            const { key, label, alternative_label, icon, disabled, suffix } = meta;
            menuItem.key = key ?? '';
            menuItem.disabled = disabled;
            menuItem.label = (
              <div
                className={`inline-flex items-center ${
                  themeLayout === ThemeLayout.Horizontal
                    ? 'justify-start'
                    : 'w-full justify-between'
                }`}
              >
                <div>
                  {t(
                    alternative_label !== undefined && alternative_label
                      ? alternative_label
                      : label,
                  )}
                </div>
                {suffix}
              </div>
            );
            if (icon) {
              if (typeof icon === 'string') {
                if (icon.startsWith('ic')) {
                  menuItem.icon = <SvgIcon icon={icon} size={24} style={{ marginLeft: -4 }} />;
                } else {
                  menuItem.icon = <Iconify icon={icon} size={24} style={{ marginLeft: -4 }} />;
                }
              } else {
                menuItem.icon = icon;
              }
            }
          }
          if (children) {
            menuItem.children = routeToMenuFn(children);
          }
          return menuItem;
        });
    },
    [t, themeLayout],
  );

  return routeToMenuFn;
}

export type { AdminMenuItem };
