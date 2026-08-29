import { useScroll } from 'framer-motion';
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

import { CircleLoading } from '@/components/loading';
import ProgressBar from '@/components/progress-bar';
import { useSettings } from '@/store/settingStore';
import { useThemeToken } from '@/theme/hooks';

import Header from './header';
import Main from './main';
import Nav from './nav';
import NavHorizontal from './nav-horizontal';

import { ThemeLayout, ThemeMode } from '#/enum';

function DashboardLayout() {
  const { colorBgLayout, colorTextBase } = useThemeToken();
  const { themeLayout, themeMode } = useSettings();
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

  const nav = themeLayout === ThemeLayout.Horizontal ? <NavHorizontal /> : navVertical;

  return (
    <StyleWrapper $themeMode={themeMode}>
      <ProgressBar />
      <div
        className={`flex h-screen overflow-hidden ${
          themeLayout === ThemeLayout.Horizontal ? 'flex-col' : ''
        }`}
        style={{
          color: colorTextBase,
          background: colorBgLayout,
          transition:
            'color 200ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, background 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
        }}
      >
        <Suspense fallback={<CircleLoading />}>
          <Header offsetTop={themeLayout === ThemeLayout.Vertical ? offsetTop : undefined} />
          {nav}
          <Main ref={mainEl} offsetTop={offsetTop} />
        </Suspense>
      </div>
    </StyleWrapper>
  );
}

export default DashboardLayout;

const StyleWrapper = styled.div<{ $themeMode?: ThemeMode }>`
  ::-webkit-scrollbar {
    width: 0.3rem;
    height: 0.3rem;
  }

  ::-webkit-scrollbar-track {
    border-radius: 8px;
    background: ${(props) => (props.$themeMode === ThemeMode.Dark ? '#2c2c2c' : '#FAFAFA')};
  }

  ::-webkit-scrollbar-thumb {
    border-radius: 8px;
    background: ${(props) => (props.$themeMode === ThemeMode.Dark ? '#6b6b6b' : '#a3a1a1')};
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${(props) => (props.$themeMode === ThemeMode.Dark ? '#5e5d5d' : '#7D7D7D')};
  }
`;
