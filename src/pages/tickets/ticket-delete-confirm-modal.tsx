import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { modalContentWidthClass } from '@/lib/overlay-surface';
import { cn } from '@/lib/utils';

import type { SupportTicket } from '#/domain';

type TicketDeleteConfirmModalProps = {
  ticket: SupportTicket | null;
  show: boolean;
  isPending?: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function TicketDeleteConfirmModal({
  ticket,
  show,
  isPending = false,
  onClose,
  onConfirm,
}: TicketDeleteConfirmModalProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={show} onOpenChange={(open) => !open && !isPending && onClose()}>
      <DialogContent className={cn(modalContentWidthClass)}>
        <DialogHeader>
          <DialogTitle>
            {ticket ? t('app.tickets.deleteTitle', { subject: ticket.subject }) : ''}
          </DialogTitle>
        </DialogHeader>
        <DialogBody>
          <DialogDescription>{t('app.common.confirm.irreversible')}</DialogDescription>
        </DialogBody>
        <DialogFooter>
          <Button type="button" variant="outline" disabled={isPending} onClick={onClose}>
            {t('app.common.actions.cancel')}
          </Button>
          <Button type="button" variant="destructive" disabled={isPending} onClick={onConfirm}>
            {t('app.common.actions.delete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
