import { useTranslation } from 'react-i18next';

import {
  Descriptions,
  descriptionsScheFlowBadgeContentStyle,
  descriptionsScheFlowContentStyle,
  descriptionsScheFlowLabelStyle,
  useDescriptionsScheFlowLayout,
} from '@/components/admin/descriptions';
import { DividerProject } from '@/components/divider';
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
import { modalContentWidthLgClass } from '@/lib/overlay-surface';
import { cn } from '@/lib/utils';

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
  const layout = useDescriptionsScheFlowLayout();
  if (!subscription) return null;
  const option = (value: string) => t(`app.common.options.${value}`);
  const money = new Intl.NumberFormat(locale, { style: 'currency', currency: 'BRL' }).format(
    subscription.unitPriceCents / 100,
  );
  const date = (value: string) =>
    new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(value));

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={cn(modalContentWidthLgClass)}>
        <DialogHeader>
          <DialogTitle>{t('app.subscriptions.details')}</DialogTitle>
        </DialogHeader>
        <DialogBody className="space-y-4">
          <DividerProject>{t('app.subscriptions.sections.plan')}</DividerProject>
          <Descriptions
            bordered
            layout={layout}
            size="small"
            column={2}
            labelStyle={descriptionsScheFlowLabelStyle}
            contentStyle={descriptionsScheFlowContentStyle}
          >
            <Descriptions.Item label={t('app.subscriptions.customer')} span={2}>
              {customerName}
            </Descriptions.Item>
            <Descriptions.Item
              label={t('app.subscriptions.plan')}
              contentStyle={descriptionsScheFlowBadgeContentStyle}
            >
              <Badge variant="outline">{option(subscription.plan)}</Badge>
            </Descriptions.Item>
            <Descriptions.Item
              label={t('app.common.fields.status')}
              contentStyle={descriptionsScheFlowBadgeContentStyle}
            >
              <Badge variant={subscription.status === 'past_due' ? 'destructive' : 'secondary'}>
                {option(subscription.status)}
              </Badge>
            </Descriptions.Item>
            <Descriptions.Item label={t('app.subscriptions.interval')} span={2}>
              {option(subscription.interval)}
            </Descriptions.Item>
          </Descriptions>

          <DividerProject>{t('app.subscriptions.sections.billing')}</DividerProject>
          <Descriptions
            bordered
            layout={layout}
            size="small"
            column={2}
            labelStyle={descriptionsScheFlowLabelStyle}
            contentStyle={descriptionsScheFlowContentStyle}
          >
            <Descriptions.Item label={t('app.subscriptions.seats')}>
              {subscription.seats}
            </Descriptions.Item>
            <Descriptions.Item label={t('app.subscriptions.unitPrice')}>{money}</Descriptions.Item>
            <Descriptions.Item label={t('app.subscriptions.periodEnd')}>
              {date(subscription.currentPeriodEnd)}
            </Descriptions.Item>
            <Descriptions.Item label={t('app.subscriptions.trialEndsAt')}>
              {subscription.trialEndsAt ? date(subscription.trialEndsAt) : '—'}
            </Descriptions.Item>
            <Descriptions.Item label={t('app.subscriptions.cancelAtPeriodEnd')} span={2}>
              {subscription.cancelAtPeriodEnd
                ? t('app.common.states.yes')
                : t('app.common.states.no')}
            </Descriptions.Item>
          </Descriptions>
        </DialogBody>
        <DialogFooter>
          <Button type="button" onClick={onClose}>
            {t('common.closeText')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
