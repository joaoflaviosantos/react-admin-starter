import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

import { DataViewToggle } from './data-view-toggle';
import { useAdminDataViewMode, type AdminDataViewMode } from './use-data-view-mode';

export type AdminDataViewItemContext = {
  isSelected: boolean;
  toggleSelected: () => void;
  actions?: ReactNode;
};

export type AdminDataViewContext<T> = {
  data: T[];
  selectedIds: string[];
  onSelectedIdsChange?: (ids: string[]) => void;
  renderActions?: (item: T) => ReactNode;
  getItemContext: (item: T) => AdminDataViewItemContext;
};

type AdminDataViewLabels = Record<AdminDataViewMode, string> & {
  loading: string;
  empty: string;
  error: string;
};

export type AdminDataViewProps<T> = {
  data: T[];
  getItemId: (item: T) => string;
  renderTable: (context: AdminDataViewContext<T>) => ReactNode;
  renderGridItem: (item: T, context: AdminDataViewItemContext) => ReactNode;
  renderListItem: (item: T, context: AdminDataViewItemContext) => ReactNode;
  renderActions?: (item: T) => ReactNode;
  selectedIds?: string[];
  onSelectedIdsChange?: (ids: string[]) => void;
  toolbar?: ReactNode;
  pagination?: ReactNode;
  isLoading?: boolean;
  error?: unknown;
  showToggle?: boolean;
  labels: AdminDataViewLabels;
  className?: string;
};

export function AdminDataView<T>({
  data,
  getItemId,
  renderTable,
  renderGridItem,
  renderListItem,
  renderActions,
  selectedIds = [],
  onSelectedIdsChange,
  toolbar,
  pagination,
  isLoading = false,
  error,
  showToggle = true,
  labels,
  className,
}: AdminDataViewProps<T>) {
  const { mode, setMode } = useAdminDataViewMode();
  const getItemContext = (item: T): AdminDataViewItemContext => {
    const id = getItemId(item);
    const isSelected = selectedIds.includes(id);
    return {
      isSelected,
      toggleSelected: () =>
        onSelectedIdsChange?.(
          isSelected ? selectedIds.filter((selected) => selected !== id) : [...selectedIds, id],
        ),
      actions: renderActions?.(item),
    };
  };
  const context: AdminDataViewContext<T> = {
    data,
    selectedIds,
    onSelectedIdsChange,
    renderActions,
    getItemContext,
  };

  let content: ReactNode;
  if (isLoading) {
    content = (
      <div
        role="status"
        aria-label={labels.loading}
        className="py-12 text-center text-sm text-muted-foreground"
      >
        {labels.loading}
      </div>
    );
  } else if (error) {
    content = (
      <div
        role="alert"
        aria-label={labels.error}
        className="py-12 text-center text-sm text-destructive"
      >
        {labels.error}
      </div>
    );
  } else if (data.length === 0) {
    content = (
      <div
        role="status"
        aria-label={labels.empty}
        className="py-12 text-center text-sm text-muted-foreground"
      >
        {labels.empty}
      </div>
    );
  } else if (mode === 'table') {
    content = <div data-view-mode="table">{renderTable(context)}</div>;
  } else if (mode === 'grid') {
    content = (
      <div data-view-mode="grid" className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data.map((item) => (
          <div key={getItemId(item)}>{renderGridItem(item, getItemContext(item))}</div>
        ))}
      </div>
    );
  } else {
    content = (
      <div data-view-mode="list" role="list" className="space-y-2">
        {data.map((item) => (
          <div key={getItemId(item)} role="listitem">
            {renderListItem(item, getItemContext(item))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <section className={cn('space-y-4', className)}>
      {toolbar || showToggle ? (
        <div className="flex flex-wrap items-center gap-3">
          <div className="min-w-0 flex-1">{toolbar}</div>
          {showToggle ? (
            <DataViewToggle
              mode={mode}
              onChange={setMode}
              labels={{ table: labels.table, grid: labels.grid, list: labels.list }}
            />
          ) : null}
        </div>
      ) : null}
      {content}
      {!isLoading && !error && data.length > 0 ? pagination : null}
    </section>
  );
}
