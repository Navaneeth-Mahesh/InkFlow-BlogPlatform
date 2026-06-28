import { Skeleton } from "@/components/ui/skeleton";
import { Navbar } from "@/components/layout/navbar";

export function ProfileSkeleton() {
  return (
    <>
      <Navbar />
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row sm:items-start gap-6 mb-10">
          <Skeleton className="h-24 w-24 rounded-full shrink-0" />
          <div className="flex-1 flex flex-col gap-3">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-full max-w-xl" />
            <Skeleton className="h-4 w-2/3 max-w-xl" />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="aspect-[16/10] rounded-2xl" />)}
        </div>
      </div>
    </>
  );
}
