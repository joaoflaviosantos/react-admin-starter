import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import subscriptionService from '@/api/services/domains/subscriptionService';
import { AdminForm } from '@/components/admin/form';
import {
  FormFieldInput,
  FormFieldSelect,
  FormFieldSwitch,
} from '@/components/admin/form/form-field';
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

import type { Customer, SubscriptionInput } from '#/domain';
import { createSubscriptionSchema, type SubscriptionFormValues } from './schema';

const emptySubscription: SubscriptionFormValues = {
  customerId: '',
  plan: 'starter',
  status: 'trialing',
  interval: 'monthly',
  seats: 5,
  unitPriceCents: 12900,
  trialEndsAt: null,
  currentPeriodEnd: '2026-10-31T23:59:59.000Z',
  cancelAtPeriodEnd: false,
};

type SubscriptionCreateModalProps = {
  open: boolean;
  customers: Customer[];
  onOpenChange: (open: boolean) => void;
};

export function SubscriptionCreateModal({
  open,
  customers,
  onOpenChange,
}: SubscriptionCreateModalProps) {
  const { t } = useTranslation();
  const option = (value: string) => ({
    label: t(`app.common.options.${value}`),
    value,
  });
  const queryClient = useQueryClient();
  const schema = useMemo(() => createSubscriptionSchema(t), [t]);
  const form = useForm<SubscriptionFormValues>({
    resolver: zodResolver(schema),
    defaultValues: emptySubscription,
  });

  useEffect(() => {
    if (open) {
      form.reset({
        ...emptySubscription,
        customerId: customers[0]?.id ?? '',
      });
    }
  }, [customers, form, open]);

  const mutation = useMutation({
    mutationFn: (payload: SubscriptionInput) => subscriptionService.createSubscription(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['domains', 'subscriptions'] });
      appToast.success(t('app.subscriptions.saved'));
      onOpenChange(false);
    },
    onError: () => appToast.error(t('app.subscriptions.saveError')),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn('max-h-[90vh]', modalContentWidthLgClass)}>
        <DialogHeader>
          <DialogTitle>{t('app.subscriptions.new')}</DialogTitle>
        </DialogHeader>
        <AdminForm
          form={form}
          onSubmit={(value) =>
            mutation.mutate({ ...value, trialEndsAt: value.trialEndsAt || null })
          }
        >
          <DialogBody className="grid max-h-[65vh] grid-cols-1 gap-4 overflow-y-auto sm:grid-cols-2">
            <FormFieldSelect
              control={form.control}
              name="customerId"
              label={t('app.subscriptions.customer')}
              options={customers.map((customer) => ({
                label: customer.name,
                value: customer.id,
              }))}
              disabled={mutation.isPending}
            />
            <FormFieldSelect
              control={form.control}
              name="plan"
              label={t('app.subscriptions.plan')}
              options={['starter', 'growth', 'scale'].map(option)}
              disabled={mutation.isPending}
            />
            <FormFieldSelect
              control={form.control}
              name="status"
              label={t('app.common.fields.status')}
              options={['trialing', 'active', 'past_due'].map(option)}
              disabled={mutation.isPending}
            />
            <FormFieldSelect
              control={form.control}
              name="interval"
              label={t('app.subscriptions.interval')}
              options={['monthly', 'yearly'].map(option)}
              disabled={mutation.isPending}
            />
            <FormFieldInput
              control={form.control}
              name="seats"
              type="number"
              label={t('app.subscriptions.seats')}
              disabled={mutation.isPending}
            />
            <FormFieldInput
              control={form.control}
              name="unitPriceCents"
              type="number"
              label={t('app.subscriptions.unitPriceMinor')}
              disabled={mutation.isPending}
            />
            <FormFieldInput
              control={form.control}
              name="trialEndsAt"
              label={t('app.subscriptions.trialEndsAt')}
              disabled={mutation.isPending}
            />
            <FormFieldInput
              control={form.control}
              name="currentPeriodEnd"
              label={t('app.subscriptions.periodEnd')}
              disabled={mutation.isPending}
            />
            <FormFieldSwitch
              control={form.control}
              name="cancelAtPeriodEnd"
              label={t('app.subscriptions.cancelAtPeriodEnd')}
              disabled={mutation.isPending}
              className="sm:col-span-2"
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
              {t('app.common.actions.save')}
            </Button>
          </DialogFooter>
        </AdminForm>
      </DialogContent>
    </Dialog>
  );
}
