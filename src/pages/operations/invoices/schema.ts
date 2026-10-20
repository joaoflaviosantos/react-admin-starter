import { z } from 'zod';

import i18n from '@/locales/i18n';

type Translate = (key: string) => string;

export const createInvoiceSchema = (t: Translate) => {
  const itemSchema = z.object({
    description: z.string().trim().min(1, t('app.invoices.itemDescriptionRequired')).max(200),
    quantity: z.number().positive(t('app.invoices.quantityPositive')),
    unitPrice: z.number().int().nonnegative(t('app.invoices.priceNonnegative')),
  });
  return z
    .object({
      number: z.string().trim().min(1, t('app.invoices.numberRequired')).max(60),
      label: z.string().trim().min(1, t('app.invoices.labelRequired')).max(120),
      issueDate: z.string().date(t('app.invoices.issueDateRequired')),
      dueDate: z.string().date(t('app.invoices.dueDateRequired')),
      customer: z.string().trim().min(1, t('app.invoices.customerRequired')).max(120),
      customerEmail: z.string().trim().email(t('app.invoices.customerEmailInvalid')),
      billing: z.string().trim().min(1, t('app.invoices.billingRequired')).max(500),
      currency: z.string().trim().length(3),
      paymentMethod: z.string().trim().min(1, t('app.invoices.paymentRequired')).max(120),
      notes: z.string().max(1000),
      items: z.array(itemSchema).min(1, t('app.invoices.itemRequired')),
      taxRateBps: z.number().int().min(0).max(10000),
      discountRateBps: z.number().int().min(0).max(10000),
      shippingAmount: z.number().int().nonnegative(),
    })
    .refine((value) => value.dueDate >= value.issueDate, {
      path: ['dueDate'],
      message: t('app.invoices.dateOrderInvalid'),
    });
};

export const invoiceSchema = createInvoiceSchema((key) => i18n.t(key, { lng: 'en_US' }));

export type InvoiceFormValues = z.infer<typeof invoiceSchema>;
