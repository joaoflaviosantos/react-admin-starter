import { useTranslation } from 'react-i18next';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Subscription } from '#/domain';

type SubscriptionDetailModalProps = {
  subscription: Subscription | null;
  customerName: string;
  locale: string;
  onClose: () => void;
};

export function SubscriptionDetailModal({
  subscription,
  customerName,
  locale,
  onClose,
}: SubscriptionDetailModalProps) {
  const { t } = useTranslation();
  if (!subscription) return null;
  const option = (value: string) => t(`app.common.options.${value}`);
  const money = new Intl.NumberFormat(locale, { style: 'currency', currency: 'BRL' }).format(
    subscription.unitPriceCents / 100,
  );
  const date = (value: string) =>
    new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(value));

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('app.subscriptions.details')}</DialogTitle>
        </DialogHeader>
        <DialogBody className="space-y-5">
          <div>
            <h3 className="font-semibold">{customerName}</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge variant="outline">{option(subscription.plan)}</Badge>
              <Badge variant={subscription.status === 'past_due' ? 'destructive' : 'secondary'}>
                {option(subscription.status)}
              </Badge>
            </div>
          </div>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              [t('app.subscriptions.interval'), option(subscription.interval)],
              [t('app.subscriptions.seats'), String(subscription.seats)],
              [t('app.subscriptions.unitPrice'), money],
              [t('app.subscriptions.periodEnd'), date(subscription.currentPeriodEnd)],
              [
                t('app.subscriptions.trialEndsAt'),
                subscription.trialEndsAt ? date(subscription.trialEndsAt) : '—',
              ],
              [
                t('app.subscriptions.cancelAtPeriodEnd'),
                subscription.cancelAtPeriodEnd
                  ? t('app.common.states.yes')
                  : t('app.common.states.no'),
              ],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs font-medium uppercase text-muted-foreground">{label}</dt>
                <dd className="mt-1 text-sm font-medium">{value}</dd>
              </div>
            ))}
          </dl>
        </DialogBody>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            {t('app.common.actions.close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
