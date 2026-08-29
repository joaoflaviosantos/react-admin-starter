import { useTranslation } from 'react-i18next';

import ConfirmDialog from '@/components/admin/confirm-dialog';
import { IconButton, Iconify } from '@/components/icon';
import { useHasRequiredPermission } from '@/hooks/permissions/use-has-required-permission';
import { useTheme } from '@/theme/hooks';

interface TableActionsProps {
  iconSize?: number;
  permissionLabel?: string;
  isFetching?: boolean;
  className?: string;
  onDetail?: (id: string) => void;
  onUpdate?: (id: string) => void;
  onToggleActive?: (id: string, isActive: boolean) => void;
  onDelete?: (id: string) => void;
  record: {
    id: string;
    name?: string;
    is_active?: boolean;
  };
}

export default function TableActions({
  iconSize = 16,
  permissionLabel,
  isFetching = false,
  className,
  onDetail,
  onUpdate,
  onToggleActive,
  onDelete,
  record,
}: TableActionsProps) {
  const { t } = useTranslation();
  const { colorPrimary } = useTheme();
  const { canRead, canUpdate, canDelete } = useHasRequiredPermission(permissionLabel);

  return (
    <div className={`flex w-full justify-center text-gray ${className ?? ''}`}>
      {onDetail && (
        <IconButton
          disabled={isFetching || !canRead}
          className={!canRead ? 'opacity-30' : ''}
          type="button"
          title={!canRead ? t('common.noDetailPermission') : t('common.detailText')}
          onClick={() => onDetail(record.id)}
        >
          <Iconify icon="fa-solid:eye" color={colorPrimary} opacity={0.9} size={iconSize} />
        </IconButton>
      )}

      {onUpdate && (
        <IconButton
          disabled={isFetching || !canUpdate}
          type="button"
          className={!canUpdate ? 'opacity-30' : ''}
          title={!canUpdate ? t('common.noUpdatePermission') : t('common.updateText')}
          onClick={() => onUpdate(record.id)}
        >
          <Iconify icon="solar:pen-bold-duotone" opacity={0.9} size={iconSize} />
        </IconButton>
      )}

      {onToggleActive && (
        <ConfirmDialog
          disabled={isFetching || !canUpdate}
          headerTitle={record.is_active ? t('common.inactivateText') : t('common.activateText')}
          title={
            record.is_active
              ? `${t('common.inactivateText')} ${record.name}?`
              : `${t('common.activateText')} ${record.name}?`
          }
          confirmLabel={t('common.yesText')}
          cancelLabel={t('common.noText')}
          onConfirm={() => {
            if (record.is_active !== undefined) {
              onToggleActive(record.id, record.is_active);
            }
          }}
          trigger={
            <IconButton
              disabled={isFetching || !canUpdate}
              className={!canUpdate ? 'opacity-30' : ''}
              type="button"
              title={
                !canUpdate
                  ? t('common.noUpdatePermission')
                  : record.is_active
                    ? t('common.inactivateText')
                    : t('common.activateText')
              }
            >
              <Iconify
                className={record.is_active ? 'text-warning' : 'text-green'}
                icon={record.is_active ? 'mdi:cancel-bold' : 'ph:check-fat-fill'}
                opacity={1}
                size={iconSize}
              />
            </IconButton>
          }
        />
      )}

      {onDelete && (
        <IconButton
          disabled={isFetching || !canDelete}
          className={!canDelete ? 'opacity-30' : ''}
          type="button"
          title={!canDelete ? t('common.noDeletePermission') : t('common.deleteText')}
          onClick={() => onDelete(record.id)}
        >
          <Iconify
            icon="mingcute:delete-2-fill"
            opacity={0.9}
            size={iconSize}
            className="text-error"
          />
        </IconButton>
      )}
    </div>
  );
}
