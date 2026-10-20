import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import invoiceService, { calculateInvoiceTotals } from '@/api/services/domains/invoiceService';
import { AdminForm } from '@/components/admin/form';
import { AdminPage } from '@/components/admin/page';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { appToast } from '@/lib/toast';
import { useRouter } from '@/router/hooks';

import type { InvoiceInput } from '#/domain';

import { createInvoiceSchema, type InvoiceFormValues } from '../schema';

const emptyValues: InvoiceFormValues = {
  number: '',
  label: '',
  issueDate: '',
  dueDate: '',
  customer: '',
  customerEmail: '',
  billing: '',
  currency: 'BRL',
  paymentMethod: '',
  notes: '',
  items: [{ description: '', quantity: 1, unitPrice: 0 }],
  taxRateBps: 0,
  discountRateBps: 0,
  shippingAmount: 0,
};

const money = (minor: number, currency: string, locale: string) =>
  new Intl.NumberFormat(locale, { style: 'currency', currency }).format(minor / 100);

export default function InvoiceEditorPage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'pt_BR' ? 'pt-BR' : 'en-US';
  const { id: invoiceId } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(createInvoiceSchema((key) => t(key))),
    defaultValues: emptyValues,
  });
  const items = useFieldArray({ control: form.control, name: 'items' });
  const values = useWatch({ control: form.control });
  const invoiceQuery = useQuery({
    queryKey: ['domains', 'invoices', invoiceId],
    queryFn: () => invoiceService.getInvoice(invoiceId!),
    enabled: Boolean(invoiceId),
  });

  useEffect(() => {
    if (!invoiceQuery.data) return;
    const invoice = invoiceQuery.data;
    form.reset({
      number: invoice.number,
      label: invoice.label,
      issueDate: invoice.issueDate,
      dueDate: invoice.dueDate,
      customer: invoice.customer,
      customerEmail: invoice.customerEmail,
      billing: invoice.billing,
      currency: invoice.currency,
      paymentMethod: invoice.paymentMethod,
      notes: invoice.notes ?? '',
      items: invoice.items.map(({ description, quantity, unitPrice }) => ({
        description,
        quantity,
        unitPrice,
      })),
      taxRateBps: invoice.taxRateBps,
      discountRateBps: invoice.discountRateBps,
      shippingAmount: invoice.shippingAmount,
    });
  }, [form, invoiceQuery.data]);

  const inputForTotals = {
    items: (values.items ?? []).map((item) => ({
      description: item?.description ?? '',
      quantity: Number(item?.quantity) || 0,
      unitPrice: Number(item?.unitPrice) || 0,
    })),
    taxRateBps: Number(values.taxRateBps) || 0,
    discountRateBps: Number(values.discountRateBps) || 0,
    shippingAmount: Number(values.shippingAmount) || 0,
  };
  const totals = calculateInvoiceTotals(inputForTotals);
  const currency = values.currency || 'BRL';

  const saveMutation = useMutation({
    mutationFn: (payload: InvoiceInput) =>
      invoiceId
        ? invoiceService.updateInvoice(invoiceId, payload)
        : invoiceService.createInvoice(payload),
    onSuccess: (saved) => {
      void queryClient.invalidateQueries({ queryKey: ['domains', 'invoices'] });
      appToast.success(t('app.invoices.saved'));
      router.push(`/revenue/invoices/${saved.id}`);
    },
    onError: (error) => appToast.error(t('app.invoices.saveError'), error.message),
  });

  if (invoiceId && invoiceQuery.isLoading) {
    return <AdminPage>{t('app.invoices.loading')}</AdminPage>;
  }
  if (invoiceId && invoiceQuery.isError) {
    return (
      <AdminPage>
        <p role="alert" className="text-sm text-destructive">
          {t('app.invoices.loadError')}
        </p>
      </AdminPage>
    );
  }

  const error = (name: keyof InvoiceFormValues) => form.formState.errors[name]?.message;
  const submit = (payload: InvoiceFormValues) => saveMutation.mutate(payload);

  return (
    <AdminPage className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">
          {t(invoiceId ? 'app.invoices.edit' : 'app.invoices.new')}
        </h1>
        <p className="text-sm text-muted-foreground">{t('app.invoices.minorUnitsDescription')}</p>
      </div>
      <AdminForm form={form} onSubmit={submit} className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>{t('app.invoices.invoiceDetails')}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(
              [
                ['number', 'app.invoices.number', 'text'],
                ['label', 'app.invoices.label', 'text'],
                ['issueDate', 'app.invoices.issueDate', 'date'],
                ['dueDate', 'app.invoices.dueDate', 'date'],
                ['customer', 'app.invoices.customer', 'text'],
                ['customerEmail', 'app.invoices.customerEmail', 'email'],
                ['currency', 'app.invoices.currency', 'text'],
                ['paymentMethod', 'app.invoices.paymentMethod', 'text'],
              ] as const
            ).map(([name, label, type]) => (
              <div key={name}>
                <Label htmlFor={`invoice-${name}`}>{t(label)}</Label>
                <Input
                  id={`invoice-${name}`}
                  type={type}
                  disabled={saveMutation.isPending}
                  {...form.register(name)}
                />
                {error(name) ? <p className="text-sm text-destructive">{error(name)}</p> : null}
              </div>
            ))}
            <div className="sm:col-span-2 lg:col-span-3">
              <Label htmlFor="invoice-billing">{t('app.invoices.billing')}</Label>
              <textarea
                id="invoice-billing"
                className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                disabled={saveMutation.isPending}
                {...form.register('billing')}
              />
              {error('billing') ? (
                <p className="text-sm text-destructive">{error('billing')}</p>
              ) : null}
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <Label htmlFor="invoice-notes">{t('app.invoices.notes')}</Label>
              <textarea
                id="invoice-notes"
                className="min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                disabled={saveMutation.isPending}
                {...form.register('notes')}
              />
              {error('notes') ? <p className="text-sm text-destructive">{error('notes')}</p> : null}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>{t('app.invoices.items')}</CardTitle>
            <Button
              type="button"
              variant="outline"
              disabled={saveMutation.isPending}
              onClick={() => items.append({ description: '', quantity: 1, unitPrice: 0 })}
            >
              <Plus className="mr-2 h-4 w-4" />
              {t('app.invoices.addItem')}
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {items.fields.map((field, index) => (
              <div
                key={field.id}
                className="grid items-end gap-3 rounded-md border p-3 md:grid-cols-[1fr_8rem_10rem_auto]"
              >
                <div>
                  <Label htmlFor={`invoice-item-${index}-description`}>
                    {t('app.invoices.itemDescription', { index: index + 1 })}
                  </Label>
                  <Input
                    id={`invoice-item-${index}-description`}
                    disabled={saveMutation.isPending}
                    {...form.register(`items.${index}.description`)}
                  />
                  {form.formState.errors.items?.[index]?.description?.message ? (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.items[index]?.description?.message}
                    </p>
                  ) : null}
                </div>
                <div>
                  <Label htmlFor={`invoice-item-${index}-quantity`}>
                    {t('app.invoices.itemQuantity', { index: index + 1 })}
                  </Label>
                  <Input
                    id={`invoice-item-${index}-quantity`}
                    type="number"
                    min="0"
                    step="any"
                    disabled={saveMutation.isPending}
                    {...form.register(`items.${index}.quantity`, { valueAsNumber: true })}
                  />
                </div>
                <div>
                  <Label htmlFor={`invoice-item-${index}-unit-price`}>
                    {t('app.invoices.itemUnitPrice', { index: index + 1 })}
                  </Label>
                  <Input
                    id={`invoice-item-${index}-unit-price`}
                    type="number"
                    min="0"
                    step="1"
                    disabled={saveMutation.isPending}
                    {...form.register(`items.${index}.unitPrice`, { valueAsNumber: true })}
                  />
                </div>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  aria-label={t('app.invoices.removeItem', { index: index + 1 })}
                  disabled={saveMutation.isPending}
                  onClick={() => items.remove(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {form.formState.errors.items?.root?.message || form.formState.errors.items?.message ? (
              <p className="text-sm text-destructive">
                {form.formState.errors.items.root?.message ?? form.formState.errors.items.message}
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('app.invoices.totals')}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="invoice-tax-rate">{t('app.invoices.taxRate')}</Label>
              <Input
                id="invoice-tax-rate"
                type="number"
                min="0"
                max="10000"
                {...form.register('taxRateBps', { valueAsNumber: true })}
              />
            </div>
            <div>
              <Label htmlFor="invoice-discount-rate">{t('app.invoices.discountRate')}</Label>
              <Input
                id="invoice-discount-rate"
                type="number"
                min="0"
                max="10000"
                {...form.register('discountRateBps', { valueAsNumber: true })}
              />
            </div>
            <div>
              <Label htmlFor="invoice-shipping">{t('app.invoices.shippingMinor')}</Label>
              <Input
                id="invoice-shipping"
                type="number"
                min="0"
                {...form.register('shippingAmount', { valueAsNumber: true })}
              />
            </div>
            <dl className="space-y-1 sm:col-span-3 sm:ml-auto sm:min-w-64">
              <div className="flex justify-between gap-8">
                <dt>{t('app.invoices.subtotal')}</dt>
                <dd data-testid="invoice-subtotal">{money(totals.subtotal, currency, locale)}</dd>
              </div>
              <div className="flex justify-between gap-8">
                <dt>{t('app.invoices.tax')}</dt>
                <dd data-testid="invoice-tax">{money(totals.taxAmount, currency, locale)}</dd>
              </div>
              <div className="flex justify-between gap-8">
                <dt>{t('app.invoices.discount')}</dt>
                <dd data-testid="invoice-discount">
                  -{money(totals.discountAmount, currency, locale)}
                </dd>
              </div>
              <div className="flex justify-between gap-8 font-semibold">
                <dt>{t('app.invoices.total')}</dt>
                <dd data-testid="invoice-total">{money(totals.total, currency, locale)}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={router.back}
            disabled={saveMutation.isPending}
          >
            {t('app.common.actions.cancel')}
          </Button>
          <Button type="submit" disabled={saveMutation.isPending}>
            {t('app.invoices.save')}
          </Button>
        </div>
      </AdminForm>
    </AdminPage>
  );
}
