import { useTranslation } from 'react-i18next';

import useLocale, { LANGUAGE_MAP } from '@/locales/useLocale';
import { LANGUAGE_FLAG_COMPONENTS } from '@/components/icon/language';

import { IconButton } from '../icon';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

/** Converts LocalEnum values (e.g. 'pt_BR') to BCP-47 tags (e.g. 'pt-BR') */
const toLanguageTag = (locale: string) => locale.replace('_', '-');

export default function LocalePicker() {
  const { t } = useTranslation();
  const { setLocale, locale } = useLocale();

  const langTag = toLanguageTag(locale);
  const CurrentFlag = LANGUAGE_FLAG_COMPONENTS[langTag as keyof typeof LANGUAGE_FLAG_COMPONENTS];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <IconButton title={t('common.changeLanguage')} className="h-10 w-10">
          <span className="flex items-center justify-center overflow-hidden rounded border border-border shadow-sm">
            {CurrentFlag ? <CurrentFlag width={24} height={18} /> : null}
          </span>
        </IconButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {Object.values(LANGUAGE_MAP).map((item) => {
          const tag = toLanguageTag(item.locale);
          const FlagComponent =
            LANGUAGE_FLAG_COMPONENTS[tag as keyof typeof LANGUAGE_FLAG_COMPONENTS];
          return (
            <DropdownMenuItem key={item.locale} onClick={() => setLocale(item.locale)}>
              {FlagComponent ? (
                <span className="mr-2 flex items-center justify-center overflow-hidden rounded border border-border shadow-sm">
                  <FlagComponent width={20} height={15} />
                </span>
              ) : null}
              {item.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
