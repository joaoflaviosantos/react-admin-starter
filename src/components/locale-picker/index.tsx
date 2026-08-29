import { useTranslation } from 'react-i18next';

import useLocale, { LANGUAGE_MAP } from '@/locales/useLocale';

import { IconButton, SvgIcon } from '../icon';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function LocalePicker() {
  const { t } = useTranslation();
  const { setLocale, locale } = useLocale();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <IconButton title={t('common.changeLanguage')} className="mt-[0.125rem] h-10 w-10">
          <SvgIcon icon={`ic-locale_${locale}`} size="24" className="rounded-md" />
        </IconButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {Object.values(LANGUAGE_MAP).map((item) => (
          <DropdownMenuItem key={item.locale} onClick={() => setLocale(item.locale)}>
            <SvgIcon icon={item.icon} size="20" className="mr-2 rounded-md" />
            {item.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
