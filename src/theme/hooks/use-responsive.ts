import { useEffect, useState } from 'react';

const BREAKPOINTS = {
  xs: 480,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1600,
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

export type ScreenMap = Record<Breakpoint, boolean>;

function getScreenMap(): ScreenMap {
  if (typeof window === 'undefined') {
    return { xs: false, sm: false, md: false, lg: false, xl: false, xxl: false };
  }
  const width = window.innerWidth;
  return {
    xs: width >= BREAKPOINTS.xs,
    sm: width >= BREAKPOINTS.sm,
    md: width >= BREAKPOINTS.md,
    lg: width >= BREAKPOINTS.lg,
    xl: width >= BREAKPOINTS.xl,
    xxl: width >= BREAKPOINTS.xxl,
  };
}

export function useResponsive() {
  const [screenMap, setScreenMap] = useState<ScreenMap>(getScreenMap);

  useEffect(() => {
    const handleResize = () => setScreenMap(getScreenMap());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const screenArray: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'];
  const currentScreen = [...screenArray].reverse().find((item) => screenMap[item]);

  return {
    screenEnum: BREAKPOINTS,
    screenMap,
    currentScreen,
  };
}
