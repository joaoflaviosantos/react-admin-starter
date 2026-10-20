import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Printer, Send } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import invoiceService from '@/api/services/domains/invoiceService';
import { AdminPage } from '@/components/admin/page';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useHasRequiredPermission } from '@/hooks/permissions/use-has-required-permission';
import { appToast } from '@/lib/toast';
import { useMatchRouteMeta, useRouter } from '@/router/hooks';

const money = (minor: number, currency: string, locale: string) =>
  new Intl.NumberFormat(locale, { style: 'currency', currency }).format(minor / 100);

const sentDate = (value: string, locale: string) =>
  new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(value),
  );

export default function InvoicePreviewPage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'pt_BR' ? 'pt-BR' : 'en-US';
  const { id: invoiceId } = useParams<{ id: string }>();
  const route = useMatchRouteMeta();
  const permissions = useHasRequiredPermission(route?.label);
  const router = useRouter();
  const queryClient = useQueryClient();
  const queryKey = ['domains', 'invoices', invoiceId] as const;
  const invoiceQuery = useQuery({
    queryKey,
    queryFn: () => invoiceService.getInvoice(invoiceId!),
    enabled: Boolean(invoiceId),
  });
  const sendMutation = useMutation({
    mutationFn: () => invoiceService.sendInvoice(invoiceId!),
    onSuccess: (sent) => {
      queryClient.setQueryData(queryKey, sent);
      void queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === 'domains' &&
          query.queryKey[1] === 'invoices' &&
          query.queryKey.length > 3,
      });
      appToast.success(t('app.invoices.sent'));
    },
    onError: (error) => appToast.error(t('app.invoices.sendError'), error.message),
  });

  if (invoiceQuery.isLoading) return <AdminPage>{t('app.invoices.loading')}</AdminPage>;
  if (invoiceQuery.isError || !invoiceQuery.data) {
    return (
      <AdminPage>
        <p role="alert" className="text-sm text-destructive">
          {t('app.invoices.loadError')}
        </p>
      </AdminPage>
    );
  }

  const invoice = invoiceQuery.data;

  return (
    <AdminPage className="space-y-4">
      <div className="invoice-print-hidden flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{t('app.invoices.previewTitle')}</h1>
          <p className="text-sm text-muted-foreground">{t('app.invoices.previewDescription')}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            disabled={!permissions.canUpdate}
            onClick={() => router.push(`/revenue/invoices/${invoice.id}/edit`)}
          >
            <Pencil className="mr-2 h-4 w-4" />
            {t('app.invoices.edit')}
          </Button>
          <Button
            variant="outline"
            aria-label={t('app.invoices.printAria')}
            disabled={!permissions.canExport}
            onClick={() => window.print()}
          >
            <Printer className="mr-2 h-4 w-4" />
            {t('app.invoices.print')}
          </Button>
          <Button
            aria-label={t('app.invoices.sendAria')}
            disabled={
              !permissions.canUpdate || invoice.status !== 'draft' || sendMutation.isPending
            }
            onClick={() => sendMutation.mutate()}
          >
            <Send className="mr-2 h-4 w-4" />
            {t('app.invoices.send')}
          </Button>
        </div>
      </div>

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
                  {t('app.invoices.sentOn', { date: sentDate(invoice.sentAt, locale) })}
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
                      {money(item.unitPrice, invoice.currency, locale)}
                    </td>
                    <td className="py-3 pl-3 text-right">
                      {money(item.lineTotal, invoice.currency, locale)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <dl className="ml-auto w-full max-w-sm space-y-2 text-sm">
            <div className="flex justify-between gap-8">
              <dt>{t('app.invoices.subtotal')}</dt>
              <dd data-testid="preview-subtotal">
                {money(invoice.subtotal, invoice.currency, locale)}
              </dd>
            </div>
            <div className="flex justify-between gap-8">
              <dt>{t('app.invoices.tax')}</dt>
              <dd data-testid="preview-tax">
                {money(invoice.taxAmount, invoice.currency, locale)}
              </dd>
            </div>
            <div className="flex justify-between gap-8">
              <dt>{t('app.invoices.discount')}</dt>
              <dd>-{money(invoice.discountAmount, invoice.currency, locale)}</dd>
            </div>
            <div className="flex justify-between gap-8">
              <dt>{t('app.invoices.shipping')}</dt>
              <dd>{money(invoice.shippingAmount, invoice.currency, locale)}</dd>
            </div>
            <div className="flex justify-between gap-8 border-t pt-2 text-base font-semibold">
              <dt>{t('app.invoices.total')}</dt>
              <dd data-testid="preview-total">{money(invoice.total, invoice.currency, locale)}</dd>
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
    </AdminPage>
  );
}
