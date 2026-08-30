import type { HTMLAttributes } from 'react';

export function CAFlag({
  width = 20,
  height = 15,
  className,
  ...rest
}: HTMLAttributes<HTMLSpanElement> & { width?: number; height?: number }) {
  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        width,
        height,
        overflow: 'hidden',
        borderRadius: 2,
        flexShrink: 0,
        alignItems: 'center',
        justifyContent: 'center',
      }}
      dangerouslySetInnerHTML={{
        __html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" >
      <path fill="#f00" d="M0 0h160v480H0zm480 0h160v480H480z" />
      <path fill="#fff" d="M160 0h320v480H160z" />
      <path
        fill="#f00"
        d="m320 96 14 96 28-12-8 28 40-8-20 24 48 4-48 20 20 28-44-16 4 40-28-24-12 36-16-36-28 24 4-40-44 16 20-28-48-20 48-4-20-24 40 8-8-28 28 12z"
      />
    </svg>`,
      }}
      {...rest}
    />
  );
}
