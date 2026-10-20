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

import type { Invoice } from '#/domain';

type InvoiceDetailModalProps = {
  invoice: Invoice | null;
  locale: string;
  onClose: () => void;
};

export function InvoiceDetailModal({ invoice, locale, onClose }: InvoiceDetailModalProps) {
  const { t } = useTranslation();
  if (!invoice) return null;
  const option = (value: string) => t(`app.common.options.${value}`);
  const money = (minor: number, currency: string) =>
    new Intl.NumberFormat(locale, { style: 'currency', currency }).format(minor / 100);
  const date = (value: string) =>
    new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(`${value}T12:00:00Z`));

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('app.invoices.invoiceDetails')}</DialogTitle>
        </DialogHeader>
        <DialogBody className="space-y-5">
          <div>
            <h3 className="font-semibold">{invoice.number}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{invoice.label}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge variant={invoice.status === 'sent' ? 'default' : 'secondary'}>
                {option(invoice.status)}
              </Badge>
              <Badge variant="outline">{money(invoice.total, invoice.currency)}</Badge>
            </div>
          </div>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              [t('app.invoices.customer'), invoice.customer],
              [t('app.common.fields.email'), invoice.customerEmail],
              [t('app.invoices.issueDate'), date(invoice.issueDate)],
              [t('app.invoices.dueDate'), date(invoice.dueDate)],
              [t('app.invoices.paymentMethod'), invoice.paymentMethod],
              [t('app.invoices.currency'), invoice.currency],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs font-medium uppercase text-muted-foreground">{label}</dt>
                <dd className="mt-1 text-sm font-medium">{value}</dd>
              </div>
            ))}
          </dl>
          {invoice.notes ? (
            <div>
              <h3 className="text-xs font-medium uppercase text-muted-foreground">
                {t('app.invoices.notes')}
              </h3>
              <p className="mt-1 whitespace-pre-line text-sm">{invoice.notes}</p>
            </div>
          ) : null}
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
