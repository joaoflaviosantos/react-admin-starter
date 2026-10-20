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

import type { ApiKey } from '#/domain';

type ApiKeyDetailModalProps = {
  apiKey: ApiKey | null;
  locale: string;
  onClose: () => void;
};

export function ApiKeyDetailModal({ apiKey, locale, onClose }: ApiKeyDetailModalProps) {
  const { t } = useTranslation();
  const layout = useDescriptionsScheFlowLayout();
  if (!apiKey) return null;
  const date = (value: string | null) =>
    value ? new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(value)) : '—';

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={cn(modalContentWidthLgClass)}>
        <DialogHeader>
          <DialogTitle>{t('app.apiKeys.details')}</DialogTitle>
        </DialogHeader>
        <DialogBody className="space-y-4">
          <DividerProject>{t('app.apiKeys.sections.key')}</DividerProject>
          <Descriptions
            bordered
            layout={layout}
            size="small"
            column={2}
            labelStyle={descriptionsScheFlowLabelStyle}
            contentStyle={descriptionsScheFlowContentStyle}
          >
            <Descriptions.Item label={t('app.apiKeys.name')} span={2}>
              {apiKey.name}
            </Descriptions.Item>
            <Descriptions.Item label={t('app.apiKeys.prefix')}>
              <span className="font-mono text-xs">{apiKey.prefix}</span>
            </Descriptions.Item>
            <Descriptions.Item
              label={t('app.common.fields.status')}
              contentStyle={descriptionsScheFlowBadgeContentStyle}
            >
              <Badge variant={apiKey.revokedAt ? 'destructive' : 'secondary'}>
                {t(apiKey.revokedAt ? 'app.apiKeys.revoked' : 'app.apiKeys.active')}
              </Badge>
            </Descriptions.Item>
          </Descriptions>

          <DividerProject>{t('app.apiKeys.sections.access')}</DividerProject>
          <Descriptions
            bordered
            layout={layout}
            size="small"
            column={2}
            labelStyle={descriptionsScheFlowLabelStyle}
            contentStyle={descriptionsScheFlowContentStyle}
          >
            <Descriptions.Item label={t('app.apiKeys.createdAt')}>
              {date(apiKey.createdAt)}
            </Descriptions.Item>
            <Descriptions.Item label={t('app.apiKeys.lastUsedAt')}>
              {date(apiKey.lastUsedAt)}
            </Descriptions.Item>
            <Descriptions.Item label={t('app.apiKeys.expiresAt')} span={2}>
              {date(apiKey.expiresAt)}
            </Descriptions.Item>
            <Descriptions.Item label={t('app.apiKeys.scopes')} span={2}>
              <span className="flex flex-wrap gap-2">
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
              </span>
            </Descriptions.Item>
          </Descriptions>
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
