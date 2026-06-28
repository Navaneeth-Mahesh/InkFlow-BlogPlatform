import { FileText, Heart, Bookmark, Users } from "lucide-react";
import { formatNumber } from "@/lib/utils";

export function ProfileStats({
  postsCount,
  totalLikes,
  followers,
  bookmarksCount,
}: {
  postsCount: number;
  totalLikes: number;
  followers: number;
  bookmarksCount: number;
}) {
  const stats = [
    { icon: FileText, label: "Published", value: postsCount },
    { icon: Heart, label: "Total likes", value: formatNumber(totalLikes) },
    { icon: Users, label: "Followers", value: formatNumber(followers) },
    { icon: Bookmark, label: "Saved posts", value: bookmarksCount },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {stats.map((s) => (
        <div key={s.label} className="rounded-2xl border border-border bg-surface p-5 flex flex-col gap-2">
          <s.icon className="h-4 w-4 text-accent-violet" />
          <p className="font-display text-2xl font-semibold text-text-primary">{s.value}</p>
          <p className="text-xs text-text-tertiary">{s.label}</p>
        </div>
      ))}
    </div>
  );
}
