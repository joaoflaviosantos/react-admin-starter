import { CSSProperties } from 'react';

import { SettingsModeMoonIcon, SettingsModeSunIcon } from './custom-icons';
import Iconify from './iconify-icon';

const ICON_MAP: Record<string, string> = {
  'ic-menu': 'mdi:menu',
  'ic-setting': 'mdi:cog-outline',
  'ic-locale_pt_BR': 'circle-flags:br',
  'ic-locale_en_US': 'circle-flags:us',
};

interface SvgIconProps {
  icon: string;
  color?: string;
  size?: string | number;
  className?: string;
  style?: CSSProperties;
}

export default function SvgIcon({ icon, size = '1em', className = '', style = {} }: SvgIconProps) {
  if (icon === 'ic-settings-mode-sun') {
    return <SettingsModeSunIcon width={size} height={size} className={className} style={style} />;
  }
  if (icon === 'ic-settings-mode-moon') {
    return <SettingsModeMoonIcon width={size} height={size} className={className} style={style} />;
  }

  const mapped = ICON_MAP[icon] ?? icon;
  return <Iconify icon={mapped} size={size} className={className} style={style} />;
}
