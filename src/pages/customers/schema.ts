import { z } from 'zod';

type Translate = (key: string) => string;

export const createCustomerSchema = (t: Translate) =>
  z
    .object({
      name: z.string().trim().min(1, t('app.common.validation.required')).max(120),
      contactName: z.string().trim().min(1, t('app.common.validation.required')).max(120),
      email: z.string().trim().email(t('app.common.validation.invalidEmail')),
      industry: z.string().trim().min(1, t('app.common.validation.required')).max(120),
      source: z.enum(['organic', 'paid_search', 'referral', 'partner', 'outbound']),
      status: z.enum(['trialing', 'active', 'past_due', 'churned']),
      plan: z.enum(['starter', 'growth', 'scale']),
      mrrCents: z.number().int().nonnegative(),
      healthScore: z.number().int().min(0).max(100),
      seatsUsed: z.number().int().nonnegative(),
      seatsLimit: z.number().int().positive(),
    })
    .refine((value) => value.seatsUsed <= value.seatsLimit, {
      path: ['seatsUsed'],
      message: t('app.customers.seatsInvalid'),
    });

export type CustomerFormValues = z.infer<ReturnType<typeof createCustomerSchema>>;
