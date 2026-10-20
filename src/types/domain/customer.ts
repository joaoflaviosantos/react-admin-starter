export type CustomerPlan = 'starter' | 'growth' | 'scale';
export type CustomerStatus = 'trialing' | 'active' | 'past_due' | 'churned';
export type CustomerSource = 'organic' | 'paid_search' | 'referral' | 'partner' | 'outbound';

export type Customer = {
  id: string;
  name: string;
  contactName: string;
  email: string;
  industry: string;
  source: CustomerSource;
  status: CustomerStatus;
  plan: CustomerPlan;
  mrrCents: number;
  healthScore: number;
  seatsUsed: number;
  seatsLimit: number;
  createdAt: string;
  updatedAt: string;
};

export type CustomerInput = Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>;
export type CustomerPatch = Partial<CustomerInput>;
