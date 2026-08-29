import { forwardRef } from 'react';
import { Outlet } from 'react-router-dom';

import { useSettings } from '@/store/settingStore';

type MainProps = {
  offsetTop?: boolean;
};

const Main = forwardRef<HTMLDivElement, MainProps>(function Main(_props, ref) {
  const { themeStretch } = useSettings();

  return (
    <main ref={ref} className="flex min-h-0 min-w-0 flex-1 flex-col overflow-auto">
      <div
        className={`w-full flex-1 p-2.5 sm:p-3 md:p-3.5 lg:p-4 ${
          themeStretch ? '' : 'xl:mx-auto xl:max-w-screen-xl'
        }`}
      >
        <Outlet />
      </div>
    </main>
  );
});

export default Main;
