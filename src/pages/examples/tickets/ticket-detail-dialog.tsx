import { useTranslation } from 'react-i18next';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { SupportTicket } from '#/examples';

type TicketDetailDialogProps = {
  ticket: SupportTicket | null;
  customerName: string;
  locale: string;
  onClose: () => void;
};

export function TicketDetailDialog({
  ticket,
  customerName,
  locale,
  onClose,
}: TicketDetailDialogProps) {
  const { t } = useTranslation();
  if (!ticket) return null;
  const date = new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(ticket.slaDueAt),
  );
  const option = (value: string) => t(`examples.common.options.${value}`);

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('examples.tickets.details')}</DialogTitle>
        </DialogHeader>
        <DialogBody className="space-y-5">
          <div>
            <h3 className="font-semibold">{ticket.subject}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{ticket.description}</p>
          </div>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              [t('examples.tickets.customer'), customerName],
              [t('examples.tickets.requester'), ticket.requesterEmail],
              [t('examples.tickets.assignee'), ticket.assignee],
              [t('examples.tickets.sla'), date],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs font-medium uppercase text-muted-foreground">{label}</dt>
                <dd className="mt-1 text-sm font-medium">{value}</dd>
              </div>
            ))}
          </dl>
          <div className="flex gap-2">
            <Badge variant="outline">{option(ticket.priority)}</Badge>
            <Badge variant={ticket.status === 'resolved' ? 'default' : 'secondary'}>
              {option(ticket.status)}
            </Badge>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            {t('examples.common.actions.close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
