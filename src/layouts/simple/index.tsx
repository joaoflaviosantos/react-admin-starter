import { ReactNode } from 'react';

import HeaderSimple from '../_common/header-simple';

type Props = {
  children: ReactNode;
};

export default function SimpleLayout({ children }: Props) {
  return (
    <div className="flex h-screen w-full flex-col bg-layout text-foreground">
      <HeaderSimple />
      {children}
    </div>
  );
}
