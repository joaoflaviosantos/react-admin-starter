import type { HTMLAttributes } from 'react';

export function ARFlag({
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
      <path fill="#74acdf" d="M0 0h640v480H0z" />
      <path fill="#fff" d="M0 160h640v160H0z" />
      <circle cx="320" cy="240" r="40" fill="#f6b40e" stroke="#85340a" stroke-width="3" />
      <circle cx="320" cy="240" r="18" fill="#f6b40e" stroke="#85340a" stroke-width="2" />
    </svg>`,
      }}
      {...rest}
    />
  );
}
