import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

type AdminTablePaginationProps = {
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  onPaginationChange: (pageIndex: number, pageSize: number) => void;
};

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export function AdminTablePagination({
  pageIndex,
  pageSize,
  totalCount,
  onPaginationChange,
}: AdminTablePaginationProps) {
  const { t } = useTranslation();
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const currentPage = pageIndex;

  const getVisiblePages = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 3) return [1, 2, 3, 4, 'ellipsis', totalPages] as const;
    if (currentPage >= totalPages - 2) {
      return [1, 'ellipsis', totalPages - 3, totalPages - 2, totalPages - 1, totalPages] as const;
    }
    return [
      1,
      'ellipsis',
      currentPage - 1,
      currentPage,
      currentPage + 1,
      'ellipsis',
      totalPages,
    ] as const;
  };

  return (
    <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">
          {t('common.total', { total: totalCount })}
        </span>
        <div className="flex items-center gap-2">
          <Select
            value={String(pageSize)}
            onValueChange={(value) => onPaginationChange(1, Number(value))}
          >
            <SelectTrigger className="h-8 w-[72px] bg-background text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span>{t('common.perPage')}</span>
        </div>
      </div>

      <div className="flex items-center justify-end gap-1">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={currentPage <= 1}
          aria-label={t('common.previousPage')}
          onClick={() => onPaginationChange(currentPage - 1, pageSize)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {getVisiblePages().map((page, index) =>
          page === 'ellipsis' ? (
            <span
              key={`ellipsis-${index}`}
              className="flex h-8 w-8 items-center justify-center text-muted-foreground"
              aria-hidden
            >
              <MoreHorizontal className="h-4 w-4" />
            </span>
          ) : (
            <Button
              key={page}
              type="button"
              variant={page === currentPage ? 'default' : 'outline'}
              size="icon"
              className={cn(
                'h-8 min-w-8 px-2 text-xs',
                page === currentPage && 'pointer-events-none',
              )}
              aria-current={page === currentPage ? 'page' : undefined}
              onClick={() => onPaginationChange(page, pageSize)}
            >
              {page}
            </Button>
          ),
        )}

        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={currentPage >= totalPages}
          aria-label={t('common.nextPage')}
          onClick={() => onPaginationChange(currentPage + 1, pageSize)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
