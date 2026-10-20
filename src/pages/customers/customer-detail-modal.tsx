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

import type { Customer } from '#/domain';

type CustomerDetailModalProps = {
  customer: Customer | null;
  locale: string;
  onClose: () => void;
};

export function CustomerDetailModal({ customer, locale, onClose }: CustomerDetailModalProps) {
  const { t } = useTranslation();
  const layout = useDescriptionsScheFlowLayout();
  if (!customer) return null;
  const option = (value: string) => t(`app.common.options.${value}`);
  const money = new Intl.NumberFormat(locale, { style: 'currency', currency: 'BRL' }).format(
    customer.mrrCents / 100,
  );

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={cn(modalContentWidthLgClass)}>
        <DialogHeader>
          <DialogTitle>{t('app.customers.details')}</DialogTitle>
        </DialogHeader>
        <DialogBody className="space-y-4">
          <DividerProject>{t('app.customers.sections.profile')}</DividerProject>
          <Descriptions
            bordered
            layout={layout}
            size="small"
            column={2}
            labelStyle={descriptionsScheFlowLabelStyle}
            contentStyle={descriptionsScheFlowContentStyle}
          >
            <Descriptions.Item label={t('app.common.fields.name')} span={2}>
              {customer.name}
            </Descriptions.Item>
            <Descriptions.Item label={t('app.customers.contact')}>
              {customer.contactName}
            </Descriptions.Item>
            <Descriptions.Item label={t('app.common.fields.email')}>
              {customer.email}
            </Descriptions.Item>
            <Descriptions.Item label={t('app.customers.industry')} span={2}>
              {customer.industry}
            </Descriptions.Item>
          </Descriptions>

          <DividerProject>{t('app.customers.sections.commercial')}</DividerProject>
          <Descriptions
            bordered
            layout={layout}
            size="small"
            column={2}
            labelStyle={descriptionsScheFlowLabelStyle}
            contentStyle={descriptionsScheFlowContentStyle}
          >
            <Descriptions.Item
              label={t('app.common.fields.status')}
              contentStyle={descriptionsScheFlowBadgeContentStyle}
            >
              <Badge variant={customer.status === 'past_due' ? 'destructive' : 'secondary'}>
                {option(customer.status)}
              </Badge>
            </Descriptions.Item>
            <Descriptions.Item
              label={t('app.customers.plan')}
              contentStyle={descriptionsScheFlowBadgeContentStyle}
            >
              <Badge variant="outline">{option(customer.plan)}</Badge>
            </Descriptions.Item>
            <Descriptions.Item label={t('app.customers.source')}>
              {option(customer.source)}
            </Descriptions.Item>
            <Descriptions.Item label={t('app.customers.mrr')}>{money}</Descriptions.Item>
            <Descriptions.Item label={t('app.customers.seats')}>
              {customer.seatsUsed}/{customer.seatsLimit}
            </Descriptions.Item>
            <Descriptions.Item label={t('app.customers.health')}>
              {customer.healthScore}/100
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
