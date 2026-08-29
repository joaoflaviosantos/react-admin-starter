import { Typography } from 'antd';
import { NavLink } from 'react-router-dom';

export interface LogoProps {
  withLink?: boolean;
  iconOnly?: boolean;
  darkMode?: boolean;
  className?: string;
}

export default function Logo({ withLink = true, iconOnly, darkMode, className }: LogoProps) {
  const label = iconOnly ? 'A' : 'Admin';
  const content = (
    <Typography.Text
      strong
      className={className}
      style={{ color: darkMode ? '#fff' : '#161616', fontSize: iconOnly ? 18 : 20 }}
    >
      {label}
    </Typography.Text>
  );

  return withLink ? <NavLink to="/">{content}</NavLink> : content;
}
