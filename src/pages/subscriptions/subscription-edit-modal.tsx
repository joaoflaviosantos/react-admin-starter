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

import type { Customer, Subscription, SubscriptionInput } from '#/domain';
import { createSubscriptionSchema, type SubscriptionFormValues } from './schema';

const emptySubscription: SubscriptionFormValues = {
  customerId: '',
  plan: 'starter',
  status: 'trialing',
  interval: 'monthly',
  seats: 5,
  unitPriceCents: 12900,
  trialEndsAt: '',
  currentPeriodEnd: '2026-10-31T23:59',
  cancelAtPeriodEnd: false,
};

const toDateTimeLocal = (value: string | null) => (value ? value.slice(0, 16) : '');
const toIsoDateTime = (value: string) => new Date(`${value.slice(0, 16)}:00Z`).toISOString();

type SubscriptionEditModalProps = {
  subscription: Subscription | null;
  customers: Customer[];
  show: boolean;
  onClose: () => void;
};

export function SubscriptionEditModal({
  subscription,
  customers,
  show,
  onClose,
}: SubscriptionEditModalProps) {
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
    if (show) {
      form.reset(
        subscription
          ? {
              ...subscription,
              trialEndsAt: toDateTimeLocal(subscription.trialEndsAt),
              currentPeriodEnd: toDateTimeLocal(subscription.currentPeriodEnd),
            }
          : emptySubscription,
      );
    }
  }, [form, show, subscription]);

  const mutation = useMutation({
    mutationFn: (payload: SubscriptionInput) =>
      subscriptionService.updateSubscription(subscription?.id ?? '', payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['domains', 'subscriptions'] });
      appToast.success(t('app.subscriptions.saved'));
      onClose();
    },
    onError: () => appToast.error(t('app.subscriptions.saveError')),
  });

  return (
    <Dialog open={show} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={cn('max-h-[90vh]', modalContentWidthLgClass)}>
        <DialogHeader>
          <DialogTitle>{t('app.subscriptions.edit')}</DialogTitle>
        </DialogHeader>
        <AdminForm
          form={form}
          onSubmit={(value) =>
            mutation.mutate({
              ...value,
              trialEndsAt: value.trialEndsAt ? toIsoDateTime(value.trialEndsAt) : null,
              currentPeriodEnd: toIsoDateTime(value.currentPeriodEnd),
            })
          }
          className="flex flex-col"
        >
          <DialogBody className="max-h-[65vh] space-y-4 overflow-y-auto">
            <DividerProject>{t('app.subscriptions.sections.plan')}</DividerProject>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormFieldSelect
                control={form.control}
                name="customerId"
                label={t('app.subscriptions.customer')}
                options={customers.map((customer) => ({
                  label: customer.name,
                  value: customer.id,
                }))}
                disabled
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
                disabled
              />
              <FormFieldSelect
                control={form.control}
                name="interval"
                label={t('app.subscriptions.interval')}
                options={['monthly', 'yearly'].map(option)}
                disabled={mutation.isPending}
              />
            </div>
            <DividerProject>{t('app.subscriptions.sections.billing')}</DividerProject>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                type="datetime-local"
                label={t('app.subscriptions.trialEndsAt')}
                disabled={mutation.isPending}
              />
              <FormFieldInput
                control={form.control}
                name="currentPeriodEnd"
                type="datetime-local"
                label={t('app.subscriptions.periodEnd')}
                disabled={mutation.isPending}
              />
              <FormFieldSwitch
                control={form.control}
                name="cancelAtPeriodEnd"
                label={t('app.subscriptions.cancelAtPeriodEnd')}
                disabled
                className="sm:col-span-2"
              />
            </div>
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="outline" disabled={mutation.isPending} onClick={onClose}>
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
