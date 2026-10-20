import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import invoiceService, { calculateInvoiceTotals } from '@/api/services/domains/invoiceService';
import { AdminForm } from '@/components/admin/form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { appToast } from '@/lib/toast';

import { createInvoiceSchema, type InvoiceFormValues } from './schema';

import type { InvoiceInput } from '#/domain';

const emptyInvoiceValues: InvoiceFormValues = {
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

type InvoiceCreateModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function InvoiceCreateModal({ open, onOpenChange }: InvoiceCreateModalProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'pt_BR' ? 'pt-BR' : 'en-US';
  const queryClient = useQueryClient();
  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(createInvoiceSchema((key) => t(key))),
    defaultValues: emptyInvoiceValues,
  });
  const items = useFieldArray({ control: form.control, name: 'items' });
  const values = useWatch({ control: form.control });

  useEffect(() => {
    if (open) form.reset(emptyInvoiceValues);
  }, [form, open]);

  const mutation = useMutation({
    mutationFn: (payload: InvoiceInput) => invoiceService.createInvoice(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['domains', 'invoices'] });
      appToast.success(t('app.invoices.saved'));
      onOpenChange(false);
    },
    onError: (error) => appToast.error(t('app.invoices.saveError'), error.message),
  });

  const pending = mutation.isPending;
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
  const money = (minor: number) =>
    new Intl.NumberFormat(locale, { style: 'currency', currency }).format(minor / 100);
  const error = (name: keyof InvoiceFormValues) => form.formState.errors[name]?.message;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>{t('app.invoices.new')}</DialogTitle>
        </DialogHeader>
        <AdminForm form={form} onSubmit={(payload) => mutation.mutate(payload)}>
          <DialogBody className="max-h-[72vh] space-y-4 overflow-y-auto">
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
                      disabled={pending}
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
                    disabled={pending}
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
                    disabled={pending}
                    {...form.register('notes')}
                  />
                  {error('notes') ? (
                    <p className="text-sm text-destructive">{error('notes')}</p>
                  ) : null}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle>{t('app.invoices.items')}</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  disabled={pending}
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
                        disabled={pending}
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
                        disabled={pending}
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
                        disabled={pending}
                        {...form.register(`items.${index}.unitPrice`, { valueAsNumber: true })}
                      />
                    </div>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      aria-label={t('app.invoices.removeItem', { index: index + 1 })}
                      disabled={pending}
                      onClick={() => items.remove(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {form.formState.errors.items?.root?.message ||
                form.formState.errors.items?.message ? (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.items.root?.message ??
                      form.formState.errors.items.message}
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
                    disabled={pending}
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
                    disabled={pending}
                    {...form.register('discountRateBps', { valueAsNumber: true })}
                  />
                </div>
                <div>
                  <Label htmlFor="invoice-shipping">{t('app.invoices.shippingMinor')}</Label>
                  <Input
                    id="invoice-shipping"
                    type="number"
                    min="0"
                    disabled={pending}
                    {...form.register('shippingAmount', { valueAsNumber: true })}
                  />
                </div>
                <dl className="space-y-1 sm:col-span-3 sm:ml-auto sm:min-w-64">
                  <div className="flex justify-between gap-8">
                    <dt>{t('app.invoices.subtotal')}</dt>
                    <dd data-testid="invoice-subtotal">{money(totals.subtotal)}</dd>
                  </div>
                  <div className="flex justify-between gap-8">
                    <dt>{t('app.invoices.tax')}</dt>
                    <dd data-testid="invoice-tax">{money(totals.taxAmount)}</dd>
                  </div>
                  <div className="flex justify-between gap-8">
                    <dt>{t('app.invoices.discount')}</dt>
                    <dd data-testid="invoice-discount">-{money(totals.discountAmount)}</dd>
                  </div>
                  <div className="flex justify-between gap-8 font-semibold">
                    <dt>{t('app.invoices.total')}</dt>
                    <dd data-testid="invoice-total">{money(totals.total)}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </DialogBody>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => onOpenChange(false)}
            >
              {t('app.common.actions.cancel')}
            </Button>
            <Button type="submit" disabled={pending}>
              {t('app.invoices.save')}
            </Button>
          </DialogFooter>
        </AdminForm>
      </DialogContent>
    </Dialog>
  );
}
