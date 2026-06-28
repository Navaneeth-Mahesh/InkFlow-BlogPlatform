import { Navbar } from "@/components/layout/navbar";
import { Skeleton } from "@/components/ui/skeleton";

export function SearchSkeleton() {
  return (
    <>
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <Skeleton className="h-9 w-72 mb-3" />
        <Skeleton className="h-5 w-96 mb-8" />
        <Skeleton className="h-14 max-w-2xl rounded-2xl mb-7" />
        <Skeleton className="h-10 w-64 rounded-full mb-7" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="aspect-[16/10] rounded-2xl" />)}
        </div>
      </div>
    </>
  );
}
