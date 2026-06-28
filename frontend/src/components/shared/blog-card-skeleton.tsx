import { Skeleton } from "@/components/ui/skeleton";

export function BlogCardSkeleton() {
  return (
    <div className="flex flex-col rounded-2xl border border-border bg-surface overflow-hidden h-full">
      <Skeleton className="aspect-[16/10] w-full rounded-none" />
      <div className="p-5 flex flex-col gap-3">
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex items-center gap-2.5 mt-2">
          <Skeleton className="h-7 w-7 rounded-full" />
          <Skeleton className="h-3.5 w-24" />
        </div>
      </div>
    </div>
  );
}

export function BlogCardSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <BlogCardSkeleton key={i} />
      ))}
    </div>
  );
}
