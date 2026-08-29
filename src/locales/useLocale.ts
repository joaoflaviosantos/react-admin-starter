import { useTranslation } from 'react-i18next';

import { LocalEnum, StorageEnum } from '#/enum';

type Locale = keyof typeof LocalEnum;

type Language = {
  locale: Locale;
  icon: string;
  label: string;
};

export const LANGUAGE_MAP: Record<Locale, Language> = {
  [LocalEnum.pt_BR]: {
    locale: LocalEnum.pt_BR,
    label: 'Português',
    icon: 'ic-locale_pt_BR',
  },
  [LocalEnum.en_US]: {
    locale: LocalEnum.en_US,
    label: 'English',
    icon: 'ic-locale_en_US',
  },
};

export default function useLocale() {
  const { i18n } = useTranslation();

  const setLocale = (locale: Locale) => {
    i18n.changeLanguage(locale);
    localStorage.setItem(StorageEnum.I18N, locale);
  };

  const locale = (i18n.resolvedLanguage || LocalEnum.pt_BR) as Locale;
  const language = LANGUAGE_MAP[locale];

  return {
    locale,
    language,
    setLocale,
  };
}
