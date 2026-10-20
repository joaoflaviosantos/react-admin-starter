import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { type ColumnDef } from '@tanstack/react-table';
import { useCallback, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import roleService, { SystemRoleAPISearchFormFieldType } from '@/api/services/system/roleService';
import { AdminTable, AdminTablePagination } from '@/components/admin/data-table';
import {
  AdminDataView,
  DataViewToggle,
  useAdminDataViewMode,
  type AdminDataViewItemContext,
} from '@/components/admin/data-view';
import { AdminForm, AdminSearchPanel } from '@/components/admin/form';
import { SearchFieldInput, SearchFieldSelect } from '@/components/admin/form/search-field';
import { AdminListPage } from '@/components/admin/page';
import { StatusBadge } from '@/components/admin/status-badge';
import TableActions from '@/components/admin/table-actions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import useDynamicComponentStringHeight from '@/hooks/components/use-dynamic-component-string-height';
import { useHasRequiredPermission } from '@/hooks/permissions/use-has-required-permission';
import { normalizeCrudSearchValues } from '@/lib/crud-search';
import { appToast } from '@/lib/toast';
import { useMatchRouteMeta } from '@/router/hooks';
import { RoleDetailModal } from './role-detail-modal';
import { createRoleSearchSchema, type RoleSearchFormValues } from './schema';

import type { RoleRead } from '#/system/role';

const EMPTY_ROLE_SEARCH: RoleSearchFormValues = {
  name: '',
  description: '',
  is_active: '',
};

export default function ManagementSystemRolesPage() {
  const { t } = useTranslation();
  const tableHeight = useDynamicComponentStringHeight();
  const { mode, setMode } = useAdminDataViewMode();
  const currentRouteMeta = useMatchRouteMeta();
  const { canCreate } = useHasRequiredPermission(currentRouteMeta?.label);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10 });
  const [searchValues, setSearchValues] = useState<SystemRoleAPISearchFormFieldType>({});
  const [selectedRole, setSelectedRole] = useState<RoleRead | null>(null);

  const searchSchema = useMemo(() => createRoleSearchSchema(), []);
  const searchForm = useForm<RoleSearchFormValues>({
    resolver: zodResolver(searchSchema),
    defaultValues: EMPTY_ROLE_SEARCH,
  });

  const statusSearchOptions = useMemo(
    () => [
      {
        value: 'true',
        label: <StatusBadge active activeLabel={t('common.active')} inactiveLabel="" />,
      },
      {
        value: 'false',
        label: <StatusBadge active={false} activeLabel="" inactiveLabel={t('common.inactive')} />,
      },
    ],
    [t],
  );

  const { data, isFetching } = useQuery({
    queryKey: ['management-system-roles', pagination.page, pagination.pageSize, searchValues],
    queryFn: () =>
      roleService.getPaginatedRoleList({
        page: pagination.page,
        items_per_page: pagination.pageSize,
        searchValues,
      }),
  });

  const onSearch = (fields: RoleSearchFormValues) => {
    setSearchValues(normalizeCrudSearchValues(fields) as SystemRoleAPISearchFormFieldType);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const onSearchReset = () => {
    searchForm.reset(EMPTY_ROLE_SEARCH);
    setSearchValues({});
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const openDetail = useCallback(
    (id: string) => {
      const role = data?.data?.find((item) => item.id === id) ?? null;
      setSelectedRole(role);
    },
    [data?.data],
  );

  const actions = useCallback(
    (role: RoleRead) => (
      <TableActions
        permissionLabel={currentRouteMeta?.label}
        record={role}
        isFetching={isFetching}
        onDetail={openDetail}
      />
    ),
    [currentRouteMeta?.label, isFetching, openDetail],
  );

  const columns: ColumnDef<RoleRead>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: t('management.roles.tableColumns.name'),
        cell: ({ row }) => (
          <Badge variant="secondary">{row.original.label || row.original.name}</Badge>
        ),
      },
      {
        accessorKey: 'description',
        header: t('management.roles.tableColumns.description'),
      },
      {
        accessorKey: 'is_active',
        header: t('management.common.tableColumns.status'),
        cell: ({ row }) => (
          <StatusBadge
            active={row.original.is_active ?? false}
            activeLabel={t('common.active')}
            inactiveLabel={t('common.inactive')}
          />
        ),
      },
      {
        id: 'action',
        header: () => (
          <div className="text-center">{t('management.common.tableColumns.action')}</div>
        ),
        cell: ({ row }) => actions(row.original),
      },
    ],
    [actions, t],
  );

  const summary = (role: RoleRead, context: AdminDataViewItemContext, compact = false) => (
    <Card className={compact ? 'shadow-none' : undefined}>
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-2">
        <div className="min-w-0">
          <CardTitle className="truncate text-base">
            <Badge variant="secondary">{role.label || role.name}</Badge>
          </CardTitle>
        </div>
        {context.actions}
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p className="text-muted-foreground">{role.description}</p>
        <StatusBadge
          active={role.is_active ?? false}
          activeLabel={t('common.active')}
          inactiveLabel={t('common.inactive')}
        />
      </CardContent>
    </Card>
  );

  return (
    <>
      <AdminListPage
        filters={
          <AdminForm form={searchForm} onSubmit={onSearch}>
            <AdminSearchPanel
              isLoading={isFetching}
              clearDisabled={Object.keys(searchValues).length === 0}
              onClear={onSearchReset}
            >
              <SearchFieldInput
                control={searchForm.control}
                name="name"
                label={t('management.roles.tableColumns.name')}
                disabled={isFetching}
              />
              <SearchFieldInput
                control={searchForm.control}
                name="description"
                label={t('management.roles.tableColumns.description')}
                disabled={isFetching}
              />
              <SearchFieldSelect
                control={searchForm.control}
                name="is_active"
                label={t('management.common.tableColumns.status')}
                options={statusSearchOptions}
                disabled={isFetching}
              />
            </AdminSearchPanel>
          </AdminForm>
        }
        listTitle={t('management.roles.listTitle')}
        listActions={
          <>
            <DataViewToggle
              mode={mode}
              onChange={setMode}
              labels={{
                table: t('app.dataView.table'),
                grid: t('app.dataView.grid'),
                list: t('app.dataView.list'),
              }}
            />
            <Button
              disabled={!canCreate || isFetching}
              title={!canCreate ? t('common.noCreatePermission') : t('common.newText')}
              onClick={() => appToast.info(t('management.roles.createComingSoon'))}
            >
              {t('common.newText')}
            </Button>
          </>
        }
      >
        <AdminDataView
          data={data?.data ?? []}
          getItemId={(role) => role.id}
          isLoading={isFetching}
          showToggle={false}
          renderActions={actions}
          labels={{
            table: t('app.dataView.table'),
            grid: t('app.dataView.grid'),
            list: t('app.dataView.list'),
            loading: t('app.dataView.loading'),
            empty: t('common.noData'),
            error: t('app.dataView.error'),
          }}
          renderTable={({ data: rows }) => (
            <AdminTable columns={columns} data={rows} rowKey="id" scrollHeight={tableHeight} />
          )}
          renderGridItem={(role, context) => summary(role, context)}
          renderListItem={(role, context) => summary(role, context, true)}
          pagination={
            <AdminTablePagination
              pageIndex={data?.page ?? pagination.page}
              pageSize={data?.items_per_page ?? pagination.pageSize}
              totalCount={data?.total_count ?? 0}
              onPaginationChange={(pageIndex, pageSize) => {
                setPagination({ page: pageIndex, pageSize });
              }}
            />
          }
        />
      </AdminListPage>

      <RoleDetailModal
        role={selectedRole}
        show={selectedRole !== null}
        onClose={() => setSelectedRole(null)}
      />
    </>
  );
}
