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

type InvoiceDeleteConfirmModalProps = {
  count: number;
  show: boolean;
  isPending?: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function InvoiceDeleteConfirmModal({
  count,
  show,
  isPending = false,
  onClose,
  onConfirm,
}: InvoiceDeleteConfirmModalProps) {
  const { t } = useTranslation();
  const title =
    count > 1 ? t('app.invoices.deleteSelectedTitle', { count }) : t('app.invoices.deleteTitle');

  return (
    <Dialog open={show} onOpenChange={(open) => !open && !isPending && onClose()}>
      <DialogContent className={cn(modalContentWidthClass)}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
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
