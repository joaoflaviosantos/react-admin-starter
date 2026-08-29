import { ReactNode } from 'react';

import { useThemeToken } from '@/theme/hooks';

import HeaderSimple from '../_common/header-simple';

type Props = {
  children: ReactNode;
};

export default function SimpleLayout({ children }: Props) {
  const { colorBgLayout, colorTextBase } = useThemeToken();

  return (
    <div
      className="flex h-screen w-full flex-col"
      style={{
        color: colorTextBase,
        background: colorBgLayout,
      }}
    >
      <HeaderSimple />
      {children}
    </div>
  );
}
