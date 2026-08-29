import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type AdminSearchPanelProps = {
  children: React.ReactNode;
  onClear: () => void;
  clearDisabled?: boolean;
  isLoading?: boolean;
  className?: string;
};

export function AdminSearchPanel({
  children,
  onClear,
  clearDisabled = false,
  isLoading = false,
  className,
}: AdminSearchPanelProps) {
  const { t } = useTranslation();

  return (
    <div className={cn('grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4', className)}>
      {children}
      <div className="flex items-center justify-end gap-3 lg:col-span-2 xl:col-span-1">
        <Button
          type="button"
          variant="outline"
          onClick={onClear}
          disabled={isLoading || clearDisabled}
          className={clearDisabled ? 'opacity-70' : ''}
        >
          {t('common.clearText')}
        </Button>
        <Button type="submit" disabled={isLoading}>
          {t('common.searchText')}
        </Button>
      </div>
    </div>
  );
}
