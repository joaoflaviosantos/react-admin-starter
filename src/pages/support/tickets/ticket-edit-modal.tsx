import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import ticketService from '@/api/services/domains/ticketService';
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
import { DividerProject } from '@/components/divider';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { modalContentWidthLgClass } from '@/lib/overlay-surface';
import { appToast } from '@/lib/toast';
import { cn } from '@/lib/utils';

import type { Customer, SupportTicket, SupportTicketPatch } from '#/domain';
import { createTicketSchema, type SupportTicketFormValues } from './schema';

const emptyTicket: SupportTicketFormValues = {
  customerId: '',
  subject: '',
  requesterEmail: '',
  priority: 'medium',
  assignee: '',
  slaDueAt: '',
  description: '',
};

type TicketEditModalProps = {
  ticket: SupportTicket | null;
  customers: Customer[];
  show: boolean;
  onClose: () => void;
};

export function TicketEditModal({ ticket, customers, show, onClose }: TicketEditModalProps) {
  const { t } = useTranslation();
  const option = (value: string) => t(`app.common.options.${value}`);
  const queryClient = useQueryClient();
  const schema = useMemo(() => createTicketSchema(t), [t]);
  const form = useForm<SupportTicketFormValues>({
    resolver: zodResolver(schema),
    defaultValues: emptyTicket,
  });

  useEffect(() => {
    if (show && ticket) {
      form.reset({
        customerId: ticket.customerId,
        subject: ticket.subject,
        requesterEmail: ticket.requesterEmail,
        priority: ticket.priority,
        assignee: ticket.assignee,
        slaDueAt: ticket.slaDueAt.slice(0, 16),
        description: ticket.description,
      });
    }
  }, [form, show, ticket]);

  const mutation = useMutation({
    mutationFn: (payload: SupportTicketPatch) =>
      ticketService.updateTicket(ticket?.id ?? '', payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['domains', 'tickets'] });
      appToast.success(t('app.tickets.saved'));
      onClose();
    },
    onError: () => appToast.error(t('app.tickets.saveError')),
  });

  return (
    <Dialog open={show} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={cn('max-h-[90vh]', modalContentWidthLgClass)}>
        <DialogHeader>
          <DialogTitle>{t('app.tickets.edit')}</DialogTitle>
        </DialogHeader>
        <AdminForm
          form={form}
          onSubmit={(value) => mutation.mutate(value)}
          className="flex flex-col"
        >
          <DialogBody className="max-h-[65vh] space-y-4 overflow-y-auto">
            <DividerProject>{t('app.tickets.sections.request')}</DividerProject>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormFieldSelect
                control={form.control}
                name="customerId"
                label={t('app.tickets.customer')}
                options={customers.map((customer) => ({
                  label: customer.name,
                  value: customer.id,
                }))}
                disabled={mutation.isPending}
              />
              <FormFieldInput
                control={form.control}
                name="subject"
                label={t('app.tickets.subject')}
                disabled={mutation.isPending}
              />
              <FormFieldInput
                control={form.control}
                name="requesterEmail"
                type="email"
                label={t('app.tickets.requester')}
                className="sm:col-span-2"
                disabled={mutation.isPending}
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
                        disabled={mutation.isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DividerProject>{t('app.tickets.sections.handling')}</DividerProject>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormFieldSelect
                control={form.control}
                name="priority"
                label={t('app.tickets.priority')}
                options={['low', 'medium', 'high', 'urgent'].map((value) => ({
                  label: option(value),
                  value,
                }))}
                disabled={mutation.isPending}
              />
              <FormFieldInput
                control={form.control}
                name="assignee"
                label={t('app.tickets.assignee')}
                disabled={mutation.isPending}
              />
              <FormFieldInput
                control={form.control}
                name="slaDueAt"
                type="datetime-local"
                label={t('app.tickets.sla')}
                className="sm:col-span-2"
                disabled={mutation.isPending}
              />
            </div>
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="outline" disabled={mutation.isPending} onClick={onClose}>
              {t('app.common.actions.cancel')}
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {t('app.common.actions.save')}
            </Button>
          </DialogFooter>
        </AdminForm>
      </DialogContent>
    </Dialog>
  );
}
