import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { appToast } from '@/lib/toast';

type ApiKeySecretModalProps = {
  secret: string | null;
  onClose: () => void;
};

export function ApiKeySecretModal({ secret, onClose }: ApiKeySecretModalProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  if (!secret) return null;
  const copy = async () => {
    await navigator.clipboard?.writeText(secret);
    setCopied(true);
    appToast.success(t('app.apiKeys.copied'));
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('app.apiKeys.secretTitle')}</DialogTitle>
        </DialogHeader>
        <DialogBody className="space-y-4">
          <p className="text-sm text-muted-foreground">{t('app.apiKeys.secretOnce')}</p>
          <code className="block break-all rounded-md bg-muted p-3 text-sm">{secret}</code>
        </DialogBody>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={copy}>
            {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
            {copied ? t('app.apiKeys.copied') : t('app.apiKeys.copy')}
          </Button>
          <Button type="button" onClick={onClose}>
            {t('app.common.actions.close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
