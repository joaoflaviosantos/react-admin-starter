import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import userService from '@/api/services/system/userService';
import { StatusBadge } from '@/components/admin/status-badge';
import {
  Descriptions,
  descriptionsScheFlowBadgeContentStyle,
  descriptionsScheFlowContentStyle,
  descriptionsScheFlowLabelStyle,
  useDescriptionsScheFlowLayout,
} from '@/components/admin/descriptions';
import { DividerScheFlow } from '@/components/divider';
import { CircleLoading } from '@/components/loading';
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

export interface UserDetailModalProps {
  userId: string | null;
  show: boolean;
  onClose: () => void;
}

const LANGUAGE_LABELS: Record<string, string> = {
  pt_BR: 'Português (Brasil)',
  en_US: 'English (US)',
};

function formatDate(value?: string | null) {
  if (!value) return '—';
  return new Date(value).toLocaleString();
}

function formatLanguage(value?: string | null) {
  if (!value) return '—';
  return LANGUAGE_LABELS[value] ?? value;
}

export function UserDetailModal({ userId, show, onClose }: UserDetailModalProps) {
  const { t } = useTranslation();
  const layout = useDescriptionsScheFlowLayout();

  const { data: user, isFetching } = useQuery({
    queryKey: ['management-system-user', userId],
    queryFn: () => userService.getUserById(userId || ''),
    enabled: !!userId && show,
  });

  return (
    <Dialog open={show} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={cn(modalContentWidthLgClass)}>
        <DialogHeader>
          <DialogTitle>{t('management.users.detailTitle')}</DialogTitle>
        </DialogHeader>
        <DialogBody>
          {isFetching ? (
            <div className="flex justify-center py-10">
              <CircleLoading />
            </div>
          ) : !user ? (
            <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
              {t('common.notFound')}
            </div>
          ) : (
            <div className="space-y-4">
              <DividerScheFlow>{t('management.users.forms.basicData.index')}</DividerScheFlow>
              <Descriptions
                bordered
                layout={layout}
                size="small"
                column={2}
                labelStyle={descriptionsScheFlowLabelStyle}
                contentStyle={descriptionsScheFlowContentStyle}
              >
                <Descriptions.Item label={t('management.users.forms.basicData.name')}>
                  {user.name}
                </Descriptions.Item>
                <Descriptions.Item label={t('management.users.forms.basicData.email')}>
                  {user.email}
                </Descriptions.Item>
                <Descriptions.Item label={t('management.users.forms.basicData.defaultLanguage')}>
                  {formatLanguage(user.default_language)}
                </Descriptions.Item>
                <Descriptions.Item
                  label={t('management.users.forms.securityData.role')}
                  contentStyle={descriptionsScheFlowBadgeContentStyle}
                >
                  <Badge variant="secondary">{user.role_label || user.role}</Badge>
                </Descriptions.Item>
                <Descriptions.Item
                  label={t('management.users.forms.securityData.isActive')}
                  contentStyle={descriptionsScheFlowBadgeContentStyle}
                >
                  <StatusBadge
                    active={user.is_active ?? false}
                    activeLabel={t('common.active')}
                    inactiveLabel={t('common.inactive')}
                  />
                </Descriptions.Item>
                <Descriptions.Item label={t('management.common.tableColumns.lastUpdate')}>
                  {formatDate(user.updated_at)}
                </Descriptions.Item>
              </Descriptions>
            </div>
          )}
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
