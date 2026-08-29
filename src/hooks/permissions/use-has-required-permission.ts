import { useUserPermission } from '@/store/userStore';

import { PermissionActionType } from '#/enum';

export const useHasRequiredPermission = (label: string | undefined) => {
  const permissions = useUserPermission();

  if (!permissions || permissions.length === 0) {
    return Object.fromEntries(
      Object.values(PermissionActionType).map((action) => [action.toLowerCase(), false]),
    ) as Record<string, boolean>;
  }

  const hasPermission = (requiredAction: string): boolean => {
    const checkPermission = (nodes: typeof permissions): boolean =>
      nodes.some((permission) => {
        if (permission.label === label && permission.actions_allowed?.includes(requiredAction)) {
          return true;
        }
        if (permission.children?.length) {
          return checkPermission(permission.children);
        }
        return false;
      });

    return checkPermission(permissions);
  };

  return {
    canCreate: hasPermission(PermissionActionType.CREATE),
    canRead: hasPermission(PermissionActionType.READ),
    canUpdate: hasPermission(PermissionActionType.UPDATE),
    canDelete: hasPermission(PermissionActionType.DELETE),
    canExport: hasPermission(PermissionActionType.EXPORT),
    canSynchronize: hasPermission(PermissionActionType.SYNCRONIZE),
  };
};
