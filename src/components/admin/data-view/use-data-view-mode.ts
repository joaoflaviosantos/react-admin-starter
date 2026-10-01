import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export type AdminDataViewMode = 'table' | 'grid' | 'list';

const modes: AdminDataViewMode[] = ['table', 'grid', 'list'];
const mobileQuery = '(max-width: 767px)';

function isMode(value: string | null): value is AdminDataViewMode {
  return modes.includes(value as AdminDataViewMode);
}

function useMobileDefault() {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia?.(mobileQuery).matches === true,
  );

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const media = window.matchMedia(mobileQuery);
    const update = () => setIsMobile(media.matches);
    media.addEventListener('change', update);
    update();
    return () => media.removeEventListener('change', update);
  }, []);

  return isMobile ? 'list' : 'table';
}

export function useAdminDataViewMode() {
  const [searchParams, setSearchParams] = useSearchParams();
  const responsiveDefault = useMobileDefault();
  const requested = searchParams.get('view');
  const mode = isMode(requested) ? requested : responsiveDefault;

  const setMode = (nextMode: AdminDataViewMode) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.set('view', nextMode);
      return next;
    });
  };

  return { mode, setMode } as const;
}
