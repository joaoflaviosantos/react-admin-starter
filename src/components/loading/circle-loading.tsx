import { Skeleton } from '@/components/ui/skeleton';

export function CircleLoading() {
  return (
    <div className="mt-[-4.5rem] flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
  );
}
