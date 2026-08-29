import { type ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import roleService from '@/api/services/system/roleService';
import { AdminTable } from '@/components/admin/data-table';
import {
  Descriptions,
  descriptionsScheFlowBadgeContentStyle,
  descriptionsScheFlowContentStyle,
  descriptionsScheFlowLabelStyle,
  useDescriptionsScheFlowLayout,
} from '@/components/admin/descriptions';
import { PermissionActionBadge } from '@/components/admin/permission-action-badge';
import { StatusBadge } from '@/components/admin/status-badge';
import { DividerScheFlow } from '@/components/divider';
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
import { flattenTrees } from '@/utils/tree';

import type { RoleRead } from '#/system/role';
import { PermissionType } from '#/enum';

type PermissionRow = {
  id: string;
  label: string;
  route?: string | null;
  actions_allowed?: string[] | null;
};

export interface RoleDetailModalProps {
  role: RoleRead | null;
  show: boolean;
  onClose: () => void;
}

function formatDate(value?: string | null) {
  if (!value) return '—';
  return new Date(value).toLocaleString();
}

export function RoleDetailModal({ role, show, onClose }: RoleDetailModalProps) {
  const { t } = useTranslation();
  const layout = useDescriptionsScheFlowLayout();

  const permissionRows = useMemo(() => {
    if (!role) return [];
    const tree = roleService.getPermissionsForRole(role.name);
    return flattenTrees(tree).filter(
      (item) => item.type === PermissionType.MENU || item.type === PermissionType.CATALOGUE,
    ) as PermissionRow[];
  }, [role]);

  const permissionColumns: ColumnDef<PermissionRow>[] = useMemo(
    () => [
      {
        accessorKey: 'label',
        header: t('management.roles.permissions.columns.label'),
        cell: ({ row }) => t(row.original.label),
      },
      {
        accessorKey: 'route',
        header: t('management.roles.permissions.columns.route'),
      },
      {
        accessorKey: 'actions_allowed',
        header: t('management.roles.permissions.columns.actions'),
        cell: ({ row }) =>
          (row.original.actions_allowed ?? []).map((action) => (
            <PermissionActionBadge key={action} action={action} className="mr-1" />
          )),
      },
    ],
    [t],
  );

  return (
    <Dialog open={show} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={cn(modalContentWidthLgClass)}>
        <DialogHeader>
          <DialogTitle>
            {t('management.roles.detailTitle', {
              role: role?.label ?? role?.name ?? '',
            })}
          </DialogTitle>
        </DialogHeader>
        {role ? (
          <DialogBody className="space-y-4">
            <DividerScheFlow>{t('management.roles.forms.basicData.title')}</DividerScheFlow>
            <Descriptions
              bordered
              layout={layout}
              size="small"
              column={2}
              labelStyle={descriptionsScheFlowLabelStyle}
              contentStyle={descriptionsScheFlowContentStyle}
            >
              <Descriptions.Item label={t('management.roles.forms.basicData.name')}>
                {role.name}
              </Descriptions.Item>
              <Descriptions.Item
                label={t('management.roles.forms.basicData.label')}
                contentStyle={descriptionsScheFlowBadgeContentStyle}
              >
                <Badge variant="secondary">{role.label || role.name}</Badge>
              </Descriptions.Item>
              <Descriptions.Item
                label={t('management.roles.forms.basicData.isActive')}
                contentStyle={descriptionsScheFlowBadgeContentStyle}
              >
                <StatusBadge
                  active={role.is_active ?? false}
                  activeLabel={t('common.active')}
                  inactiveLabel={t('common.inactive')}
                />
              </Descriptions.Item>
              <Descriptions.Item label={t('management.common.tableColumns.lastUpdate')}>
                {formatDate(role.updated_at)}
              </Descriptions.Item>
              <Descriptions.Item label={t('management.roles.forms.basicData.description')} span={2}>
                {role.description || '—'}
              </Descriptions.Item>
            </Descriptions>

            <DividerScheFlow>{t('management.roles.forms.permissions.title')}</DividerScheFlow>
            <AdminTable
              columns={permissionColumns}
              data={permissionRows}
              rowKey="id"
              size="sm"
              borderVariant="descriptions"
            />
          </DialogBody>
        ) : null}
        <DialogFooter>
          <Button type="button" onClick={onClose}>
            {t('common.closeText')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
