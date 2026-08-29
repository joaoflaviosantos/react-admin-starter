import { NavLink } from 'react-router-dom';

import { cn } from '@/lib/utils';

export interface LogoProps {
  withLink?: boolean;
  iconOnly?: boolean;
  darkMode?: boolean;
  className?: string;
}

export default function Logo({ withLink = true, iconOnly, darkMode, className }: LogoProps) {
  const label = iconOnly ? 'A' : 'Admin';
  const content = (
    <span
      className={cn(
        'font-bold',
        darkMode ? 'text-white' : 'text-[#161616]',
        iconOnly ? 'text-lg' : 'text-xl',
        className,
      )}
    >
      {label}
    </span>
  );

  return withLink ? (
    <NavLink to="/" className="inline-flex items-center justify-center">
      {content}
    </NavLink>
  ) : (
    content
  );
}
