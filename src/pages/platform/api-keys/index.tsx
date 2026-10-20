import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import { Eye, Plus, ShieldOff } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import apiKeyService, { type ApiKeyListParams } from '@/api/services/domains/apiKeyService';
import { AdminTable, AdminTablePagination } from '@/components/admin/data-table';
import {
  AdminDataView,
  DataViewToggle,
  useAdminDataViewMode,
  type AdminDataViewItemContext,
} from '@/components/admin/data-view';
import {
  AdminForm,
  AdminSearchPanel,
  SearchFieldInput,
  SearchFieldSelect,
} from '@/components/admin/form';
import { AdminListPage } from '@/components/admin/page';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useHasRequiredPermission } from '@/hooks/permissions/use-has-required-permission';
import { appToast } from '@/lib/toast';
import { useMatchRouteMeta } from '@/router/hooks';
import type { ApiKey } from '#/domain';

import { ApiKeyCreateModal } from './api-key-create-modal';
import { ApiKeyDetailModal } from './api-key-detail-modal';
import { ApiKeyRevokeConfirmModal } from './api-key-revoke-confirm-modal';
import { ApiKeySecretModal } from './api-key-secret-modal';

type ApiKeyFilters = {
  search: string;
  status: NonNullable<ApiKeyListParams['status']>;
};

const EMPTY_API_KEY_FILTERS: ApiKeyFilters = {
  search: '',
  status: '',
};

export default function ApiKeysPage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'pt_BR' ? 'pt-BR' : 'en-US';
  const permissions = useHasRequiredPermission(useMatchRouteMeta()?.label);
  const { mode, setMode } = useAdminDataViewMode();
  const client = useQueryClient();
  const [filters, setFilters] = useState<ApiKeyFilters>(EMPTY_API_KEY_FILTERS);
  const searchForm = useForm<ApiKeyFilters>({ defaultValues: EMPTY_API_KEY_FILTERS });
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10 });
  const [creating, setCreating] = useState(false);
  const [details, setDetails] = useState<ApiKey | null>(null);
  const [revoking, setRevoking] = useState<ApiKey | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const query = useQuery({
    queryKey: ['domains', 'api-keys', filters, pagination],
    queryFn: () =>
      apiKeyService.getApiKeys({ ...filters, ...pagination, items_per_page: pagination.pageSize }),
  });
  const invalidate = () => client.invalidateQueries({ queryKey: ['domains', 'api-keys'] });
  const revoke = useMutation({
    mutationFn: apiKeyService.revokeApiKey,
    onSuccess: () => {
      setRevoking(null);
      void invalidate();
      appToast.success(t('app.apiKeys.revokedToast'));
    },
    onError: () => appToast.error(t('app.apiKeys.revokeError')),
  });
  const keys = query.data?.data ?? [];
  const date = (value: string | null) =>
    value ? new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(value)) : '—';
  const status = (key: ApiKey) =>
    key.revokedAt ? (
      <Badge variant="destructive">{t('app.apiKeys.revoked')}</Badge>
    ) : (
      <Badge variant="secondary">{t('app.apiKeys.active')}</Badge>
    );
  const actions = (key: ApiKey) => (
    <div className="flex items-center gap-1">
      <Button
        size="icon"
        variant="ghost"
        aria-label={t('app.apiKeys.viewAria', { name: key.name })}
        title={key.prefix}
        onClick={() => setDetails(key)}
      >
        <Eye className="h-4 w-4" />
      </Button>
      {permissions.canDelete && !key.revokedAt ? (
        <Button
          size="icon"
          variant="ghost"
          aria-label={t('app.apiKeys.revokeAria', { name: key.name })}
          onClick={() => setRevoking(key)}
        >
          <ShieldOff className="h-4 w-4" />
        </Button>
      ) : null}
    </div>
  );
  const columns: ColumnDef<ApiKey>[] = [
    { accessorKey: 'name', header: t('app.apiKeys.name') },
    { accessorKey: 'prefix', header: t('app.apiKeys.prefix') },
    {
      id: 'scopes',
      header: t('app.apiKeys.scopes'),
      cell: ({ row }) => <span>{row.original.scopes.length}</span>,
    },
    {
      id: 'status',
      header: t('app.common.fields.status'),
      cell: ({ row }) => status(row.original),
    },
    {
      accessorKey: 'expiresAt',
      header: t('app.apiKeys.expiresAt'),
      cell: ({ row }) => date(row.original.expiresAt),
    },
    {
      accessorKey: 'lastUsedAt',
      header: t('app.apiKeys.lastUsedAt'),
      cell: ({ row }) => date(row.original.lastUsedAt),
    },
    {
      id: 'actions',
      header: t('app.apiKeys.actions'),
      cell: ({ row }) => actions(row.original),
    },
  ];
  const summary = (key: ApiKey, context: AdminDataViewItemContext, compact = false) => (
    <Card className={compact ? 'shadow-none' : undefined} data-api-key-id={key.id}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="min-w-0">
          <CardTitle className="truncate text-base">{key.name}</CardTitle>
          <p className="font-mono text-xs text-muted-foreground">{key.prefix}</p>
        </div>
        {context.actions}
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3 text-sm">
        {status(key)}
        <span className="text-right">
          {key.scopes.length} {t('app.apiKeys.scopes').toLowerCase()}
        </span>
        <span>
          {t('app.apiKeys.createdAt')}: {date(key.createdAt)}
        </span>
        <span className="text-right">{date(key.expiresAt)}</span>
      </CardContent>
    </Card>
  );
  const onSearch = (values: ApiKeyFilters) => {
    setFilters(values);
    setPagination((current) => ({ ...current, page: 1 }));
  };

  const onSearchReset = () => {
    searchForm.reset(EMPTY_API_KEY_FILTERS);
    setFilters(EMPTY_API_KEY_FILTERS);
    setPagination((current) => ({ ...current, page: 1 }));
  };

  return (
    <AdminListPage
      filters={
        <AdminForm form={searchForm} onSubmit={onSearch}>
          <AdminSearchPanel
            isLoading={query.isLoading}
            clearDisabled={!Object.values(filters).some(Boolean)}
            onClear={onSearchReset}
          >
            <SearchFieldInput
              control={searchForm.control}
              name="search"
              label={t('app.common.fields.search')}
              type="search"
              disabled={query.isLoading}
            />
            <SearchFieldSelect
              control={searchForm.control}
              name="status"
              label={t('app.common.fields.status')}
              placeholder={t('app.common.states.all')}
              options={[
                { value: 'active', label: t('app.apiKeys.active') },
                { value: 'revoked', label: t('app.apiKeys.revoked') },
              ]}
              disabled={query.isLoading}
            />
          </AdminSearchPanel>
        </AdminForm>
      }
      listTitle={t('app.apiKeys.listTitle')}
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
          {permissions.canCreate ? (
            <Button onClick={() => setCreating(true)}>
              <Plus className="mr-2 h-4 w-4" />
              {t('app.apiKeys.new')}
            </Button>
          ) : null}
        </>
      }
    >
      <AdminDataView
        data={keys}
        getItemId={(key) => key.id}
        isLoading={query.isLoading}
        error={query.error}
        showToggle={false}
        renderActions={actions}
        labels={{
          table: t('app.dataView.table'),
          grid: t('app.dataView.grid'),
          list: t('app.dataView.list'),
          loading: t('app.apiKeys.loading'),
          empty: t('app.apiKeys.empty'),
          error: t('app.apiKeys.loadError'),
        }}
        renderTable={({ data }) => <AdminTable columns={columns} data={data} rowKey="id" />}
        renderGridItem={(key, context) => summary(key, context)}
        renderListItem={(key, context) => summary(key, context, true)}
        pagination={
          <AdminTablePagination
            pageIndex={query.data?.page ?? pagination.page}
            pageSize={query.data?.items_per_page ?? pagination.pageSize}
            totalCount={query.data?.total_count ?? 0}
            onPaginationChange={(page, pageSize) => setPagination({ page, pageSize })}
          />
        }
      />
      <ApiKeyCreateModal
        open={creating}
        onOpenChange={setCreating}
        onCreated={(result) => setSecret(result.secret)}
      />
      <ApiKeyDetailModal apiKey={details} locale={locale} onClose={() => setDetails(null)} />
      <ApiKeyRevokeConfirmModal
        apiKey={revoking}
        show={revoking !== null}
        isPending={revoke.isPending}
        onClose={() => setRevoking(null)}
        onConfirm={() => revoking && revoke.mutate(revoking.id)}
      />
      <ApiKeySecretModal secret={secret} onClose={() => setSecret(null)} />
    </AdminListPage>
  );
}
