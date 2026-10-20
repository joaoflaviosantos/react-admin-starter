import type { ReactNode } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

import { AdminPage } from './admin-page';

type AdminListPageProps = {
  filters?: ReactNode;
  listTitle?: string;
  listActions?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function AdminListPage({
  filters,
  listTitle,
  listActions,
  children,
  className,
}: AdminListPageProps) {
  return (
    <AdminPage className={cn('flex flex-col gap-4', className)}>
      {filters ? (
        <Card className="shadow-sm">
          <CardContent className="pt-6">{filters}</CardContent>
        </Card>
      ) : null}

      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
          {listTitle ? (
            <CardTitle className="text-sm font-semibold">{listTitle}</CardTitle>
          ) : (
            <span />
          )}
          {listActions ? (
            <div className="flex flex-wrap items-center justify-end gap-2">{listActions}</div>
          ) : null}
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </AdminPage>
  );
}
