import { useTranslation } from 'react-i18next';

import {
  Descriptions,
  descriptionsScheFlowBadgeContentStyle,
  descriptionsScheFlowContentStyle,
  descriptionsScheFlowLabelStyle,
  useDescriptionsScheFlowLayout,
} from '@/components/admin/descriptions';
import { DividerProject } from '@/components/divider';
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
import { modalContentWidthLgClass } from '@/lib/overlay-surface';
import { cn } from '@/lib/utils';

import type { AuditLog } from '#/domain';

import { actionLabel, resourceLabel } from './audit-log-labels';

type AuditLogDetailModalProps = {
  event: AuditLog | null;
  onClose: () => void;
};

export function AuditLogDetailModal({ event, onClose }: AuditLogDetailModalProps) {
  const { t, i18n } = useTranslation();
  const layout = useDescriptionsScheFlowLayout();
  if (!event) return null;
  const date = new Intl.DateTimeFormat(i18n.language === 'pt_BR' ? 'pt-BR' : 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(event.createdAt));

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={cn(modalContentWidthLgClass)}>
        <DialogHeader>
          <DialogTitle>{t('app.auditLogs.details')}</DialogTitle>
        </DialogHeader>
        <DialogBody className="space-y-4">
          <DividerProject>{t('app.auditLogs.sections.event')}</DividerProject>
          <Descriptions
            bordered
            layout={layout}
            size="small"
            column={2}
            labelStyle={descriptionsScheFlowLabelStyle}
            contentStyle={descriptionsScheFlowContentStyle}
          >
            <Descriptions.Item label={t('app.auditLogs.summary')} span={2}>
              {event.summary}
            </Descriptions.Item>
            <Descriptions.Item label={t('app.auditLogs.date')}>{date}</Descriptions.Item>
            <Descriptions.Item
              label={t('app.auditLogs.action')}
              contentStyle={descriptionsScheFlowBadgeContentStyle}
            >
              <Badge variant="outline" title={event.action}>
                {actionLabel(event.action, t)}
              </Badge>
            </Descriptions.Item>
            <Descriptions.Item label={t('app.auditLogs.actor')} span={2}>
              {event.actorName} · {event.actorEmail}
            </Descriptions.Item>
            <Descriptions.Item label={t('app.auditLogs.resource')} span={2}>
              <span className="flex flex-col">
                <span>{resourceLabel(event.resourceType, t)}</span>
                <span className="font-mono text-xs text-muted-foreground">{event.resourceId}</span>
              </span>
            </Descriptions.Item>
          </Descriptions>

          <DividerProject>{t('app.auditLogs.sections.request')}</DividerProject>
          <Descriptions
            bordered
            layout={layout}
            size="small"
            column={2}
            labelStyle={descriptionsScheFlowLabelStyle}
            contentStyle={descriptionsScheFlowContentStyle}
          >
            <Descriptions.Item label={t('app.auditLogs.ipAddress')}>
              {event.ipAddress}
            </Descriptions.Item>
            <Descriptions.Item label={t('app.auditLogs.userAgent')} span={2}>
              <span className="break-words">{event.userAgent}</span>
            </Descriptions.Item>
          </Descriptions>

          <DividerProject>{t('app.auditLogs.metadata')}</DividerProject>
          <pre className="max-h-48 overflow-auto rounded-md border bg-muted p-3 text-xs">
            {JSON.stringify(event.metadata, null, 2)}
          </pre>
        </DialogBody>
        <DialogFooter>
          <Button type="button" onClick={onClose}>
            {t('common.closeText')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
