import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import { getStringItem } from '@/utils/storage';

import en_US from './lang/en_US';
import pt_BR from './lang/pt_BR';

import { LocalEnum, StorageEnum } from '#/enum';

const defaultLng = getStringItem(StorageEnum.I18N) || LocalEnum.pt_BR;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: false,
    lng: defaultLng,
    fallbackLng: LocalEnum.pt_BR,
    interpolation: {
      escapeValue: false,
    },
    resources: {
      pt_BR: { translation: pt_BR },
      en_US: { translation: en_US },
    },
  });

export default i18n;
export const { t } = i18n;
