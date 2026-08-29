import type { CSSProperties } from 'react';

import { useResponsive } from '@/theme/hooks';

import type { DescriptionsLayout } from './index';

export const descriptionsScheFlowLabelStyle: CSSProperties = {
  fontSize: '0.725rem',
  fontWeight: 700,
  width: '10rem',
  paddingTop: '0.35rem',
  paddingBottom: '0.35rem',
  textAlign: 'center',
};

export const descriptionsScheFlowContentStyle: CSSProperties = {
  fontSize: '0.725rem',
  paddingTop: '0.35rem',
  paddingBottom: '0.35rem',
  textAlign: 'start',
};

export const descriptionsScheFlowBadgeContentStyle: CSSProperties = {
  ...descriptionsScheFlowContentStyle,
  paddingTop: '0.10rem',
  paddingBottom: '0.10rem',
};

export function useDescriptionsScheFlowLayout(): DescriptionsLayout {
  const { screenMap } = useResponsive();
  return screenMap.md ? 'horizontal' : 'vertical';
}
