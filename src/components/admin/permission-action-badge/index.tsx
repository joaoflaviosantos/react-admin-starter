import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

import { PermissionActionType } from '#/enum';

const actionStyles: Record<PermissionActionType, string> = {
  [PermissionActionType.READ]:
    'border-info/50 bg-info/10 text-info hover:bg-info/15 dark:border-info/40 dark:bg-info/15',
  [PermissionActionType.CREATE]:
    'border-success/50 bg-success/10 text-success hover:bg-success/15 dark:border-success/40 dark:bg-success/15',
  [PermissionActionType.UPDATE]:
    'border-warning/50 bg-warning/10 text-warning hover:bg-warning/15 dark:border-warning/40 dark:bg-warning/15',
  [PermissionActionType.DELETE]:
    'border-red-500/50 bg-red-500/10 text-red-600 hover:bg-red-500/15 dark:border-red-400/50 dark:bg-red-500/15 dark:text-red-400',
  [PermissionActionType.EXPORT]:
    'border-primary/50 bg-primary/10 text-primary hover:bg-primary/15 dark:border-primary/40 dark:bg-primary/15',
  [PermissionActionType.SYNCRONIZE]:
    'border-violet-500/50 bg-violet-500/10 text-violet-600 hover:bg-violet-500/15 dark:border-violet-400/50 dark:bg-violet-500/15 dark:text-violet-400',
};

type PermissionActionBadgeProps = {
  action: PermissionActionType | string;
  className?: string;
};

export function PermissionActionBadge({ action, className }: PermissionActionBadgeProps) {
  const style =
    action in actionStyles
      ? actionStyles[action as PermissionActionType]
      : 'border-border bg-muted/50 text-muted-foreground';

  return (
    <Badge variant="outline" className={cn(style, className)}>
      {action}
    </Badge>
  );
}
