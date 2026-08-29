import { CSSProperties, forwardRef } from 'react';
import { Outlet } from 'react-router-dom';

import { useSettings } from '@/store/settingStore';

import { MULTI_TABS_HEIGHT } from './config';
import MultiTabs from './multi-tabs';

type MainProps = {
  offsetTop?: boolean;
};

const Main = forwardRef<HTMLDivElement, MainProps>(function Main({ offsetTop }, ref) {
  const { themeStretch, multiTab } = useSettings();

  const mainStyle: CSSProperties | undefined = multiTab
    ? {
        paddingTop: MULTI_TABS_HEIGHT,
        transition: 'padding 200ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
      }
    : undefined;

  return (
    <main
      ref={ref}
      style={mainStyle}
      className="flex min-h-0 min-w-0 flex-1 flex-col overflow-auto"
    >
      <div
        className={`w-full flex-1 ${themeStretch ? '' : 'xl:mx-auto xl:max-w-screen-xl'} ${
          multiTab ? '' : 'p-2.5 sm:p-3 md:p-3.5 lg:p-4'
        }`}
      >
        {multiTab ? <MultiTabs offsetTop={offsetTop} /> : <Outlet />}
      </div>
    </main>
  );
});

export default Main;
