import { useTranslation } from 'react-i18next';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

import type { Invoice } from '#/domain';

type InvoiceDocumentProps = {
  invoice: Invoice;
  locale: string;
};

export function InvoiceDocument({ invoice, locale }: InvoiceDocumentProps) {
  const { t } = useTranslation();
  const money = (minor: number, currency: string) =>
    new Intl.NumberFormat(locale, { style: 'currency', currency }).format(minor / 100);
  const sentDate = (value: string) =>
    new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(
      new Date(value),
    );

  return (
    <Card className="invoice-print-sheet" data-testid="invoice-print-sheet">
      <CardContent className="space-y-8 p-8 sm:p-12">
        <header className="flex flex-wrap items-start justify-between gap-6 border-b pb-6">
          <div>
            <p className="text-sm uppercase tracking-wide text-muted-foreground">
              {t('app.invoices.invoice')}
            </p>
            <h2 className="text-3xl font-bold">{invoice.number}</h2>
            <p className="mt-1 text-lg">{invoice.label}</p>
          </div>
          <div className="text-right">
            <Badge variant={invoice.status === 'sent' ? 'default' : 'secondary'}>
              {t(`app.common.options.${invoice.status}`)}
            </Badge>
            {invoice.sentAt ? (
              <p className="mt-2 text-sm text-muted-foreground">
                {t('app.invoices.sentOn', { date: sentDate(invoice.sentAt) })}
              </p>
            ) : null}
          </div>
        </header>

        <section className="grid gap-6 text-sm sm:grid-cols-3">
          <div>
            <h3 className="font-semibold">{t('app.invoices.billTo')}</h3>
            <p className="mt-2 font-medium">{invoice.customer}</p>
            <p>{invoice.customerEmail}</p>
            <p className="whitespace-pre-line text-muted-foreground">{invoice.billing}</p>
          </div>
          <div>
            <h3 className="font-semibold">{t('app.invoices.dates')}</h3>
            <p className="mt-2">{t('app.invoices.issued', { date: invoice.issueDate })}</p>
            <p>{t('app.invoices.due', { date: invoice.dueDate })}</p>
          </div>
          <div>
            <h3 className="font-semibold">{t('app.invoices.payment')}</h3>
            <p className="mt-2">{invoice.paymentMethod}</p>
            <p>{invoice.currency}</p>
          </div>
        </section>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[36rem] text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="py-3 pr-3">{t('app.invoices.descriptionField')}</th>
                <th className="px-3 py-3 text-right">{t('app.invoices.quantity')}</th>
                <th className="px-3 py-3 text-right">{t('app.invoices.unitPrice')}</th>
                <th className="py-3 pl-3 text-right">{t('app.invoices.amount')}</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="py-3 pr-3">{item.description}</td>
                  <td className="px-3 py-3 text-right">{item.quantity}</td>
                  <td className="px-3 py-3 text-right">
                    {money(item.unitPrice, invoice.currency)}
                  </td>
                  <td className="py-3 pl-3 text-right">
                    {money(item.lineTotal, invoice.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <dl className="ml-auto w-full max-w-sm space-y-2 text-sm">
          <div className="flex justify-between gap-8">
            <dt>{t('app.invoices.subtotal')}</dt>
            <dd data-testid="preview-subtotal">{money(invoice.subtotal, invoice.currency)}</dd>
          </div>
          <div className="flex justify-between gap-8">
            <dt>{t('app.invoices.tax')}</dt>
            <dd data-testid="preview-tax">{money(invoice.taxAmount, invoice.currency)}</dd>
          </div>
          <div className="flex justify-between gap-8">
            <dt>{t('app.invoices.discount')}</dt>
            <dd>-{money(invoice.discountAmount, invoice.currency)}</dd>
          </div>
          <div className="flex justify-between gap-8">
            <dt>{t('app.invoices.shipping')}</dt>
            <dd>{money(invoice.shippingAmount, invoice.currency)}</dd>
          </div>
          <div className="flex justify-between gap-8 border-t pt-2 text-base font-semibold">
            <dt>{t('app.invoices.total')}</dt>
            <dd data-testid="preview-total">{money(invoice.total, invoice.currency)}</dd>
          </div>
        </dl>

        {invoice.notes ? (
          <section className="border-t pt-6 text-sm">
            <h3 className="font-semibold">{t('app.invoices.notes')}</h3>
            <p className="mt-2 whitespace-pre-line text-muted-foreground">{invoice.notes}</p>
          </section>
        ) : null}
      </CardContent>
    </Card>
  );
}
