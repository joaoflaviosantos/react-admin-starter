import { z } from 'zod';

type Translate = (key: string) => string;

export const createTicketSchema = (t: Translate) =>
  z.object({
    customerId: z.string().min(1, t('app.tickets.customerRequired')),
    subject: z.string().trim().min(3, t('app.tickets.subjectRequired')).max(160),
    requesterEmail: z.string().trim().email(t('app.common.validation.invalidEmail')),
    priority: z.enum(['low', 'medium', 'high', 'urgent']),
    assignee: z.string().trim().min(2, t('app.tickets.assigneeRequired')).max(120),
    slaDueAt: z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
      message: t('app.tickets.slaRequired'),
    }),
    description: z.string().trim().min(10, t('app.tickets.descriptionRequired')).max(2000),
  });

export type SupportTicketFormValues = z.infer<ReturnType<typeof createTicketSchema>>;
