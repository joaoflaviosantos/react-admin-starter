import { useScroll } from 'framer-motion';
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';

import { CircleLoading } from '@/components/loading';
import ProgressBar from '@/components/progress-bar';
import PermissionRouteWatcher from '@/router/components/permission-route-watcher';
import { useSettings } from '@/store/settingStore';

import Header from './header';
import Main from './main';
import Nav from './nav';
import NavHorizontal from './nav-horizontal';

import { ThemeLayout } from '#/enum';

function DashboardLayout() {
  const { themeLayout } = useSettings();
  const mainEl = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll({ container: mainEl });
  const [offsetTop, setOffsetTop] = useState(false);

  const onOffSetTop = useCallback(() => {
    scrollY.on('change', (scrollHeight) => {
      setOffsetTop(scrollHeight > 0);
    });
  }, [scrollY]);

  useEffect(() => {
    onOffSetTop();
  }, [onOffSetTop]);

  const navVertical = (
    <div className="z-50 hidden h-full flex-shrink-0 shadow-lg md:block">
      <Nav />
    </div>
  );

  const isHorizontal = themeLayout === ThemeLayout.Horizontal;

  return (
    <div className="dashboard-scroll text-foreground">
      <ProgressBar />
      <PermissionRouteWatcher />
      <div
        className={`flex h-screen overflow-hidden bg-layout transition-colors duration-200 ${
          isHorizontal ? 'flex-col' : ''
        }`}
      >
        <Suspense fallback={<CircleLoading />}>
          {isHorizontal ? (
            <>
              <Header />
              <NavHorizontal />
              <Main ref={mainEl} />
            </>
          ) : (
            <>
              {navVertical}
              <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                <Header offsetTop={offsetTop} />
                <Main ref={mainEl} offsetTop={offsetTop} />
              </div>
            </>
          )}
        </Suspense>
      </div>
    </div>
  );
}

export default DashboardLayout;
