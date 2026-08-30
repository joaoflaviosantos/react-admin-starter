import type { HTMLAttributes } from 'react';

export function PTFlag({
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
      <path fill="#ff0000" d="M0 0h640v480H0z" />
      <path fill="#006600" d="M0 0h240v480H0z" />
      <circle cx="240" cy="240" r="80" fill="#ff0" stroke="#000" stroke-width="4" />
      <circle cx="240" cy="240" r="52" fill="#ff0000" stroke="#000" stroke-width="3" />
      <path
        fill="#fff"
        stroke="#000"
        stroke-width="2"
        d="M208 208h64v64h-64zm8 8v48h48v-48zm8 8h32v32h-32z"
      />
    </svg>`,
      }}
      {...rest}
    />
  );
}
