import { useEffect, useState } from 'react';

const DEFAULT_HEIGHT = 420;

export default function useDynamicComponentStringHeight(offset = 280) {
  const [height, setHeight] = useState(DEFAULT_HEIGHT);

  useEffect(() => {
    const updateHeight = () => {
      setHeight(Math.max(240, window.innerHeight - offset));
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, [offset]);

  return height;
}
