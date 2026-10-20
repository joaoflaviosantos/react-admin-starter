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

import type { Invoice } from '#/domain';

type InvoiceDetailModalProps = {
  invoice: Invoice | null;
  locale: string;
  onClose: () => void;
};

export function InvoiceDetailModal({ invoice, locale, onClose }: InvoiceDetailModalProps) {
  const { t } = useTranslation();
  const layout = useDescriptionsScheFlowLayout();
  if (!invoice) return null;
  const option = (value: string) => t(`app.common.options.${value}`);
  const money = (minor: number, currency: string) =>
    new Intl.NumberFormat(locale, { style: 'currency', currency }).format(minor / 100);
  const date = (value: string) =>
    new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(`${value}T12:00:00Z`));

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={cn(modalContentWidthLgClass)}>
        <DialogHeader>
          <DialogTitle>{t('app.invoices.invoiceDetails')}</DialogTitle>
        </DialogHeader>
        <DialogBody className="space-y-4">
          <DividerProject>{t('app.invoices.invoiceDetails')}</DividerProject>
          <Descriptions
            bordered
            layout={layout}
            size="small"
            column={2}
            labelStyle={descriptionsScheFlowLabelStyle}
            contentStyle={descriptionsScheFlowContentStyle}
          >
            <Descriptions.Item label={t('app.invoices.number')}>{invoice.number}</Descriptions.Item>
            <Descriptions.Item label={t('app.invoices.label')}>{invoice.label}</Descriptions.Item>
            <Descriptions.Item
              label={t('app.common.fields.status')}
              contentStyle={descriptionsScheFlowBadgeContentStyle}
            >
              <Badge variant={invoice.status === 'sent' ? 'default' : 'secondary'}>
                {option(invoice.status)}
              </Badge>
            </Descriptions.Item>
            <Descriptions.Item
              label={t('app.invoices.total')}
              contentStyle={descriptionsScheFlowBadgeContentStyle}
            >
              <Badge variant="outline">{money(invoice.total, invoice.currency)}</Badge>
            </Descriptions.Item>
            <Descriptions.Item label={t('app.invoices.customer')}>
              {invoice.customer}
            </Descriptions.Item>
            <Descriptions.Item label={t('app.common.fields.email')}>
              {invoice.customerEmail}
            </Descriptions.Item>
            <Descriptions.Item label={t('app.invoices.issueDate')}>
              {date(invoice.issueDate)}
            </Descriptions.Item>
            <Descriptions.Item label={t('app.invoices.dueDate')}>
              {date(invoice.dueDate)}
            </Descriptions.Item>
            <Descriptions.Item label={t('app.invoices.paymentMethod')}>
              {invoice.paymentMethod}
            </Descriptions.Item>
            <Descriptions.Item label={t('app.invoices.currency')}>
              {invoice.currency}
            </Descriptions.Item>
            <Descriptions.Item label={t('app.invoices.billing')} span={2}>
              <span className="whitespace-pre-line">{invoice.billing}</span>
            </Descriptions.Item>
            {invoice.notes ? (
              <Descriptions.Item label={t('app.invoices.notes')} span={2}>
                <span className="whitespace-pre-line">{invoice.notes}</span>
              </Descriptions.Item>
            ) : null}
          </Descriptions>

          <DividerProject>{t('app.invoices.items')}</DividerProject>
          <Descriptions
            bordered
            layout={layout}
            size="small"
            column={2}
            labelStyle={descriptionsScheFlowLabelStyle}
            contentStyle={descriptionsScheFlowContentStyle}
          >
            {invoice.items.map((item) => (
              <Descriptions.Item key={item.id} label={item.description} span={2}>
                <span className="flex justify-between gap-4">
                  <span>
                    {item.quantity} × {money(item.unitPrice, invoice.currency)}
                  </span>
                  <span className="font-medium">{money(item.lineTotal, invoice.currency)}</span>
                </span>
              </Descriptions.Item>
            ))}
          </Descriptions>

          <DividerProject>{t('app.invoices.totals')}</DividerProject>
          <Descriptions
            bordered
            layout={layout}
            size="small"
            column={2}
            labelStyle={descriptionsScheFlowLabelStyle}
            contentStyle={descriptionsScheFlowContentStyle}
          >
            <Descriptions.Item label={t('app.invoices.subtotal')}>
              {money(invoice.subtotal, invoice.currency)}
            </Descriptions.Item>
            <Descriptions.Item label={t('app.invoices.tax')}>
              {money(invoice.taxAmount, invoice.currency)}
            </Descriptions.Item>
            <Descriptions.Item label={t('app.invoices.discount')}>
              {money(invoice.discountAmount, invoice.currency)}
            </Descriptions.Item>
            <Descriptions.Item label={t('app.invoices.shippingMinor')}>
              {money(invoice.shippingAmount, invoice.currency)}
            </Descriptions.Item>
            <Descriptions.Item label={t('app.invoices.total')} span={2}>
              <span className="font-semibold">{money(invoice.total, invoice.currency)}</span>
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
