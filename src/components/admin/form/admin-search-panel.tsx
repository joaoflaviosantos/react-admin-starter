import { Children, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const SEARCH_FIELD_SLOTS = 3;

type AdminSearchPanelProps = {
  children: ReactNode;
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
  const fields = Children.toArray(children).slice(0, SEARCH_FIELD_SLOTS);
  const emptySlots = SEARCH_FIELD_SLOTS - fields.length;

  return (
    <div className={cn('grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4', className)}>
      {fields.map((field, index) => (
        <div key={index} className="min-w-0">
          {field}
        </div>
      ))}
      {Array.from({ length: emptySlots }, (_, index) => (
        <div key={`empty-${index}`} aria-hidden="true" className="hidden xl:block" />
      ))}
      <div
        className={cn(
          'flex items-center justify-end gap-3',
          emptySlots > 0 && 'lg:col-span-2 xl:col-span-1',
        )}
      >
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
