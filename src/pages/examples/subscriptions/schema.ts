import { z } from 'zod';

type Translate = (key: string) => string;

export const createSubscriptionSchema = (t: Translate) =>
  z
    .object({
      customerId: z.string().min(1, t('examples.common.validation.required')),
      plan: z.enum(['starter', 'growth', 'scale']),
      status: z.enum(['trialing', 'active', 'past_due', 'canceled']),
      interval: z.enum(['monthly', 'yearly']),
      seats: z.number().int().positive(t('examples.subscriptions.seatsInvalid')),
      unitPriceCents: z.number().int().nonnegative(t('examples.subscriptions.priceInvalid')),
      trialEndsAt: z.string().nullable(),
      currentPeriodEnd: z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
        message: t('examples.subscriptions.periodInvalid'),
      }),
      cancelAtPeriodEnd: z.boolean(),
    })
    .refine(
      (value) =>
        !value.trialEndsAt ||
        (!Number.isNaN(Date.parse(value.trialEndsAt)) &&
          value.trialEndsAt <= value.currentPeriodEnd),
      { path: ['trialEndsAt'], message: t('examples.subscriptions.periodInvalid') },
    );

export type SubscriptionFormValues = z.infer<ReturnType<typeof createSubscriptionSchema>>;
