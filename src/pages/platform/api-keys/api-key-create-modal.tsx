import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { KeyRound } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import apiKeyService from '@/api/services/domains/apiKeyService';
import { AdminForm } from '@/components/admin/form';
import {
  FormControl,
  FormField,
  FormFieldInput,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/admin/form/form-field';
import { DividerProject } from '@/components/divider';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { modalContentWidthLgClass } from '@/lib/overlay-surface';
import { appToast } from '@/lib/toast';
import { cn } from '@/lib/utils';

import type { ApiKeyCreateResponse, ApiKeyInput, ApiKeyScope } from '#/domain';

const scopes: ApiKeyScope[] = [
  'customers:read',
  'customers:write',
  'billing:read',
  'billing:write',
  'tickets:read',
  'tickets:write',
  'audit:read',
];

const keyScopeSchema = z.enum(scopes);

type KeyFormValues = ApiKeyInput;

type ApiKeyCreateModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (result: ApiKeyCreateResponse) => void;
};

export function ApiKeyCreateModal({ open, onOpenChange, onCreated }: ApiKeyCreateModalProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const schema = useMemo(
    () =>
      z.object({
        name: z.string().trim().min(3, t('app.apiKeys.nameRequired')).max(80),
        scopes: z.array(keyScopeSchema).min(1, t('app.apiKeys.scopeRequired')),
        expiresAt: z
          .string()
          .nullable()
          .refine(
            (value) => !value || Date.parse(`${value}T23:59:59Z`) > Date.now(),
            t('app.apiKeys.expiryInvalid'),
          ),
      }),
    [t],
  );
  const form = useForm<KeyFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', scopes: ['customers:read'], expiresAt: null },
  });

  useEffect(() => {
    if (open) form.reset({ name: '', scopes: ['customers:read'], expiresAt: null });
  }, [form, open]);

  const mutation = useMutation({
    mutationFn: apiKeyService.createApiKey,
    onSuccess: (result: ApiKeyCreateResponse) => {
      void queryClient.invalidateQueries({ queryKey: ['domains', 'api-keys'] });
      appToast.success(t('app.apiKeys.saved'));
      onOpenChange(false);
      onCreated(result);
    },
    onError: () => appToast.error(t('app.apiKeys.saveError')),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(modalContentWidthLgClass)}>
        <DialogHeader>
          <DialogTitle>{t('app.apiKeys.new')}</DialogTitle>
        </DialogHeader>
        <AdminForm
          form={form}
          onSubmit={(payload) => mutation.mutate(payload)}
          className="flex flex-col"
        >
          <DialogBody className="space-y-4">
            <DividerProject>{t('app.apiKeys.sections.key')}</DividerProject>
            <FormFieldInput
              control={form.control}
              name="name"
              label={t('app.apiKeys.name')}
              disabled={mutation.isPending}
            />

            <DividerProject>{t('app.apiKeys.sections.access')}</DividerProject>
            <FormField
              control={form.control}
              name="scopes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('app.apiKeys.scopes')}</FormLabel>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {scopes.map((scope) => {
                      const checked = field.value.includes(scope);
                      return (
                        <label key={scope} className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={mutation.isPending}
                            onChange={() =>
                              field.onChange(
                                checked
                                  ? field.value.filter((item) => item !== scope)
                                  : [...field.value, scope],
                              )
                            }
                          />
                          {t(
                            `app.apiKeys.scope${scope
                              .split(':')
                              .map((part) => part[0]!.toUpperCase() + part.slice(1))
                              .join('')}`,
                          )}
                        </label>
                      );
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="expiresAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('app.apiKeys.expiresAt')}</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      disabled={mutation.isPending}
                      value={field.value ?? ''}
                      onChange={(event) => field.onChange(event.target.value || null)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </DialogBody>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={mutation.isPending}
              onClick={() => onOpenChange(false)}
            >
              {t('app.common.actions.cancel')}
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              <KeyRound className="mr-2 h-4 w-4" />
              {t('app.common.actions.create')}
            </Button>
          </DialogFooter>
        </AdminForm>
      </DialogContent>
    </Dialog>
  );
}
