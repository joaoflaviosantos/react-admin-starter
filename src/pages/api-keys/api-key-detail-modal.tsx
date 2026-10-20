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
import type { ApiKey } from '#/domain';

type ApiKeyDetailModalProps = {
  apiKey: ApiKey | null;
  locale: string;
  onClose: () => void;
};

export function ApiKeyDetailModal({ apiKey, locale, onClose }: ApiKeyDetailModalProps) {
  const { t } = useTranslation();
  if (!apiKey) return null;
  const date = (value: string | null) =>
    value ? new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(value)) : '—';

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('app.apiKeys.details')}</DialogTitle>
        </DialogHeader>
        <DialogBody className="space-y-5">
          <div>
            <h3 className="font-semibold">{apiKey.name}</h3>
            <p className="mt-1 font-mono text-xs text-muted-foreground">{apiKey.prefix}</p>
          </div>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium uppercase text-muted-foreground">
                {t('app.common.fields.status')}
              </dt>
              <dd className="mt-1">
                <Badge variant={apiKey.revokedAt ? 'destructive' : 'secondary'}>
                  {t(apiKey.revokedAt ? 'app.apiKeys.revoked' : 'app.apiKeys.active')}
                </Badge>
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase text-muted-foreground">
                {t('app.apiKeys.createdAt')}
              </dt>
              <dd className="mt-1 text-sm font-medium">{date(apiKey.createdAt)}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase text-muted-foreground">
                {t('app.apiKeys.lastUsedAt')}
              </dt>
              <dd className="mt-1 text-sm font-medium">{date(apiKey.lastUsedAt)}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase text-muted-foreground">
                {t('app.apiKeys.expiresAt')}
              </dt>
              <dd className="mt-1 text-sm font-medium">{date(apiKey.expiresAt)}</dd>
            </div>
          </dl>
          <div>
            <h4 className="text-xs font-medium uppercase text-muted-foreground">
              {t('app.apiKeys.scopes')}
            </h4>
            <div className="mt-2 flex flex-wrap gap-2">
              {apiKey.scopes.map((scope) => (
                <Badge key={scope} variant="outline">
                  {t(
                    `app.apiKeys.scope${scope
                      .split(':')
                      .map((part) => part[0]!.toUpperCase() + part.slice(1))
                      .join('')}`,
                  )}
                </Badge>
              ))}
            </div>
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
