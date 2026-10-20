import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import customerService from '@/api/services/domains/customerService';
import { AdminForm } from '@/components/admin/form';
import { FormFieldInput, FormFieldSelect } from '@/components/admin/form/form-field';
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
import { modalContentWidthLgClass } from '@/lib/overlay-surface';
import { appToast } from '@/lib/toast';
import { cn } from '@/lib/utils';

import type { CustomerInput } from '#/domain';
import { createCustomerSchema, type CustomerFormValues } from './schema';

const emptyCustomer: CustomerFormValues = {
  name: '',
  contactName: '',
  email: '',
  industry: '',
  source: 'organic',
  status: 'trialing',
  plan: 'starter',
  mrrCents: 0,
  healthScore: 75,
  seatsUsed: 1,
  seatsLimit: 5,
};

type CustomerCreateModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CustomerCreateModal({ open, onOpenChange }: CustomerCreateModalProps) {
  const { t } = useTranslation();
  const options = (values: string[]) =>
    values.map((value) => ({ label: t(`app.common.options.${value}`), value }));
  const queryClient = useQueryClient();
  const schema = useMemo(() => createCustomerSchema(t), [t]);
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(schema),
    defaultValues: emptyCustomer,
  });

  useEffect(() => {
    if (open) form.reset(emptyCustomer);
  }, [form, open]);

  const mutation = useMutation({
    mutationFn: (payload: CustomerInput) => customerService.createCustomer(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['domains', 'customers'] });
      appToast.success(t('app.customers.saved'));
      onOpenChange(false);
    },
    onError: () => appToast.error(t('app.customers.saveError')),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn('max-h-[90vh]', modalContentWidthLgClass)}>
        <DialogHeader>
          <DialogTitle>{t('app.customers.new')}</DialogTitle>
        </DialogHeader>
        <AdminForm
          form={form}
          onSubmit={(payload) => mutation.mutate(payload)}
          className="flex flex-col"
        >
          <DialogBody className="max-h-[65vh] space-y-4 overflow-y-auto">
            <DividerProject>{t('app.customers.sections.profile')}</DividerProject>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormFieldInput
                control={form.control}
                name="name"
                label={t('app.common.fields.name')}
                disabled={mutation.isPending}
              />
              <FormFieldInput
                control={form.control}
                name="contactName"
                label={t('app.customers.contact')}
                disabled={mutation.isPending}
              />
              <FormFieldInput
                control={form.control}
                name="email"
                type="email"
                label={t('app.common.fields.email')}
                disabled={mutation.isPending}
              />
              <FormFieldInput
                control={form.control}
                name="industry"
                label={t('app.customers.industry')}
                disabled={mutation.isPending}
              />
            </div>
            <DividerProject>{t('app.customers.sections.commercial')}</DividerProject>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormFieldSelect
                control={form.control}
                name="source"
                label={t('app.customers.source')}
                options={options(['organic', 'paid_search', 'referral', 'partner', 'outbound'])}
                disabled={mutation.isPending}
              />
              <FormFieldSelect
                control={form.control}
                name="status"
                label={t('app.common.fields.status')}
                options={options(['trialing', 'active', 'past_due', 'churned'])}
                disabled={mutation.isPending}
              />
              <FormFieldSelect
                control={form.control}
                name="plan"
                label={t('app.customers.plan')}
                options={options(['starter', 'growth', 'scale'])}
                disabled={mutation.isPending}
              />
              <FormFieldInput
                control={form.control}
                name="mrrCents"
                type="number"
                label={t('app.customers.mrrMinor')}
                disabled={mutation.isPending}
              />
              <FormFieldInput
                control={form.control}
                name="healthScore"
                type="number"
                label={t('app.customers.health')}
                disabled={mutation.isPending}
              />
              <FormFieldInput
                control={form.control}
                name="seatsUsed"
                type="number"
                label={t('app.customers.seatsUsed')}
                disabled={mutation.isPending}
              />
              <FormFieldInput
                control={form.control}
                name="seatsLimit"
                type="number"
                label={t('app.customers.seatsLimit')}
                disabled={mutation.isPending}
              />
            </div>
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
              {t('app.common.actions.save')}
            </Button>
          </DialogFooter>
        </AdminForm>
      </DialogContent>
    </Dialog>
  );
}
