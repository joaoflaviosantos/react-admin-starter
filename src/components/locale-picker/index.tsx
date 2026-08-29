import { Dropdown } from 'antd';
import { useTranslation } from 'react-i18next';

import useLocale, { LANGUAGE_MAP } from '@/locales/useLocale';

import { IconButton, SvgIcon } from '../icon';

import { LocalEnum } from '#/enum';
import type { MenuProps } from 'antd';

type Locale = keyof typeof LocalEnum;

export default function LocalePicker() {
  const { t } = useTranslation();
  const { setLocale, locale } = useLocale();

  const localeList: MenuProps['items'] = Object.values(LANGUAGE_MAP).map((item) => ({
    key: item.locale,
    label: item.label,
    icon: <SvgIcon icon={item.icon} size="20" className="rounded-md" />,
  }));

  return (
    <Dropdown
      className="mt-[0.125rem]"
      placement="bottomRight"
      trigger={['click']}
      key={locale}
      menu={{ items: localeList, onClick: (e) => setLocale(e.key as Locale) }}
    >
      <IconButton title={t('common.changeLanguage')} className="h-10 w-10">
        <SvgIcon icon={`ic-locale_${locale}`} size="24" className="rounded-md" />
      </IconButton>
    </Dropdown>
  );
}
