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

import type { UserRead } from '#/system/user';

export interface UserDeleteConfirmModalProps {
  user: UserRead | null;
  show: boolean;
  isPending?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function UserDeleteConfirmModal({
  user,
  show,
  isPending = false,
  onClose,
  onConfirm,
}: UserDeleteConfirmModalProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={show} onOpenChange={(open) => !open && !isPending && onClose()}>
      <DialogContent className={cn(modalContentWidthClass)}>
        <DialogHeader>
          <DialogTitle>{t('common.deleteText')}</DialogTitle>
        </DialogHeader>
        {user ? (
          <DialogBody>
            <DialogDescription>
              {t('management.users.deleteConfirm', { name: user.name })}
            </DialogDescription>
          </DialogBody>
        ) : null}
        <DialogFooter>
          <Button type="button" variant="outline" disabled={isPending} onClick={onClose}>
            {t('common.cancelText')}
          </Button>
          <Button type="button" variant="destructive" disabled={isPending} onClick={onConfirm}>
            {t('common.deleteText')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
