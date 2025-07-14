
import { Skeleton } from '@/components/ui/skeleton';

export const PageSkeleton = () => (
  <div className="p-6 space-y-6 animate-pulse">
    <div className="text-center py-8">
      <Skeleton className="h-10 w-3/4 mx-auto mb-2" />
      <Skeleton className="h-6 w-1/2 mx-auto mb-6" />
      <div className="max-w-2xl mx-auto relative">
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Skeleton className="h-28" />
      <Skeleton className="h-28" />
      <Skeleton className="h-28" />
    </div>
    <Skeleton className="h-96" />
    <Skeleton className="h-64" />
  </div>
);
