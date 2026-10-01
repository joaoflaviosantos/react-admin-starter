import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import { Check, Copy, Eye, KeyRound, Plus, ShieldOff } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import apiKeyService, { type ApiKeyListParams } from '@/api/services/examples/apiKeyService';
import ConfirmDialog from '@/components/admin/confirm-dialog';
import { AdminTable, AdminTablePagination } from '@/components/admin/data-table';
import { AdminDataView, type AdminDataViewItemContext } from '@/components/admin/data-view';
import { AdminPage, AdminPageHeader } from '@/components/admin/page';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useHasRequiredPermission } from '@/hooks/permissions/use-has-required-permission';
import { appToast } from '@/lib/toast';
import { useMatchRouteMeta } from '@/router/hooks';
import type { ApiKey, ApiKeyCreateResponse, ApiKeyInput, ApiKeyScope } from '#/examples';

const scopes: ApiKeyScope[] = [
  'customers:read',
  'customers:write',
  'billing:read',
  'billing:write',
  'tickets:read',
  'tickets:write',
  'audit:read',
];
const filterClass =
  'h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-sm';
const keyScopeSchema = z.enum([
  'customers:read',
  'customers:write',
  'billing:read',
  'billing:write',
  'tickets:read',
  'tickets:write',
  'audit:read',
] as const);

type KeyFormValues = ApiKeyInput;

function KeyDialog({
  open,
  pending,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  pending: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (value: ApiKeyInput) => void;
}) {
  const { t } = useTranslation();
  const schema = useMemo(
    () =>
      z.object({
        name: z.string().trim().min(3, t('examples.apiKeys.nameRequired')).max(80),
        scopes: z.array(keyScopeSchema).min(1, t('examples.apiKeys.scopeRequired')),
        expiresAt: z
          .string()
          .nullable()
          .refine(
            (value) => !value || Date.parse(`${value}T23:59:59Z`) > Date.now(),
            t('examples.apiKeys.expiryInvalid'),
          ),
      }),
    [t],
  );
  const form = useForm<KeyFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', scopes: ['customers:read'], expiresAt: null },
  });
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('examples.apiKeys.new')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <DialogBody className="space-y-4">
            <label className="block space-y-1 text-sm font-medium" htmlFor="api-key-name">
              <span>{t('examples.apiKeys.name')}</span>
              <Input id="api-key-name" {...form.register('name')} />
              {form.formState.errors.name ? (
                <span className="text-xs text-destructive">
                  {form.formState.errors.name.message}
                </span>
              ) : null}
            </label>
            <fieldset className="space-y-2">
              <legend className="text-sm font-medium">{t('examples.apiKeys.scopes')}</legend>
              <Controller
                name="scopes"
                control={form.control}
                render={({ field }) => (
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {scopes.map((scope) => {
                      const checked = field.value.includes(scope);
                      return (
                        <label key={scope} className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() =>
                              field.onChange(
                                checked
                                  ? field.value.filter((item) => item !== scope)
                                  : [...field.value, scope],
                              )
                            }
                          />
                          {t(
                            `examples.apiKeys.scope${scope
                              .split(':')
                              .map((part) => part[0]!.toUpperCase() + part.slice(1))
                              .join('')}`,
                          )}
                        </label>
                      );
                    })}
                  </div>
                )}
              />
              {form.formState.errors.scopes ? (
                <span className="text-xs text-destructive">
                  {form.formState.errors.scopes.message}
                </span>
              ) : null}
            </fieldset>
            <label className="block space-y-1 text-sm font-medium" htmlFor="api-key-expires">
              <span>{t('examples.apiKeys.expiresAt')}</span>
              <Input
                id="api-key-expires"
                type="date"
                {...form.register('expiresAt', { setValueAs: (value) => value || null })}
              />
              {form.formState.errors.expiresAt ? (
                <span className="text-xs text-destructive">
                  {form.formState.errors.expiresAt.message}
                </span>
              ) : null}
            </label>
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('examples.common.actions.cancel')}
            </Button>
            <Button type="submit" disabled={pending}>
              <KeyRound className="mr-2 h-4 w-4" />
              {t('examples.common.actions.create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function SecretDialog({ secret, onClose }: { secret: string | null; onClose: () => void }) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  if (!secret) return null;
  const copy = async () => {
    await navigator.clipboard?.writeText(secret);
    setCopied(true);
    appToast.success(t('examples.apiKeys.copied'));
  };
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('examples.apiKeys.secretTitle')}</DialogTitle>
        </DialogHeader>
        <DialogBody className="space-y-4">
          <p className="text-sm text-muted-foreground">{t('examples.apiKeys.secretOnce')}</p>
          <code className="block break-all rounded-md bg-muted p-3 text-sm">{secret}</code>
        </DialogBody>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={copy}>
            {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
            {copied ? t('examples.apiKeys.copied') : t('examples.apiKeys.copy')}
          </Button>
          <Button type="button" onClick={onClose}>
            {t('examples.common.actions.close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function ApiKeysPage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'pt_BR' ? 'pt-BR' : 'en-US';
  const permissions = useHasRequiredPermission(useMatchRouteMeta()?.label);
  const client = useQueryClient();
  const [filters, setFilters] = useState<ApiKeyListParams>({ search: '', status: '' });
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10 });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [secret, setSecret] = useState<string | null>(null);
  const query = useQuery({
    queryKey: ['examples', 'api-keys', filters, pagination],
    queryFn: () =>
      apiKeyService.getApiKeys({ ...filters, ...pagination, items_per_page: pagination.pageSize }),
  });
  const invalidate = () => client.invalidateQueries({ queryKey: ['examples', 'api-keys'] });
  const create = useMutation({
    mutationFn: apiKeyService.createApiKey,
    onSuccess: (result: ApiKeyCreateResponse) => {
      setDialogOpen(false);
      setSecret(result.secret);
      void invalidate();
      appToast.success(t('examples.apiKeys.saved'));
    },
    onError: () => appToast.error(t('examples.apiKeys.saveError')),
  });
  const revoke = useMutation({
    mutationFn: apiKeyService.revokeApiKey,
    onSuccess: () => {
      void invalidate();
      appToast.success(t('examples.apiKeys.revokedToast'));
    },
    onError: () => appToast.error(t('examples.apiKeys.revokeError')),
  });
  const keys = query.data?.data ?? [];
  const date = (value: string | null) =>
    value ? new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(value)) : '—';
  const status = (key: ApiKey) =>
    key.revokedAt ? (
      <Badge variant="destructive">{t('examples.apiKeys.revoked')}</Badge>
    ) : (
      <Badge variant="secondary">{t('examples.apiKeys.active')}</Badge>
    );
  const actions = (key: ApiKey) => (
    <div className="flex items-center gap-1">
      <Button
        size="icon"
        variant="ghost"
        aria-label={t('examples.apiKeys.viewAria', { name: key.name })}
        title={key.prefix}
      >
        <Eye className="h-4 w-4" />
      </Button>
      {permissions.canDelete && !key.revokedAt ? (
        <ConfirmDialog
          title={t('examples.apiKeys.revokeTitle', { name: key.name })}
          description={t('examples.apiKeys.revokeDescription')}
          confirmLabel={t('examples.apiKeys.revoke')}
          cancelLabel={t('examples.common.actions.cancel')}
          onConfirm={() => revoke.mutate(key.id)}
          trigger={
            <Button
              size="icon"
              variant="ghost"
              aria-label={t('examples.apiKeys.revokeAria', { name: key.name })}
            >
              <ShieldOff className="h-4 w-4" />
            </Button>
          }
        />
      ) : null}
    </div>
  );
  const columns: ColumnDef<ApiKey>[] = [
    { accessorKey: 'name', header: t('examples.apiKeys.name') },
    { accessorKey: 'prefix', header: t('examples.apiKeys.prefix') },
    {
      id: 'scopes',
      header: t('examples.apiKeys.scopes'),
      cell: ({ row }) => <span>{row.original.scopes.length}</span>,
    },
    {
      id: 'status',
      header: t('examples.common.fields.status'),
      cell: ({ row }) => status(row.original),
    },
    {
      accessorKey: 'expiresAt',
      header: t('examples.apiKeys.expiresAt'),
      cell: ({ row }) => date(row.original.expiresAt),
    },
    {
      accessorKey: 'lastUsedAt',
      header: t('examples.apiKeys.lastUsedAt'),
      cell: ({ row }) => date(row.original.lastUsedAt),
    },
    {
      id: 'actions',
      header: t('examples.apiKeys.actions'),
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
          {key.scopes.length} {t('examples.apiKeys.scopes').toLowerCase()}
        </span>
        <span>
          {t('examples.apiKeys.createdAt')}: {date(key.createdAt)}
        </span>
        <span className="text-right">{date(key.expiresAt)}</span>
      </CardContent>
    </Card>
  );
  const updateFilter = (name: 'search' | 'status', value: string) => {
    setFilters((current) => ({ ...current, [name]: value }));
    setPagination((current) => ({ ...current, page: 1 }));
  };
  return (
    <AdminPage>
      <AdminPageHeader
        title={t('examples.apiKeys.title')}
        description={t('examples.apiKeys.description')}
        actions={
          permissions.canCreate ? (
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              {t('examples.apiKeys.new')}
            </Button>
          ) : undefined
        }
      />
      <AdminDataView
        data={keys}
        getItemId={(key) => key.id}
        isLoading={query.isLoading}
        error={query.error}
        renderActions={actions}
        labels={{
          table: t('examples.dataView.table'),
          grid: t('examples.dataView.grid'),
          list: t('examples.dataView.list'),
          loading: t('examples.apiKeys.loading'),
          empty: t('examples.apiKeys.empty'),
          error: t('examples.apiKeys.loadError'),
        }}
        toolbar={
          <div className="flex flex-wrap gap-2">
            <Input
              className="min-w-52 flex-1"
              type="search"
              aria-label={t('examples.apiKeys.searchAria')}
              value={filters.search}
              onChange={(event) => updateFilter('search', event.target.value)}
            />
            <select
              className={filterClass}
              aria-label={t('examples.apiKeys.statusAria')}
              value={filters.status}
              onChange={(event) => updateFilter('status', event.target.value)}
            >
              <option value="">{t('examples.common.states.all')}</option>
              <option value="active">{t('examples.apiKeys.active')}</option>
              <option value="revoked">{t('examples.apiKeys.revoked')}</option>
            </select>
          </div>
        }
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
      <KeyDialog
        open={dialogOpen}
        pending={create.isPending}
        onOpenChange={setDialogOpen}
        onSubmit={(payload) => create.mutate(payload)}
      />
      <SecretDialog secret={secret} onClose={() => setSecret(null)} />
    </AdminPage>
  );
}
