import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';

import { EmptyState } from '@/components/admin/empty-state';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

import { AdminTablePagination } from './admin-table-pagination';

export type AdminTableProps<T> = {
  columns: ColumnDef<T, unknown>[];
  data: T[];
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  emptyMessage?: string;
  rowKey: keyof T | ((row: T) => string);
  pagination?: {
    pageIndex: number;
    pageSize: number;
    totalCount: number;
    onPaginationChange: (pageIndex: number, pageSize: number) => void;
  };
  scrollHeight?: string | number;
  size?: 'sm' | 'default';
  borderVariant?: 'default' | 'descriptions';
  className?: string;
};

function getRowId<T>(row: T, rowKey: keyof T | ((row: T) => string)): string {
  if (typeof rowKey === 'function') {
    return rowKey(row);
  }
  return String(row[rowKey]);
}

export function AdminTable<T>({
  columns,
  data,
  isLoading = false,
  isError = false,
  errorMessage,
  emptyMessage,
  rowKey,
  pagination,
  scrollHeight,
  size = 'sm',
  borderVariant = 'default',
  className,
}: AdminTableProps<T>) {
  const { t } = useTranslation();

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: Boolean(pagination),
    pageCount: pagination ? Math.ceil(pagination.totalCount / pagination.pageSize) : undefined,
  });

  const resolvedEmptyMessage = emptyMessage ?? t('common.noData');
  const resolvedErrorMessage = errorMessage ?? t('common.error');

  const cellPadding = size === 'sm' ? 'py-2' : 'py-3';

  return (
    <div className={cn('space-y-4', className)}>
      {isError ? (
        <Alert variant="destructive">
          <AlertDescription>{resolvedErrorMessage}</AlertDescription>
        </Alert>
      ) : null}

      <div
        className={cn(
          'rounded-md border',
          borderVariant === 'descriptions' && 'admin-table-descriptions overflow-hidden',
          className,
        )}
        style={scrollHeight ? { maxHeight: scrollHeight, overflow: 'auto' } : undefined}
      >
        <Table>
          <TableHeader
            className={cn(
              'sticky top-0 z-10 backdrop-blur-sm',
              borderVariant === 'descriptions' ? 'bg-transparent' : 'bg-muted/80',
            )}
          >
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className={cellPadding}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  {columns.map((_, colIndex) => (
                    <TableCell key={`skeleton-cell-${colIndex}`} className={cellPadding}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center">
                  <EmptyState title={resolvedEmptyMessage} />
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={getRowId(row.original, rowKey)}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className={cellPadding}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {pagination ? (
        <AdminTablePagination
          pageIndex={pagination.pageIndex}
          pageSize={pagination.pageSize}
          totalCount={pagination.totalCount}
          onPaginationChange={pagination.onPaginationChange}
        />
      ) : null}
    </div>
  );
}
