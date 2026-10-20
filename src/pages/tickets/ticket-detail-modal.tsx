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
import type { SupportTicket } from '#/domain';

type TicketDetailModalProps = {
  ticket: SupportTicket | null;
  customerName: string;
  locale: string;
  onClose: () => void;
};

export function TicketDetailModal({
  ticket,
  customerName,
  locale,
  onClose,
}: TicketDetailModalProps) {
  const { t } = useTranslation();
  if (!ticket) return null;
  const date = new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(ticket.slaDueAt),
  );
  const option = (value: string) => t(`app.common.options.${value}`);

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('app.tickets.details')}</DialogTitle>
        </DialogHeader>
        <DialogBody className="space-y-5">
          <div>
            <h3 className="font-semibold">{ticket.subject}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{ticket.description}</p>
          </div>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              [t('app.tickets.customer'), customerName],
              [t('app.tickets.requester'), ticket.requesterEmail],
              [t('app.tickets.assignee'), ticket.assignee],
              [t('app.tickets.sla'), date],
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
            {t('app.common.actions.close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
