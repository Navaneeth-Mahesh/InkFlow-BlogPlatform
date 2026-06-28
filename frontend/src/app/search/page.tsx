import { Suspense } from "react";
import SearchClient from "@/components/shared/search-client";
import { SearchSkeleton } from "@/components/shared/search-skeleton";

export const metadata = { title: "Explore — InkFlow" };

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchSkeleton />}>
      <SearchClient />
    </Suspense>
  );
}
