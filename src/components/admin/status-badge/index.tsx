import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type StatusBadgeProps = {
  active: boolean;
  activeLabel: string;
  inactiveLabel: string;
  className?: string;
};

export function StatusBadge({ active, activeLabel, inactiveLabel, className }: StatusBadgeProps) {
  return (
    <Badge
      variant={active ? 'default' : 'destructive'}
      className={cn(active && 'bg-success hover:bg-success/90', className)}
    >
      {active ? activeLabel : inactiveLabel}
    </Badge>
  );
}
