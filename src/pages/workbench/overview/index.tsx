import { useTranslation } from 'react-i18next';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUserInfo } from '@/store/userStore';

export default function OverviewPage() {
  const { t } = useTranslation();
  const userInfo = useUserInfo();

  return (
    <div className="pb-4">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl">
            {t('workbench.overview.welcome')}, {userInfo.name ?? 'User'}
          </CardTitle>
          <CardDescription>{t('workbench.overview.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{t('workbench.overview.comingSoon')}</p>
        </CardContent>
      </Card>
    </div>
  );
}
