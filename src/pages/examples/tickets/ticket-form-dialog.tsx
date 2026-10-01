import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { AdminForm } from '@/components/admin/form';
import {
  FormControl,
  FormField,
  FormFieldInput,
  FormFieldSelect,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/admin/form/form-field';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Customer, SupportTicket, SupportTicketInput, SupportTicketPatch } from '#/examples';

import { createTicketSchema, type SupportTicketFormValues } from './schema';

type TicketFormDialogProps = {
  open: boolean;
  ticket: SupportTicket | null;
  customers: Customer[];
  pending: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (value: SupportTicketInput | SupportTicketPatch) => void;
};

export function TicketFormDialog({
  open,
  ticket,
  customers,
  pending,
  onOpenChange,
  onSubmit,
}: TicketFormDialogProps) {
  const { t } = useTranslation();
  const schema = useMemo(() => createTicketSchema(t), [t]);
  const form = useForm<SupportTicketFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      customerId: '',
      subject: '',
      requesterEmail: '',
      priority: 'medium',
      assignee: '',
      slaDueAt: '',
      description: '',
    },
  });

  useEffect(() => {
    form.reset(
      ticket
        ? {
            customerId: ticket.customerId,
            subject: ticket.subject,
            requesterEmail: ticket.requesterEmail,
            priority: ticket.priority,
            assignee: ticket.assignee,
            slaDueAt: ticket.slaDueAt.slice(0, 16),
            description: ticket.description,
          }
        : {
            customerId: customers[0]?.id ?? '',
            subject: '',
            requesterEmail: '',
            priority: 'medium',
            assignee: '',
            slaDueAt: '',
            description: '',
          },
    );
  }, [customers, form, open, ticket]);

  const submit = (value: SupportTicketFormValues) =>
    onSubmit(ticket ? value : { ...value, status: 'open' as const });
  const option = (value: string) => t(`examples.common.options.${value}`);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t(ticket ? 'examples.tickets.edit' : 'examples.tickets.new')}</DialogTitle>
        </DialogHeader>
        <AdminForm form={form} onSubmit={submit}>
          <DialogBody className="grid max-h-[70vh] grid-cols-1 gap-4 overflow-y-auto sm:grid-cols-2">
            <FormFieldSelect
              control={form.control}
              name="customerId"
              label={t('examples.tickets.customer')}
              options={customers.map((customer) => ({ label: customer.name, value: customer.id }))}
              disabled={pending}
            />
            <FormFieldInput
              control={form.control}
              name="subject"
              label={t('examples.tickets.subject')}
              disabled={pending}
            />
            <FormFieldInput
              control={form.control}
              name="requesterEmail"
              type="email"
              label={t('examples.tickets.requester')}
              disabled={pending}
            />
            <FormFieldSelect
              control={form.control}
              name="priority"
              label={t('examples.tickets.priority')}
              options={['low', 'medium', 'high', 'urgent'].map((value) => ({
                label: option(value),
                value,
              }))}
              disabled={pending}
            />
            <FormFieldInput
              control={form.control}
              name="assignee"
              label={t('examples.tickets.assignee')}
              disabled={pending}
            />
            <FormFieldInput
              control={form.control}
              name="slaDueAt"
              type="datetime-local"
              label={t('examples.tickets.sla')}
              disabled={pending}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>{t('examples.tickets.descriptionField')}</FormLabel>
                  <FormControl>
                    <textarea
                      aria-label={t('examples.tickets.descriptionField')}
                      className="min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      disabled={pending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('examples.common.actions.cancel')}
            </Button>
            <Button type="submit" disabled={pending}>
              {t('examples.common.actions.save')}
            </Button>
          </DialogFooter>
        </AdminForm>
      </DialogContent>
    </Dialog>
  );
}
