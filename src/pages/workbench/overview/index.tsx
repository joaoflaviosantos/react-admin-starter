import { Card, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

import { useUserInfo } from '@/store/userStore';

export default function OverviewPage() {
  const { t } = useTranslation();
  const userInfo = useUserInfo();

  return (
    <div className="pb-4">
      <Card className="shadow-sm">
        <Typography.Title level={3} className="!mb-2">
          {t('workbench.overview.welcome')}, {userInfo.name ?? 'User'}
        </Typography.Title>
        <Typography.Paragraph type="secondary">
          {t('workbench.overview.subtitle')}
        </Typography.Paragraph>
        <Typography.Paragraph>{t('workbench.overview.comingSoon')}</Typography.Paragraph>
      </Card>
    </div>
  );
}
