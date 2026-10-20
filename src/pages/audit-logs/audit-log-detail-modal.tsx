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
import type { AuditLog } from '#/domain';

import { actionLabel, resourceLabel } from './audit-log-labels';

type AuditLogDetailModalProps = {
  event: AuditLog | null;
  onClose: () => void;
};

export function AuditLogDetailModal({ event, onClose }: AuditLogDetailModalProps) {
  const { t, i18n } = useTranslation();
  if (!event) return null;
  const date = new Intl.DateTimeFormat(i18n.language === 'pt_BR' ? 'pt-BR' : 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(event.createdAt));

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('app.auditLogs.details')}</DialogTitle>
        </DialogHeader>
        <DialogBody className="space-y-5">
          <div>
            <h3 className="font-semibold">{event.summary}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{date}</p>
          </div>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium uppercase text-muted-foreground">
                {t('app.auditLogs.actor')}
              </dt>
              <dd className="mt-1 text-sm">
                {event.actorName} · {event.actorEmail}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase text-muted-foreground">
                {t('app.auditLogs.action')}
              </dt>
              <dd className="mt-1 text-sm">
                <Badge variant="outline" title={event.action}>
                  {actionLabel(event.action, t)}
                </Badge>
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase text-muted-foreground">
                {t('app.auditLogs.resource')}
              </dt>
              <dd className="mt-1 min-w-0 text-sm">
                <div className="truncate">{resourceLabel(event.resourceType, t)}</div>
                <div className="truncate font-mono text-xs text-muted-foreground">
                  {event.resourceId}
                </div>
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase text-muted-foreground">
                {t('app.auditLogs.ipAddress')}
              </dt>
              <dd className="mt-1 text-sm">{event.ipAddress}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs font-medium uppercase text-muted-foreground">
                {t('app.auditLogs.userAgent')}
              </dt>
              <dd className="mt-1 break-words text-sm">{event.userAgent}</dd>
            </div>
          </dl>
          <div>
            <h4 className="text-xs font-medium uppercase text-muted-foreground">
              {t('app.auditLogs.metadata')}
            </h4>
            <pre className="mt-2 max-h-48 overflow-auto rounded-md bg-muted p-3 text-xs">
              {JSON.stringify(event.metadata, null, 2)}
            </pre>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button type="button" onClick={onClose}>
            {t('app.common.actions.close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
