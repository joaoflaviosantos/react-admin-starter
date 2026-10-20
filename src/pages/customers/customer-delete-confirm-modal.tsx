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

import type { Customer } from '#/domain';

type CustomerDeleteConfirmModalProps = {
  customer: Customer | null;
  show: boolean;
  isPending?: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function CustomerDeleteConfirmModal({
  customer,
  show,
  isPending = false,
  onClose,
  onConfirm,
}: CustomerDeleteConfirmModalProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={show} onOpenChange={(open) => !open && !isPending && onClose()}>
      <DialogContent className={cn(modalContentWidthClass)}>
        <DialogHeader>
          <DialogTitle>
            {customer ? t('app.customers.archiveTitle', { name: customer.name }) : ''}
          </DialogTitle>
        </DialogHeader>
        <DialogBody>
          <DialogDescription>{t('app.customers.archiveDescription')}</DialogDescription>
        </DialogBody>
        <DialogFooter>
          <Button type="button" variant="outline" disabled={isPending} onClick={onClose}>
            {t('app.common.actions.cancel')}
          </Button>
          <Button type="button" variant="destructive" disabled={isPending} onClick={onConfirm}>
            {t('app.customers.archive')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
