import { useEffect } from 'react';

import companyIconDark from '@/assets/branding/company_icon_dark.svg';
import companyIconLight from '@/assets/branding/company_icon_light.svg';
import { ThemeMode } from '#/enum';

export function useDynamicFavicon(themeMode: ThemeMode, colorPrimary: string) {
  useEffect(() => {
    const src = themeMode === ThemeMode.Dark ? companyIconDark : companyIconLight;

    fetch(src)
      .then((res) => res.text())
      .then((text) => {
        const coloredSvg = text
          .replace(/fill="#0068a8"/g, `fill="${colorPrimary}"`)
          .replace(/fill:#0068a8/g, `fill:${colorPrimary}`);

        const encodedSvg = encodeURIComponent(coloredSvg);
        const dataUrl = `data:image/svg+xml;utf8,${encodedSvg}`;

        let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
        if (!link) {
          link = document.createElement('link');
          link.rel = 'icon';
          link.type = 'image/svg+xml';
          document.head.appendChild(link);
        }
        link.href = dataUrl;
      })
      .catch((err) => {
        console.error('Failed to update favicon:', err);
      });
  }, [themeMode, colorPrimary]);
}
