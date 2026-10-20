import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { type ColumnDef } from '@tanstack/react-table';
import { useCallback, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import userService, { SystemUserAPISearchFormFieldType } from '@/api/services/system/userService';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useHasRequiredPermission } from '@/hooks/permissions/use-has-required-permission';
import { normalizeCrudSearchValues } from '@/lib/crud-search';
import { appToast } from '@/lib/toast';
import { useMatchRouteMeta } from '@/router/hooks';
import { getColorFromName } from '@/utils/colors';
import { getInitials } from '@/utils/format-string';
import { createUserSearchSchema, type UserSearchFormValues } from './schema';
import { UserCreateModal, UserCreateModalProps } from './user-create-modal';
import { UserDeleteConfirmModal } from './user-delete-confirm-modal';
import { UserDetailModal } from './user-detail-modal';
import { UserEditModal } from './user-edit-modal';

import type { UserCreate, UserRead } from '#/system/user';

const DEFAULT_USER_VALUE: UserCreate = {
  email: '',
  name: '',
  role_id: '',
};

const EMPTY_USER_SEARCH: UserSearchFormValues = {
  name: '',
  role: '',
  is_active: '',
};

function formatDate(value?: string | null) {
  if (!value) return '-';
  return new Date(value).toLocaleString();
}

export default function ManagementSystemUsersPage() {
  const { t } = useTranslation();
  const { mode, setMode } = useAdminDataViewMode();
  const queryClient = useQueryClient();
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10 });
  const [searchValues, setSearchValues] = useState<SystemUserAPISearchFormFieldType>({});
  const currentRouteMeta = useMatchRouteMeta();
  const { canCreate } = useHasRequiredPermission(currentRouteMeta?.label);
  const [editUser, setEditUser] = useState<UserRead | null>(null);
  const [detailUserId, setDetailUserId] = useState<string | null>(null);
  const [userToDelete, setUserToDelete] = useState<UserRead | null>(null);
  const [userModalProps, setUserCreateModalProps] = useState<UserCreateModalProps>({
    formValue: { ...DEFAULT_USER_VALUE },
    title: t('common.newText'),
    show: false,
    onReset: () => {
      setUserCreateModalProps((prev) => ({
        ...prev,
        show: false,
        formValue: { ...DEFAULT_USER_VALUE },
      }));
    },
    onCancel: () => {
      setUserCreateModalProps((prev) => ({ ...prev, show: false }));
    },
  });

  const searchSchema = useMemo(() => createUserSearchSchema(), []);
  const searchForm = useForm<UserSearchFormValues>({
    resolver: zodResolver(searchSchema),
    defaultValues: EMPTY_USER_SEARCH,
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

  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => userService.deleteUserById(id),
    onSuccess: () => {
      appToast.success(t('management.users.messages.deleteSuccess'));
      setUserToDelete(null);
      void queryClient.invalidateQueries({ queryKey: ['management-system-users'] });
    },
    onError: () => {
      appToast.error(t('management.users.messages.deleteError'));
    },
  });

  const { data, isFetching } = useQuery({
    queryKey: ['management-system-users', pagination.page, pagination.pageSize, searchValues],
    queryFn: () =>
      userService.getPaginatedUserList({
        page: pagination.page,
        items_per_page: pagination.pageSize,
        searchValues,
      }),
  });

  const onSearch = (fields: UserSearchFormValues) => {
    setSearchValues(normalizeCrudSearchValues(fields) as SystemUserAPISearchFormFieldType);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const onSearchReset = () => {
    searchForm.reset(EMPTY_USER_SEARCH);
    setSearchValues({});
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const actions = useCallback(
    (user: UserRead) => (
      <TableActions
        permissionLabel={currentRouteMeta?.label}
        record={user}
        isFetching={isFetching}
        onDetail={(id) => setDetailUserId(id)}
        onUpdate={(id) => {
          const recordToEdit = data?.data?.find((item) => item.id === id) ?? null;
          setEditUser(recordToEdit);
        }}
        onDelete={(id) => {
          const recordToDelete = data?.data?.find((item) => item.id === id) ?? null;
          setUserToDelete(recordToDelete);
        }}
      />
    ),
    [currentRouteMeta?.label, data?.data, isFetching],
  );

  const columns: ColumnDef<UserRead>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: t('management.users.tableColumns.name'),
        cell: ({ row }) => {
          const name = row.original.name;
          const avatarColor = getColorFromName(name);

          return (
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                {row.original.profile_image_url ? (
                  <AvatarImage src={row.original.profile_image_url} alt={name} />
                ) : null}
                <AvatarFallback
                  className="text-[0.7rem] font-medium text-white"
                  style={{ backgroundColor: avatarColor }}
                >
                  {getInitials(name, 2)}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium">{name}</span>
            </div>
          );
        },
      },
      {
        accessorKey: 'email',
        header: t('management.users.tableColumns.email'),
      },
      {
        accessorKey: 'role_label',
        header: t('management.users.tableColumns.role'),
        cell: ({ row }) => (
          <Badge variant="secondary">{row.original.role_label || row.original.role}</Badge>
        ),
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
        accessorKey: 'updated_at',
        header: t('management.common.tableColumns.lastUpdate'),
        cell: ({ row }) => formatDate(row.original.updated_at),
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

  const summary = (user: UserRead, context: AdminDataViewItemContext, compact = false) => {
    const avatarColor = getColorFromName(user.name);

    return (
      <Card className={compact ? 'shadow-none' : undefined}>
        <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-2">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar className="h-9 w-9">
              {user.profile_image_url ? (
                <AvatarImage src={user.profile_image_url} alt={user.name} />
              ) : null}
              <AvatarFallback
                className="text-[0.7rem] font-medium text-white"
                style={{ backgroundColor: avatarColor }}
              >
                {getInitials(user.name, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <CardTitle className="truncate text-base">{user.name}</CardTitle>
              <p className="truncate text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          {context.actions}
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 text-sm">
          <Badge variant="secondary">{user.role_label || user.role}</Badge>
          <span className="text-right">
            <StatusBadge
              active={user.is_active ?? false}
              activeLabel={t('common.active')}
              inactiveLabel={t('common.inactive')}
            />
          </span>
          <span className="col-span-2 text-xs text-muted-foreground">
            {t('management.common.tableColumns.lastUpdate')}: {formatDate(user.updated_at)}
          </span>
        </CardContent>
      </Card>
    );
  };

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
                label={t('management.users.tableColumns.name')}
                disabled={isFetching}
              />
              <SearchFieldInput
                control={searchForm.control}
                name="role"
                label={t('management.users.tableColumns.role')}
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
        listTitle={t('management.users.listTitle')}
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
              onClick={() =>
                setUserCreateModalProps((prev) => ({
                  ...prev,
                  show: true,
                  title: t('management.users.newModalText'),
                }))
              }
            >
              {t('common.newText')}
            </Button>
          </>
        }
      >
        <AdminDataView
          data={data?.data ?? []}
          getItemId={(user) => user.id}
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
          renderTable={({ data: rows }) => <AdminTable columns={columns} data={rows} rowKey="id" />}
          renderGridItem={(user, context) => summary(user, context)}
          renderListItem={(user, context) => summary(user, context, true)}
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

      <UserCreateModal {...userModalProps} />
      <UserDetailModal
        userId={detailUserId}
        show={detailUserId !== null}
        onClose={() => setDetailUserId(null)}
      />
      <UserEditModal user={editUser} show={editUser !== null} onClose={() => setEditUser(null)} />
      <UserDeleteConfirmModal
        user={userToDelete}
        show={userToDelete !== null}
        isPending={deleteUserMutation.isPending}
        onClose={() => setUserToDelete(null)}
        onConfirm={() => {
          if (userToDelete) {
            deleteUserMutation.mutate(userToDelete.id);
          }
        }}
      />
    </>
  );
}
