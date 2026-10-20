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

type SubscriptionLifecycleConfirmModalProps = {
  name: string;
  action: 'cancel' | 'reactivate' | null;
  show: boolean;
  isPending?: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function SubscriptionLifecycleConfirmModal({
  name,
  action,
  show,
  isPending = false,
  onClose,
  onConfirm,
}: SubscriptionLifecycleConfirmModalProps) {
  const { t } = useTranslation();
  const canceled = action === 'cancel';

  return (
    <Dialog open={show} onOpenChange={(open) => !open && !isPending && onClose()}>
      <DialogContent className={cn(modalContentWidthClass)}>
        <DialogHeader>
          <DialogTitle>
            {t(canceled ? 'app.subscriptions.cancelTitle' : 'app.subscriptions.reactivateTitle', {
              name,
            })}
          </DialogTitle>
        </DialogHeader>
        <DialogBody>
          <DialogDescription>
            {t(
              canceled
                ? 'app.subscriptions.cancelDescription'
                : 'app.subscriptions.reactivateDescription',
            )}
          </DialogDescription>
        </DialogBody>
        <DialogFooter>
          <Button type="button" variant="outline" disabled={isPending} onClick={onClose}>
            {t('app.common.actions.close')}
          </Button>
          <Button
            type="button"
            variant={canceled ? 'destructive' : 'default'}
            disabled={isPending}
            onClick={onConfirm}
          >
            {t(canceled ? 'app.subscriptions.cancel' : 'app.subscriptions.reactivate')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
