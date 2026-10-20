export type DomainEntity = {
  id: string;
  created_at: string;
  updated_at: string;
};

export type { ApiKey, ApiKeyCreateResponse, ApiKeyInput, ApiKeyScope } from './api-key';
export type { AuditLog, AuditLogMetadata } from './audit-log';
export type {
  DashboardAcquisition,
  DashboardKpi,
  DashboardPeriod,
  DashboardPlanDistribution,
  DashboardResponse,
  DashboardRiskAccount,
  DashboardSectionName,
  DashboardSectionState,
  DashboardSeriesPoint,
} from './dashboard';
export type {
  Customer,
  CustomerInput,
  CustomerPatch,
  CustomerPlan,
  CustomerSource,
  CustomerStatus,
} from './customer';

export type {
  Invoice,
  InvoiceInput,
  InvoiceItem,
  InvoiceItemInput,
  InvoicePatch,
  InvoiceStatus,
  InvoiceTotals,
} from './invoice';
export type {
  Subscription,
  SubscriptionInput,
  SubscriptionInterval,
  SubscriptionPatch,
  SubscriptionStatus,
  SubscriptionStatusCounts,
} from './subscription';
export type {
  SupportTicket,
  SupportTicketCounts,
  SupportTicketInput,
  SupportTicketPatch,
  SupportTicketPriority,
  SupportTicketSla,
  SupportTicketStatus,
} from './support-ticket';
