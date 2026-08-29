import { ComponentProps, CSSProperties, ReactNode } from 'react';

type Props = {
  title?: string;
  disabled?: boolean;
  invisible?: boolean;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
} & ComponentProps<'button'>;

export default function IconButton({
  title,
  disabled = false,
  invisible = false,
  children,
  className,
  style,
  onClick,
  ...props
}: Props) {
  let buttonClassName = 'flex items-center justify-center rounded-full p-2 hover:bg-hover';
  if (disabled && !invisible) {
    buttonClassName += ' cursor-not-allowed opacity-50';
  } else if (!invisible) {
    buttonClassName += ' cursor-pointer';
  }
  if (invisible) {
    buttonClassName += ' opacity-0';
  }
  return (
    <button
      disabled={disabled || invisible}
      title={title}
      style={style}
      className={`${buttonClassName} ${className ?? ''}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}
