import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

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
import type { Customer, Subscription, SubscriptionInput } from '#/domain';

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

type SubscriptionFormDialogProps = {
  open: boolean;
  subscription: Subscription | null;
  customers: Customer[];
  pending: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (value: SubscriptionInput) => void;
};

export function SubscriptionFormDialog({
  open,
  subscription,
  customers,
  pending,
  onOpenChange,
  onSubmit,
}: SubscriptionFormDialogProps) {
  const { t } = useTranslation();
  const schema = useMemo(() => createSubscriptionSchema(t), [t]);
  const form = useForm<SubscriptionFormValues>({
    resolver: zodResolver(schema),
    defaultValues: emptySubscription,
  });

  useEffect(() => {
    form.reset(
      subscription
        ? { ...subscription, trialEndsAt: subscription.trialEndsAt ?? '' }
        : emptySubscription,
    );
  }, [form, open, subscription]);

  const option = (value: string) => ({
    label: t(`app.common.options.${value}`),
    value,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {t(subscription ? 'app.subscriptions.edit' : 'app.subscriptions.new')}
          </DialogTitle>
        </DialogHeader>
        <AdminForm
          form={form}
          onSubmit={(value) => onSubmit({ ...value, trialEndsAt: value.trialEndsAt || null })}
        >
          <DialogBody className="grid max-h-[70vh] grid-cols-1 gap-4 overflow-y-auto sm:grid-cols-2">
            <FormFieldSelect
              control={form.control}
              name="customerId"
              label={t('app.subscriptions.customer')}
              options={customers.map((customer) => ({ label: customer.name, value: customer.id }))}
              disabled={pending || Boolean(subscription)}
            />
            <FormFieldSelect
              control={form.control}
              name="plan"
              label={t('app.subscriptions.plan')}
              options={['starter', 'growth', 'scale'].map(option)}
              disabled={pending}
            />
            <FormFieldSelect
              control={form.control}
              name="status"
              label={t('app.common.fields.status')}
              options={['trialing', 'active', 'past_due'].map(option)}
              disabled={pending || Boolean(subscription)}
            />
            <FormFieldSelect
              control={form.control}
              name="interval"
              label={t('app.subscriptions.interval')}
              options={['monthly', 'yearly'].map(option)}
              disabled={pending}
            />
            <FormFieldInput
              control={form.control}
              name="seats"
              type="number"
              label={t('app.subscriptions.seats')}
              disabled={pending}
            />
            <FormFieldInput
              control={form.control}
              name="unitPriceCents"
              type="number"
              label={t('app.subscriptions.unitPriceMinor')}
              disabled={pending}
            />
            <FormFieldInput
              control={form.control}
              name="trialEndsAt"
              label={t('app.subscriptions.trialEndsAt')}
              disabled={pending}
            />
            <FormFieldInput
              control={form.control}
              name="currentPeriodEnd"
              label={t('app.subscriptions.periodEnd')}
              disabled={pending}
            />
            <FormFieldSwitch
              control={form.control}
              name="cancelAtPeriodEnd"
              label={t('app.subscriptions.cancelAtPeriodEnd')}
              disabled={pending || Boolean(subscription)}
              className="sm:col-span-2"
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
