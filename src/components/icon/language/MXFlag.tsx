import type { HTMLAttributes } from 'react';

export function MXFlag({
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
      <path fill="#006847" d="M0 0h213.3v480H0z" />
      <path fill="#fff" d="M213.3 0h213.4v480H213.3z" />
      <path fill="#ce1126" d="M426.7 0H640v480H426.7z" />
      <circle cx="320" cy="240" r="36" fill="#8b4513" opacity="0.85" />
      <circle cx="320" cy="240" r="22" fill="#006847" />
    </svg>`,
      }}
      {...rest}
    />
  );
}
