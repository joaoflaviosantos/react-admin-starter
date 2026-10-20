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

import type { ApiKey } from '#/domain';

type ApiKeyRevokeConfirmModalProps = {
  apiKey: ApiKey | null;
  show: boolean;
  isPending?: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function ApiKeyRevokeConfirmModal({
  apiKey,
  show,
  isPending = false,
  onClose,
  onConfirm,
}: ApiKeyRevokeConfirmModalProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={show} onOpenChange={(open) => !open && !isPending && onClose()}>
      <DialogContent className={cn(modalContentWidthClass)}>
        <DialogHeader>
          <DialogTitle>
            {apiKey ? t('app.apiKeys.revokeTitle', { name: apiKey.name }) : ''}
          </DialogTitle>
        </DialogHeader>
        <DialogBody>
          <DialogDescription>{t('app.apiKeys.revokeDescription')}</DialogDescription>
        </DialogBody>
        <DialogFooter>
          <Button type="button" variant="outline" disabled={isPending} onClick={onClose}>
            {t('app.common.actions.cancel')}
          </Button>
          <Button type="button" variant="destructive" disabled={isPending} onClick={onConfirm}>
            {t('app.apiKeys.revoke')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
