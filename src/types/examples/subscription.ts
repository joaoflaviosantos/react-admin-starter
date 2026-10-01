import type { CustomerPlan } from './customer';

export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'canceled';
export type SubscriptionInterval = 'monthly' | 'yearly';

export type Subscription = {
  id: string;
  customerId: string;
  plan: CustomerPlan;
  status: SubscriptionStatus;
  interval: SubscriptionInterval;
  seats: number;
  unitPriceCents: number;
  trialEndsAt: string | null;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
  updatedAt: string;
};

export type SubscriptionInput = Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>;
export type SubscriptionPatch = Partial<SubscriptionInput>;

export type SubscriptionStatusCounts = Record<SubscriptionStatus, number> & { all: number };
