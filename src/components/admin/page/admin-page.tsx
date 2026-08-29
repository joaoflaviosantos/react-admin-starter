import { cn } from '@/lib/utils';

type AdminPageProps = {
  children: React.ReactNode;
  className?: string;
};

export function AdminPage({ children, className }: AdminPageProps) {
  return <div className={cn('pb-4', className)}>{children}</div>;
}
