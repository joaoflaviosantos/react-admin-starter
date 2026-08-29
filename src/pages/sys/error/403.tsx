import { Button, Result } from 'antd';
import { useTranslation } from 'react-i18next';

import { useRouter } from '@/router/hooks';
import { useUserToken } from '@/store/userStore';

const HOMEPAGE = import.meta.env.VITE_APP_HOMEPAGE ?? '/workbench/overview';

export default function Page403() {
  const { t } = useTranslation();
  const { replace } = useRouter();
  const token = useUserToken();
  const isAuthenticated = Boolean(token.access_token);

  const goBack = () => {
    replace(isAuthenticated ? HOMEPAGE : '/login');
  };

  return (
    <div className="flex flex-1 items-center justify-center pb-12 pt-8">
      <Result
        status="403"
        title={t('sys.error.403Title')}
        subTitle={t('sys.error.403Desc')}
        extra={
          <Button type="primary" onClick={goBack}>
            {isAuthenticated ? t('sys.error.backHome') : t('sys.error.backLogin')}
          </Button>
        }
      />
    </div>
  );
}
