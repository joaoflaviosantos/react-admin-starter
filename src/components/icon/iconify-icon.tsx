import { Icon } from '@iconify/react';

import { cn } from '@/lib/utils';

import type { IconProps } from '@iconify/react';

interface Props extends IconProps {
  size?: IconProps['width'];
}

export default function Iconify({ icon, size = '1em', className = '', ...other }: Props) {
  return (
    <span className={cn('inline-flex items-center justify-center align-middle', className)}>
      <Icon icon={icon} width={size} height={size} className="m-auto inline-block" {...other} />
    </span>
  );
}
