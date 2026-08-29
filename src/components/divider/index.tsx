import * as React from 'react';

import { cn } from '@/lib/utils';
import { useSettings } from '@/store/settingStore';

import { ThemeMode } from '#/enum';

export interface DividerScheFlowProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export function DividerScheFlow({ children, className, style, ...props }: DividerScheFlowProps) {
  const { themeMode } = useSettings();
  const isDark = themeMode === ThemeMode.Dark;
  const lineClassName = 'border-foreground/45';

  if (!children) {
    return (
      <div role="separator" className={cn('py-1 opacity-90', className)} style={style} {...props}>
        <div className={cn('w-full border-t', lineClassName)} />
      </div>
    );
  }

  return (
    <div
      role="separator"
      className={cn('flex items-center py-1 opacity-90', className)}
      style={style}
      {...props}
    >
      <div className={cn('flex-1 border-t', lineClassName)} />
      <span
        className="shrink-0 px-3 text-[0.85rem] font-semibold uppercase tracking-[0.05em] text-foreground"
        style={{
          textShadow: isDark
            ? '0 1px 2px rgba(255, 255, 255, 0.25)'
            : '0 1px 1px rgba(0, 0, 0, 0.15)',
        }}
      >
        {children}
      </span>
      <div className={cn('flex-1 border-t', lineClassName)} />
    </div>
  );
}

DividerScheFlow.displayName = 'DividerScheFlow';
