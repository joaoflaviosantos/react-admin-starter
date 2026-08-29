import { useEffect, useState } from 'react';
import { Params, useMatches, useOutlet } from 'react-router-dom';

import { useFlattenedRoutes } from './use-flattened-routes';
import { useRouter } from './use-router';

import type { RouteMeta } from '#/router';

export function useMatchRouteMeta() {
  const [matchRouteMeta, setMatchRouteMeta] = useState<RouteMeta>();
  const children = useOutlet();
  const matches = useMatches();
  const flattenedRoutes = useFlattenedRoutes();
  const { replace } = useRouter();

  useEffect(() => {
    const lastRoute = matches.at(-1);
    if (!lastRoute) return;

    const { pathname, params } = lastRoute;
    const currentRouteMeta = flattenedRoutes.find((item) => {
      const replacedKey = replaceDynamicParams(item.key, params);
      return replacedKey === pathname || `${replacedKey}/` === pathname;
    });

    if (currentRouteMeta) {
      currentRouteMeta.outlet = children;
      if (Object.keys(params).length > 0) {
        currentRouteMeta.params = params;
      }
      setMatchRouteMeta({ ...currentRouteMeta });
    } else if (pathname.startsWith('/management')) {
      replace('/403');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matches]);

  return matchRouteMeta;
}

export const replaceDynamicParams = (menuKey: string, params: Params<string>) => {
  let replacedPathName = menuKey;
  const paramNames = menuKey.match(/:\w+/g);

  if (paramNames) {
    paramNames.forEach((paramName) => {
      const paramKey = paramName.slice(1);
      if (params[paramKey]) {
        replacedPathName = replacedPathName.replace(paramName, params[paramKey]!);
      }
    });
  }

  return replacedPathName;
};
