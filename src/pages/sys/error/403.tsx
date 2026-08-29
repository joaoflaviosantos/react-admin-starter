import { useTranslation } from 'react-i18next';

import { EmptyState } from '@/components/admin/empty-state';
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
    <EmptyState
      title={t('sys.error.403Title')}
      description={t('sys.error.403Desc')}
      action={{
        label: isAuthenticated ? t('sys.error.backHome') : t('sys.error.backLogin'),
        onClick: goBack,
      }}
    />
  );
}
