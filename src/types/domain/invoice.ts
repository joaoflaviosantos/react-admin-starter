export type InvoiceStatus = 'draft' | 'sent';

export type InvoiceItemInput = { description: string; quantity: number; unitPrice: number };
export type InvoiceItem = InvoiceItemInput & { id: string; lineTotal: number };

export type InvoiceInput = {
  number: string;
  label: string;
  issueDate: string;
  dueDate: string;
  customer: string;
  customerEmail: string;
  billing: string;
  currency: string;
  paymentMethod: string;
  notes?: string;
  items: InvoiceItemInput[];
  taxRateBps: number;
  discountRateBps: number;
  shippingAmount: number;
};

export type InvoicePatch = Partial<InvoiceInput>;

export type Invoice = Omit<InvoiceInput, 'items'> & {
  id: string;
  created_at: string;
  updated_at: string;
  items: InvoiceItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  status: InvoiceStatus;
  sentAt?: string;
};

export type InvoiceTotals = Pick<
  Invoice,
  'items' | 'subtotal' | 'taxAmount' | 'discountAmount' | 'total'
>;
