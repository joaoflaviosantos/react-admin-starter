import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { useMatchRouteMeta, useRouter } from '@/router/hooks';
import { replaceDynamicParams } from '@/router/hooks/use-match-route-meta';

import type { RouteMeta } from '#/router';

const HOMEPAGE = import.meta.env.VITE_APP_HOMEPAGE ?? '/workbench/overview';

export type KeepAliveTab = RouteMeta & {
  children: ReactNode;
};

function getTimeStamp() {
  return new Date().getTime().toString();
}

function matchesPathname(tabKey: string, pathname: string) {
  return tabKey === pathname || `${tabKey}/` === pathname;
}

export default function useKeepAlive() {
  const { push } = useRouter();
  const { pathname } = useLocation();
  const [tabs, setTabs] = useState<KeepAliveTab[]>([]);
  const [activeTabRoutePath, setActiveTabRoutePath] = useState('');
  const currentRouteMeta = useMatchRouteMeta();
  const closedTabKeysRef = useRef(new Set<string>());
  const previousPathnameRef = useRef(pathname);

  const markTabsClosed = useCallback((keys: string[]) => {
    keys.forEach((key) => closedTabKeysRef.current.add(key));
  }, []);

  const closeTab = useCallback(
    (path?: string) => {
      const targetPath = path ?? activeTabRoutePath;

      setTabs((prev) => {
        if (prev.length <= 1) return prev;

        const deleteTabIndex = prev.findIndex((item) => item.key === targetPath);
        if (deleteTabIndex === -1) return prev;

        const isClosingActiveTab = targetPath === activeTabRoutePath;
        const fallbackTab = isClosingActiveTab
          ? deleteTabIndex > 0
            ? prev[deleteTabIndex - 1]
            : prev[deleteTabIndex + 1]
          : null;

        markTabsClosed([targetPath]);

        if (fallbackTab) {
          queueMicrotask(() => push(fallbackTab.key));
        }

        return prev.filter((item) => item.key !== targetPath);
      });
    },
    [activeTabRoutePath, markTabsClosed, push],
  );

  const closeOthersTab = useCallback(
    (path = activeTabRoutePath) => {
      setTabs((prev) => {
        const keysToClose = prev.filter((item) => item.key !== path).map((item) => item.key);
        markTabsClosed(keysToClose);
        return prev.filter((item) => item.key === path);
      });
      if (path !== activeTabRoutePath) {
        push(path);
      }
    },
    [activeTabRoutePath, markTabsClosed, push],
  );

  const closeAll = useCallback(() => {
    setTabs((prev) => {
      const keysToClose = prev
        .filter((item) => !matchesPathname(item.key, HOMEPAGE))
        .map((item) => item.key);
      markTabsClosed(keysToClose);

      for (const closedKey of closedTabKeysRef.current) {
        if (matchesPathname(closedKey, HOMEPAGE)) {
          closedTabKeysRef.current.delete(closedKey);
        }
      }

      const homepageTab = prev.find((item) => matchesPathname(item.key, HOMEPAGE));
      return homepageTab ? [homepageTab] : [];
    });
    push(HOMEPAGE);
  }, [markTabsClosed, push]);

  const closeLeft = useCallback(
    (path: string) => {
      setTabs((prev) => {
        const currentTabIndex = prev.findIndex((item) => item.key === path);
        if (currentTabIndex <= 0) return prev;

        markTabsClosed(prev.slice(0, currentTabIndex).map((item) => item.key));
        return prev.slice(currentTabIndex);
      });
      push(path);
    },
    [markTabsClosed, push],
  );

  const closeRight = useCallback(
    (path: string) => {
      setTabs((prev) => {
        const currentTabIndex = prev.findIndex((item) => item.key === path);
        if (currentTabIndex === -1 || currentTabIndex >= prev.length - 1) return prev;

        markTabsClosed(prev.slice(currentTabIndex + 1).map((item) => item.key));
        return prev.slice(0, currentTabIndex + 1);
      });
      push(path);
    },
    [markTabsClosed, push],
  );

  const refreshTab = useCallback(
    (path = activeTabRoutePath) => {
      setTabs((prev) => {
        const index = prev.findIndex((item) => item.key === path);
        if (index < 0) return prev;

        const next = [...prev];
        next[index] = { ...next[index], timeStamp: getTimeStamp() };
        return next;
      });
    },
    [activeTabRoutePath],
  );

  useEffect(() => {
    setTabs((prev) => prev.filter((item) => !item.is_tab_hide));

    if (!currentRouteMeta) return;

    let { key } = currentRouteMeta;
    const { outlet, params = {} } = currentRouteMeta;
    const children = outlet as ReactNode;

    if (Object.keys(params).length > 0) {
      key = replaceDynamicParams(key, params);
    }

    if (previousPathnameRef.current !== pathname) {
      for (const closedKey of closedTabKeysRef.current) {
        if (matchesPathname(closedKey, pathname)) {
          closedTabKeysRef.current.delete(closedKey);
        }
      }
    }
    previousPathnameRef.current = pathname;

    setTabs((prev) => {
      if (closedTabKeysRef.current.has(key)) return prev;
      if (prev.some((item) => item.key === key)) return prev;

      return [...prev, { ...currentRouteMeta, key, children, timeStamp: getTimeStamp() }];
    });

    setActiveTabRoutePath(key);
  }, [currentRouteMeta, pathname]);

  return {
    tabs,
    activeTabRoutePath,
    setTabs,
    closeTab,
    closeOthersTab,
    refreshTab,
    closeAll,
    closeLeft,
    closeRight,
  };
}
