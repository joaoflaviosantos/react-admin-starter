import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { AdminForm } from '@/components/admin/form';
import { FormFieldInput, FormFieldSelect } from '@/components/admin/form/form-field';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Customer, CustomerInput } from '#/domain';

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

type CustomerFormDialogProps = {
  open: boolean;
  customer: Customer | null;
  pending: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (value: CustomerInput) => void;
};

export function CustomerFormDialog({
  open,
  customer,
  pending,
  onOpenChange,
  onSubmit,
}: CustomerFormDialogProps) {
  const { t } = useTranslation();
  const schema = useMemo(() => createCustomerSchema(t), [t]);
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(schema),
    defaultValues: emptyCustomer,
  });

  useEffect(() => {
    form.reset(customer ? { ...customer } : emptyCustomer);
  }, [customer, form, open]);

  const options = (values: string[]) =>
    values.map((value) => ({ label: t(`app.common.options.${value}`), value }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t(customer ? 'app.customers.edit' : 'app.customers.new')}</DialogTitle>
        </DialogHeader>
        <AdminForm form={form} onSubmit={onSubmit}>
          <DialogBody className="grid max-h-[70vh] grid-cols-1 gap-4 overflow-y-auto sm:grid-cols-2">
            <FormFieldInput
              control={form.control}
              name="name"
              label={t('app.common.fields.name')}
            />
            <FormFieldInput
              control={form.control}
              name="contactName"
              label={t('app.customers.contact')}
            />
            <FormFieldInput
              control={form.control}
              name="email"
              type="email"
              label={t('app.common.fields.email')}
            />
            <FormFieldInput
              control={form.control}
              name="industry"
              label={t('app.customers.industry')}
            />
            <FormFieldSelect
              control={form.control}
              name="source"
              label={t('app.customers.source')}
              options={options(['organic', 'paid_search', 'referral', 'partner', 'outbound'])}
            />
            <FormFieldSelect
              control={form.control}
              name="status"
              label={t('app.common.fields.status')}
              options={options(['trialing', 'active', 'past_due', 'churned'])}
            />
            <FormFieldSelect
              control={form.control}
              name="plan"
              label={t('app.customers.plan')}
              options={options(['starter', 'growth', 'scale'])}
            />
            <FormFieldInput
              control={form.control}
              name="mrrCents"
              type="number"
              label={t('app.customers.mrrMinor')}
            />
            <FormFieldInput
              control={form.control}
              name="healthScore"
              type="number"
              label={t('app.customers.health')}
            />
            <FormFieldInput
              control={form.control}
              name="seatsUsed"
              type="number"
              label={t('app.customers.seatsUsed')}
            />
            <FormFieldInput
              control={form.control}
              name="seatsLimit"
              type="number"
              label={t('app.customers.seatsLimit')}
            />
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('app.common.actions.cancel')}
            </Button>
            <Button type="submit" disabled={pending}>
              {t('app.common.actions.save')}
            </Button>
          </DialogFooter>
        </AdminForm>
      </DialogContent>
    </Dialog>
  );
}
