import type { HTMLAttributes } from 'react';

export function GBFlag({
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
        __html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30" >
      <clipPath id="gb-a">
        <path d="M0 0v30h60V0z" />
      </clipPath>
      <clipPath id="gb-b">
        <path d="M30 15h30v15zv15H0zH0V0zV0h30z" />
      </clipPath>
      <g clip-path="url(#gb-a)">
        <path d="M0 0v30h60V0z" fill="#012169" />
        <path d="m0 0 60 30m0-30L0 30" stroke="#fff" stroke-width="6" />
        <path d="m0 0 60 30m0-30L0 30" clip-path="url(#gb-b)" stroke="#C8102E" stroke-width="4" />
        <path d="M30 0v30M0 15h60" stroke="#fff" stroke-width="10" />
        <path d="M30 0v30M0 15h60" stroke="#C8102E" stroke-width="6" />
      </g>
    </svg>`,
      }}
      {...rest}
    />
  );
}
