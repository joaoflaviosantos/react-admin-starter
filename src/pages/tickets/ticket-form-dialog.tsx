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
import type { Customer, SupportTicket, SupportTicketInput, SupportTicketPatch } from '#/domain';

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
  const option = (value: string) => t(`app.common.options.${value}`);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t(ticket ? 'app.tickets.edit' : 'app.tickets.new')}</DialogTitle>
        </DialogHeader>
        <AdminForm form={form} onSubmit={submit}>
          <DialogBody className="grid max-h-[70vh] grid-cols-1 gap-4 overflow-y-auto sm:grid-cols-2">
            <FormFieldSelect
              control={form.control}
              name="customerId"
              label={t('app.tickets.customer')}
              options={customers.map((customer) => ({ label: customer.name, value: customer.id }))}
              disabled={pending}
            />
            <FormFieldInput
              control={form.control}
              name="subject"
              label={t('app.tickets.subject')}
              disabled={pending}
            />
            <FormFieldInput
              control={form.control}
              name="requesterEmail"
              type="email"
              label={t('app.tickets.requester')}
              disabled={pending}
            />
            <FormFieldSelect
              control={form.control}
              name="priority"
              label={t('app.tickets.priority')}
              options={['low', 'medium', 'high', 'urgent'].map((value) => ({
                label: option(value),
                value,
              }))}
              disabled={pending}
            />
            <FormFieldInput
              control={form.control}
              name="assignee"
              label={t('app.tickets.assignee')}
              disabled={pending}
            />
            <FormFieldInput
              control={form.control}
              name="slaDueAt"
              type="datetime-local"
              label={t('app.tickets.sla')}
              disabled={pending}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>{t('app.tickets.descriptionField')}</FormLabel>
                  <FormControl>
                    <textarea
                      aria-label={t('app.tickets.descriptionField')}
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
              {t('app.common.actions.cancel')}
            </Button>
            <Button type="submit" disabled={pending}>
              {t('app.common.actions.save')}
            </Button>
          </DialogFooter>
        </AdminForm>
      </DialogContent>
    </Dialog>
  );
}
