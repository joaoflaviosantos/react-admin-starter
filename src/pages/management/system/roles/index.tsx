import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { type ColumnDef } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import roleService, { SystemRoleAPISearchFormFieldType } from '@/api/services/system/roleService';
import { AdminTable } from '@/components/admin/data-table';
import { StatusBadge } from '@/components/admin/status-badge';
import { AdminForm, AdminSearchPanel } from '@/components/admin/form';
import { SearchFieldInput, SearchFieldSelect } from '@/components/admin/form/search-field';
import { AdminPage } from '@/components/admin/page';
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
        cell: ({ row }) => (
          <TableActions
            permissionLabel={currentRouteMeta?.label}
            record={row.original}
            isFetching={isFetching}
            onDetail={(id) => {
              const role = data?.data?.find((item) => item.id === id) ?? null;
              setSelectedRole(role);
            }}
          />
        ),
      },
    ],
    [t, currentRouteMeta?.label, data?.data, isFetching],
  );

  return (
    <AdminPage className="flex flex-col gap-4">
      <Card className="shadow-sm">
        <CardContent className="pt-6">
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
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm font-semibold">{t('management.roles.listTitle')}</CardTitle>
          <Button
            disabled={!canCreate || isFetching}
            title={!canCreate ? t('common.noCreatePermission') : t('common.newText')}
            onClick={() => appToast.info(t('management.roles.createComingSoon'))}
          >
            {t('common.newText')}
          </Button>
        </CardHeader>
        <CardContent>
          <AdminTable
            columns={columns}
            data={data?.data ?? []}
            isLoading={isFetching}
            rowKey="id"
            scrollHeight={tableHeight}
            pagination={{
              pageIndex: data?.page ?? pagination.page,
              pageSize: data?.items_per_page ?? pagination.pageSize,
              totalCount: data?.total_count ?? 0,
              onPaginationChange: (pageIndex, pageSize) => {
                setPagination({ page: pageIndex, pageSize });
              },
            }}
          />
        </CardContent>
      </Card>

      <RoleDetailModal
        role={selectedRole}
        show={selectedRole !== null}
        onClose={() => setSelectedRole(null)}
      />
    </AdminPage>
  );
}
