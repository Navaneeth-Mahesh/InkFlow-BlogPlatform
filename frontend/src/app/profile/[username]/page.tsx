import { Suspense } from "react";
import ProfileClient from "@/components/profile/profile-client";
import { ProfileSkeleton } from "@/components/profile/profile-skeleton";

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <ProfileClient username={username} />
    </Suspense>
  );
}
