import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';

import companyIconDark from '@/assets/branding/company_icon_dark.svg';
import companyIconLight from '@/assets/branding/company_icon_light.svg';
import companyLogoDark from '@/assets/branding/company_logo_dark.svg';
import companyLogoLight from '@/assets/branding/company_logo_light.svg';
import { cn } from '@/lib/utils';
import { useTheme } from '@/theme/hooks';

export interface LogoProps {
  withLink?: boolean;
  iconOnly?: boolean;
  darkMode?: boolean;
  className?: string;
}

export default function Logo({ withLink = true, iconOnly, darkMode, className }: LogoProps) {
  const { colorPrimary } = useTheme();
  const [svgContent, setSvgContent] = useState<string>('');

  const src = iconOnly
    ? darkMode
      ? companyIconDark
      : companyIconLight
    : darkMode
      ? companyLogoDark
      : companyLogoLight;

  useEffect(() => {
    fetch(src)
      .then((res) => res.text())
      .then((text) => {
        // Replace the hardcoded SVG colors with the current primary color
        // and force the SVG to scale to 100% of its container
        const coloredSvg = text
          .replace(/fill="#0068a8"/g, `fill="${colorPrimary}"`)
          .replace(/fill:#0068a8/g, `fill:${colorPrimary}`)
          .replace(/width="[^"]+"/, 'width="100%"')
          .replace(/height="[^"]+"/, 'height="100%"');
        setSvgContent(coloredSvg);
      });
  }, [src, colorPrimary]);

  const content = (
    <div
      className={cn('flex h-full w-full items-center justify-center', className)}
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );

  const HOMEPAGE = import.meta.env.VITE_APP_HOMEPAGE ?? '/workbench/overview';

  return withLink ? (
    <NavLink to={HOMEPAGE} className="inline-flex h-full w-full items-center justify-center">
      {content}
    </NavLink>
  ) : (
    content
  );
}
